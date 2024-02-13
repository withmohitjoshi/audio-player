import { useCallback, useEffect, useRef, useState } from 'react';
import { useIcons } from './hooks/useIcons';
import { audioFileToArrayBuffer, formatAudioDuration } from './functions';

let requestFramID;
let intervalID;

const App = () => {
  const { PlayIcon, PauseIcon, SeekBack5Icon, SeekNext5Icon, SipnnerIcon } = useIcons();
  const { current: audioContext } = useRef(new AudioContext());
  const audioRef = useRef(new Audio());
  const [audioFile, setAudioFile] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const requestAnimationFrame = useCallback(() => {
    document.getElementById('audio-start-duration').innerText = formatAudioDuration(audioRef.current.currentTime);
    requestFramID = window.requestAnimationFrame(requestAnimationFrame);
  }, []);

  const handlePlayAudio = (playAtTime) => {
    audioRef.current.currentTime = playAtTime;
    setCurrentTime(playAtTime);
    audioRef.current.play();
  };

  const handlePauseAudio = () => {
    audioRef.current.pause();
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
          requestAnimationFrame();
          setIsPlaying(true);
        };
        audioRef.current.onpause = () => {
          cancelAnimationFrame(requestFramID);
          setCurrentTime(audioRef.current.currentTime);
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
    [audioContext, requestAnimationFrame]
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
        <div className='w-full flex justify-between items-center gap-2 text-slate-500'>
          <span id='audio-start-duration'>00:00</span>
          <input type='range' className='w-full' />
          <span id='audio-end-duration'>{formatAudioDuration(audioData?.duration) ?? '00:00'}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
