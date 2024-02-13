import { useCallback, useEffect, useRef, useState } from 'react';
import { useIcons } from './hooks/useIcons';
import { audioFileToArrayBuffer, formatAudioDuration } from './functions';

let requestFramID;

const App = () => {
  const { PlayIcon, PauseIcon, SeekBack5Icon, SeekNext5Icon, SipnnerIcon } = useIcons();
  const { current: audioContext } = useRef(new AudioContext());
  const audioRef = useRef(new Audio());
  const [audioFile, setAudioFile] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const fn = useCallback(() => {
    document.getElementById('audio-start-duration').innerText = formatAudioDuration(audioRef.current.currentTime);
    requestFramID = window.requestAnimationFrame(fn);
  }, []);

  const handlePlayAudio = (playAtTime) => {
    audioRef.current.currentTime = playAtTime;
    setCurrentTime(playAtTime);
    audioRef.current.play();
  };

  const handlePauseAudio = () => {
    audioRef.current.pause();
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadAudioFile = useCallback(
    async (file) => {
      setIsLoadingFile(true);
      try {
        const arrayBuffer = await audioFileToArrayBuffer({ file });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioRef.current.src = URL.createObjectURL(file);
        audioRef.current.onloadedmetadata = () => {
          document.getElementById('audio-start-duration').innerText = '00:00';
          setAudioData(audioBuffer);
        };
        audioRef.current.onplay = () => {
          fn();
          setIsPlaying(true);
        };
        audioRef.current.onpause = () => {
          cancelAnimationFrame(requestFramID);
          setIsPlaying(false);
        };
        audioRef.current.onended = () => {
          document.getElementById('audio-start-duration').innerText = '00:00';
          cancelAnimationFrame(requestFramID);
          setIsPlaying(false);
        };
      } catch (error) {
        console.log('Error while loading audio file', { error });
      }
      setIsLoadingFile(false);
    },
    [audioContext, fn]
  );

  useEffect(() => {
    if (audioFile) {
      handleLoadAudioFile(audioFile);
    }
    return () => {
      setAudioData(null);
      setIsLoadingFile(false);
    };
  }, [audioFile, handleLoadAudioFile]);

  return (
    <div className='flex gap-8 items-start flex-col mx-auto select-none'>
      <input
        type='file'
        accept='audio/*'
        onChange={(e) => {
          setAudioFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <div className='p-4 w-2/3 bg-teal-300 m-4 rounded-md shadow-md flex flex-col gap-4'>
        <div className='w-full flex gap-8 items-center justify-center [&>*]:cursor-pointer'>
          <span>
            <SeekBack5Icon />
          </span>
          {!isLoadingFile && (
            <>
              {!isPlaying && (
                <span onClick={() => audioData && handlePlayAudio(currentTime)}>
                  <PlayIcon />
                </span>
              )}
              {isPlaying && (
                <span onClick={() => handlePauseAudio()}>
                  <PauseIcon />
                </span>
              )}
            </>
          )}
          {isLoadingFile && (
            <span className='animate-spin duration-300'>
              <SipnnerIcon />
            </span>
          )}
          <span>
            <SeekNext5Icon />
          </span>
        </div>
        <div className='w-full flex justify-between items-center gap-4 text-slate-500'>
          <span id='audio-start-duration'>00:00</span>
          <Seeker />
          <span id='audio-end-duration'>{formatAudioDuration(audioData?.duration) ?? '00:00'}</span>
        </div>
      </div>
    </div>
  );
};

export default App;

const Seeker = () => {
  return (
    // track
    <div className='w-full rounded-md shadow-sm h-2 bg-white relative cursor-pointer z-50'>
      {/* thumb */}
      <span
        id='seeker-thumb'
        className='w-4 h-4 bg-teal-500 hover:bg-teal-600 inline-block rounded-full absolute top-[-4px]
      left-[-8px]
      cursor-pointer z-30'
      ></span>
      {/* seeker */}
      <div id='audio-seeker' className='w-0 rounded-md h-2 bg-blue-400 relative cursor-pointer z-10'></div>
    </div>
  );
};
