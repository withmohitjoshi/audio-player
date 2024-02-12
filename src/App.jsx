import { useCallback, useEffect, useState } from 'react';
import { useIcons } from './hooks/useIcons';

const audioContext = new AudioContext();

const App = () => {
  const { PlayIcon, PauseIcon, SeekBack5Icon, SeekNext5Icon, SipnnerIcon } = useIcons();
  const [audioFile, setAudioFile] = useState(null);
  const [audioMetaData, setAudioMetaData] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleAudioFile = useCallback(async (file) => {
    setIsLoadingFile(true);
    try {
      const audioBuffer = await audioFileToArrayBuffer({ file });
      const decodeAudioData = await audioContext.decodeAudioData(audioBuffer);
      setAudioMetaData(decodeAudioData);
    } catch (error) {
      console.log('Error while loading audio file', { error });
    }
    setIsLoadingFile(false);
  }, []);

  useEffect(() => {
    if (audioFile) {
      handleAudioFile(audioFile);
    }
    return () => {
      setAudioMetaData(null);
      setIsLoadingFile(false);
    };
  }, [audioFile]);

  return (
    <div className='flex gap-8 items-start flex-col mx-auto'>
      <input
        type='file'
        accept='audio/*'
        onChange={(e) => {
          setAudioFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <div className='p-4 w-1/2 bg-teal-300 m-4 rounded-md shadow-md flex flex-col gap-4'>
        <div className='w-full flex gap-8 items-center justify-center [&>*]:cursor-pointer'>
          <span>
            <SeekBack5Icon />
          </span>
          {!isLoadingFile && (
            <span>
              <PlayIcon />
            </span>
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
        <div className='w-full flex justify-between items-center gap-2'>
          <span id='audio-start-duration'>00:00</span>

          <input type='range' className='w-full' />
          <span id='audio-end-duration'>{formatAudioDuration(audioMetaData?.duration) ?? '00:00'}</span>
        </div>
      </div>
    </div>
  );
};

export default App;

function audioFileToArrayBuffer({ file }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      let arrayBuffer = event.target.result;
      resolve(arrayBuffer);
    };

    reader.onerror = function (event) {
      reject(event.target.error);
    };

    reader.readAsArrayBuffer(file);
  });
}

function formatAudioDuration(totalSeconds) {
  if (!totalSeconds) return null;
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds - hours * 3600 - minutes * 60;
  // round seconds
  seconds = (Math.round(seconds * 100) / 100)?.toFixed(0);
  let result = hours === 0 ? '' : hours < 10 ? '0' + hours + ':' : hours + ':';
  result += minutes < 10 ? '0' + minutes : minutes;
  result += ':' + (seconds < 10 ? '0' + seconds : seconds);
  return result;
}
