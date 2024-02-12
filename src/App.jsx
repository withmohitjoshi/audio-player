import { useCallback, useEffect, useRef, useState } from "react";
import { useIcons } from "./hooks/useIcons";
import { audioFileToArrayBuffer, formatAudioDuration } from "./functions";

let startTime = 0;

const App = () => {
  const { PlayIcon, PauseIcon, SeekBack5Icon, SeekNext5Icon, SipnnerIcon } =
    useIcons();
  const { current: audioContext } = useRef(new AudioContext());
  let audioSourceRef = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleLoadAudioFile = useCallback(
    async (file) => {
      setIsLoadingFile(true);
      try {
        const arrayBuffer = await audioFileToArrayBuffer({ file });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioData(audioBuffer);
      } catch (error) {
        console.log("Error while loading audio file", { error });
      }
      setIsLoadingFile(false);
    },
    [audioContext]
  );

  const handlePlayAudio = (playAtTime) => {
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioData;
    audioSource.connect(audioContext.destination);
    startTime = audioContext.currentTime - playAtTime;
    audioSource.start(0, playAtTime);
    audioSourceRef.current = audioSource;
    setIsPlaying(true);
  };

  /*
  when I play the audio from zero
  startTime = 0 - 0
  */

  const handlePauseAudio = (playAtTime) => {
    if (audioContext.state === "running") {
      audioSourceRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(
        playAtTime ?? Math.floor(audioContext.currentTime - startTime)
      );
    }
  };

  const handleSeek5Next = () => {
    // handlePauseAudio();
    // if (currentTime + 5 < audioData?.duration) {
    //   handlePlayAudio(currentTime + 5);
    //   setCurrentTime(currentTime + 5);
    // } else {
    //   handlePauseAudio(0);
    // }
  };

  const handleSeek5Back = () => {
    // handlePauseAudio();
    // if (currentTime - 5 > 0) {
    //   handlePlayAudio(currentTime - 5);
    //   setCurrentTime(currentTime - 5);
    // } else {
    //   handlePauseAudio(0);
    // }
  };

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
    <div className="flex gap-8 items-start flex-col mx-auto">
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          setAudioFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
      <div className="p-4 w-2/3 bg-teal-300 m-4 rounded-md shadow-md flex flex-col gap-4">
        <div className="w-full flex gap-8 items-center justify-center [&>*]:cursor-pointer">
          <span onClick={handleSeek5Back}>
            <SeekBack5Icon />
          </span>
          {!isLoadingFile && (
            <>
              {!isPlaying && (
                <span onClick={() => audioFile && handlePlayAudio(currentTime)}>
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
            <span className="animate-spin duration-300">
              <SipnnerIcon />
            </span>
          )}
          <span onClick={handleSeek5Next}>
            <SeekNext5Icon />
          </span>
        </div>
        <div className="w-full flex justify-between items-center gap-4 text-slate-500">
          <span id="audio-start-duration">00:00</span>
          <Seeker />
          <span id="audio-end-duration">
            {formatAudioDuration(audioData?.duration) ?? "00:00"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;

const Seeker = () => {
  return (
    // track
    <div className="w-full rounded-md shadow-sm h-2 bg-white relative cursor-pointer z-50">
      {/* thumb */}
      <span
        className="w-4 h-4 bg-teal-500 hover:bg-teal-600 inline-block rounded-full absolute top-[-4px]
      left-[-8px]
      cursor-pointer z-30"
      ></span>
      {/* seeker */}
      <div
        id="audio-seeker"
        className="w-0 rounded-md h-2 bg-blue-400 relative cursor-pointer z-10"
      ></div>
    </div>
  );
};
