import { useCallback, useEffect, useRef, useState } from 'react';
import { useIcons } from './hooks/useIcons';
import { audioFileToDataURL, formatAudioDuration, getNodeByID } from './functions';

let requestFramID;

const moveSeeker = (percentage = 0) => {
  const seekerThumb = getNodeByID('seeker-thumb');
  const audioSeeked = getNodeByID('audio-seeked');
  seekerThumb.style.left = `${percentage}%`;
  audioSeeked.style.width = `${percentage}%`;
};

const App = () => {
  const { PlayIcon, PauseIcon, SeekBack5Icon, SeekNext5Icon, SipnnerIcon, AudioIcon, VolumeMax, VolumeZero } = useIcons();
  const audioRef = useRef(new Audio());
  const [audioFile, setAudioFile] = useState(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playAt, setPlayAt] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // checked
  const requestAnimationFrame = useCallback(() => {
    getNodeByID('audio-passed-duration').innerText = formatAudioDuration(audioRef.current.currentTime);
    const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    moveSeeker(percentage);
    requestFramID = window.requestAnimationFrame(requestAnimationFrame);
  }, []);

  // checked
  const handlePlayAudio = useCallback(
    (playAtTime) => {
      if (isAudioLoaded) {
        audioRef.current.currentTime = playAtTime;
        setPlayAt(playAtTime);
        audioRef.current.play();
      }
    },
    [isAudioLoaded]
  );

  // checked
  const handlePauseAudio = useCallback(() => {
    if (isAudioLoaded) {
      audioRef.current.pause();
    }
  }, [isAudioLoaded]);

  // checked
  const handleLoadAudioFile = useCallback(
    async (file) => {
      setIsLoadingFile(true);
      try {
        audioRef.current.src = await audioFileToDataURL(file);
        audioRef.current.onloadedmetadata = () => {
          setIsLoadingFile(false);
          setIsAudioLoaded(true);
        };
        audioRef.current.onplay = () => {
          requestAnimationFrame();
          setIsPlaying(true);
        };
        audioRef.current.onpause = () => {
          cancelAnimationFrame(requestFramID);
          setPlayAt(audioRef.current.currentTime);
          setIsPlaying(false);
        };
        audioRef.current.onvolumechange = () => {
          setIsMuted(audioRef.current.volume === 0 ? true : false);
        };
        audioRef.current.onended = () => {
          getNodeByID('audio-passed-duration').innerText = '00:00';
          moveSeeker();
          cancelAnimationFrame(requestFramID);
          setIsPlaying(false);
          setPlayAt(0);
        };
      } catch (error) {
        console.log('Error while loading audio file', { error });
      }
    },
    [requestAnimationFrame]
  );

  // checked
  const handleSeekWithTime = useCallback(
    (seconds) => {
      if (isAudioLoaded) {
        if (audioRef.current.currentTime + seconds > 0 && audioRef.current.currentTime + seconds < audioRef.current.duration) {
          audioRef.current.currentTime = audioRef.current.currentTime + seconds;
          const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          moveSeeker(percentage);
          getNodeByID('audio-passed-duration').innerText = formatAudioDuration(audioRef.current.currentTime);
          setPlayAt(audioRef.current.currentTime);
        } else {
          moveSeeker();
          audioRef.current.currentTime = audioRef.current.duration;
          getNodeByID('audio-passed-duration').innerText = formatAudioDuration(audioRef.current.currentTime);
          setPlayAt(audioRef.current.currentTime);
        }
      }
    },
    [isAudioLoaded]
  );

  // checked
  useEffect(() => {
    if (audioFile) {
      handleLoadAudioFile(audioFile);
    }
    return () => {
      setIsLoadingFile(false);
    };
  }, [audioFile, handleLoadAudioFile]);

  // checked
  const keyPressActions = useCallback(
    (e) => {
      if (isAudioLoaded) {
        switch (e.key) {
          case ' ':
            if (isPlaying) handlePauseAudio();
            else handlePlayAudio(audioRef.current.currentTime);
            break;
          case 'ArrowRight':
            handleSeekWithTime(5);
            break;
          case 'ArrowLeft':
            handleSeekWithTime(-5);
            break;
          case 'm':
            audioRef.current.volume === 0 ? (audioRef.current.volume = 1) : (audioRef.current.volume = 0);
            break;

          default:
            break;
        }
      }
    },
    [handlePauseAudio, handlePlayAudio, handleSeekWithTime, isAudioLoaded, isPlaying]
  );

  useEffect(() => {
    document.addEventListener('keydown', keyPressActions);
    return () => {
      document.removeEventListener('keydown', keyPressActions);
    };
  }, [isAudioLoaded, keyPressActions]);

  return (
    <div className='flex gap-8 items-start flex-col mx-auto select-none p-8' id='audio-player-container'>
      <input
        className='mx-auto block text-sm text-black
        file:mr-2 file:py-2 file:px-4 file:rounded-md
        file:border-0 file:text-sm file:font-semibold
        file:bg-teal-500 file:text-white
        hover:file:bg-teal-600 cursor-pointer file:cursor-pointer'
        type='file'
        accept='audio/*'
        onChange={(e) => {
          setAudioFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <div className='p-4 w-full bg-teal-300 rounded-md shadow-md flex flex-col gap-4'>
        <div className='flex justify-between items-center w-full'>
          <span className='text-slate-500 cursor-pointer text-nowrap flex gap-1 items-center w-fit'>
            <AudioIcon /> <span className='text-sm'>{audioFile?.name}</span>
          </span>
          <div className='flex gap-8 items-center justify-center [&>*]:cursor-pointer w-full'>
            <span onClick={() => handleSeekWithTime(-5)}>
              <SeekBack5Icon />
            </span>
            {!isLoadingFile && (
              <>
                {!isPlaying && (
                  <span onClick={() => handlePlayAudio(playAt)}>
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
            <span onClick={() => handleSeekWithTime(5)}>
              <SeekNext5Icon />
            </span>
          </div>
          <span className='cursor-pointer mx-auto' onClick={() => (audioRef.current.volume === 0 ? (audioRef.current.volume = 1) : (audioRef.current.volume = 0))}>
            {!isMuted ? <VolumeMax /> : <VolumeZero />}
          </span>
        </div>
        <div className='w-full flex justify-between items-center gap-4 text-slate-500'>
          <span id='audio-passed-duration'>00:00</span>
          <Seeker audioRef={audioRef} setPlayAt={setPlayAt} isAudioLoaded={isAudioLoaded} requestAnimationFrame={requestAnimationFrame} />
          <span>{audioRef.current?.duration ? formatAudioDuration(audioRef.current.duration) : '00:00'}</span>
        </div>
      </div>
    </div>
  );
};

export default App;

const Seeker = ({ audioRef, setPlayAt, isAudioLoaded, requestAnimationFrame }) => {
  const [isDragging, setIsDragging] = useState(false);

  // checked
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      cancelAnimationFrame(requestFramID);
      const seekerTrackRect = getNodeByID('seeker-track').getBoundingClientRect();
      const offsetX = e.clientX - seekerTrackRect.left;
      let percentage = (offsetX / seekerTrackRect.width) * 100;

      if (percentage < 0) {
        percentage = 0;
      } else if (percentage > 100) {
        percentage = 100;
      }
      moveSeeker(percentage);
      const playAt = (audioRef.current.duration / 100) * percentage;
      getNodeByID('audio-passed-duration').innerText = formatAudioDuration(playAt);
    },
    [audioRef, isDragging]
  );

  // checked
  const handleMouseDown = useCallback(() => {
    if (isAudioLoaded) {
      setIsDragging(true);
    }
  }, [isAudioLoaded]);

  // checked
  const handleMouseUp = useCallback(() => {
    if (isAudioLoaded && isDragging) {
      setIsDragging(false);
      const audioSeeked = getNodeByID('audio-seeked');
      const percentage = audioSeeked.style.width.split('%')[0];
      setPlayAt((audioRef.current.duration / 100) * percentage);
      audioRef.current.currentTime = (audioRef.current.duration / 100) * percentage;
      requestAnimationFrame();
    }
  }, [audioRef, isAudioLoaded, isDragging, requestAnimationFrame, setPlayAt]);

  // checked
  useEffect(() => {
    if (isAudioLoaded) {
      getNodeByID('seeker-thumb').addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      getNodeByID('seeker-thumb').removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, isAudioLoaded]);

  return (
    <div id='seeker-track' className='w-full rounded-md shadow-sm h-2 bg-white relative cursor-pointer z-50'>
      <span id='seeker-thumb' className='w-4 left-0 translate-x-[-50%] h-4 bg-teal-500 hover:bg-teal-600 inline-block rounded-full absolute top-[-4px] cursor-pointer z-30'></span>
      <div id='audio-seeked' className='w-0 rounded-md h-2 bg-blue-400 relative cursor-pointer z-10'></div>
    </div>
  );
};
