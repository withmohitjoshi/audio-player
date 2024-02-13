import { useCallback, useEffect, useRef, useState } from "react";
import { useIcons } from "./hooks/useIcons";
import {
  audioFileToDataURL,
  formatAudioDuration,
  getNodeByID,
} from "./functions";

let requestFramID;

const moveSeeker = (percentage = 0) => {
  const seekerThumb = getNodeByID("seeker-thumb");
  const audioSeeked = getNodeByID("audio-seeked");
  seekerThumb.style.left = `${percentage}%`;
  audioSeeked.style.width = `${percentage}%`;
};

const App = () => {
  const { PlayIcon, PauseIcon, SeekBack5Icon, SeekNext5Icon, SipnnerIcon } =
    useIcons();
  const audioRef = useRef(new Audio());
  const [audioFile, setAudioFile] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playAt, setPlayAt] = useState(0);

  // checked
  const requestAnimationFrame = useCallback(() => {
    getNodeByID("audio-passed-duration").innerText = formatAudioDuration(
      audioRef.current.currentTime
    );
    const percentage =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    moveSeeker(percentage);
    requestFramID = window.requestAnimationFrame(requestAnimationFrame);
  }, []);

  const handleSeek5Next = () => {
    handlePlayAudio();
    if (audioRef.current.currentTime + 5 > audioRef.current.duration) {
      getNodeByID("audio-passed-duration").innerText = "00:00";
      moveSeeker();
      setPlayAt(0);
    } else {
      getNodeByID("audio-passed-duration").innerText = formatAudioDuration(
        audioRef.current.currentTime + 5
      );
      const percentage =
        ((audioRef.current.currentTime + 5) / audioRef.current.duration) * 100;
      moveSeeker(percentage);
      setPlayAt(audioRef.current.currentTime + 5);
    }
    handlePlayAudio(audioRef.current.currentTime + 5);
  };

  const handleSeek5Back = () => {
    handlePlayAudio();
    if (audioRef.current.currentTime - 5 < 0) {
      getNodeByID("audio-passed-duration").innerText = "00:00";
      moveSeeker();
      setPlayAt(0);
    } else {
      getNodeByID("audio-passed-duration").innerText = formatAudioDuration(
        audioRef.current.currentTime - 5
      );
      const percentage =
        ((audioRef.current.currentTime - 5) / audioRef.current.duration) * 100;
      moveSeeker(percentage);
      setPlayAt(audioRef.current.currentTime - 5);
    }
    handlePlayAudio(audioRef.current.currentTime + 5);
  };

  // checked
  const handlePlayAudio = (playAtTime) => {
    if (!isNaN(audioRef.current?.duration)) {
      audioRef.current.currentTime = playAtTime;
      setPlayAt(playAtTime);
      audioRef.current.play();
    }
  };

  // checked
  const handlePauseAudio = () => {
    audioRef.current.pause();
  };

  // checked
  const handleLoadAudioFile = useCallback(
    async (file) => {
      setIsLoadingFile(true);
      try {
        audioRef.current.src = await audioFileToDataURL(file);
        audioRef.current.onloadedmetadata = () => {
          setIsLoadingFile(false);
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
        audioRef.current.onended = () => {
          getNodeByID("audio-passed-duration").innerText = "00:00";
          getNodeByID("seeker-thumb").style.left = "0%";
          getNodeByID("audio-seeked").style.width = "0%";
          cancelAnimationFrame(requestFramID);
          setIsPlaying(false);
          setPlayAt(0);
        };
      } catch (error) {
        console.log("Error while loading audio file", { error });
      }
    },
    [requestAnimationFrame]
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

  return (
    <div
      className="flex gap-8 items-start flex-col mx-auto select-none"
      id="audio-player-container"
    >
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
                <span
                  onClick={() => audioRef.current && handlePlayAudio(playAt)}
                >
                  <PlayIcon />
                </span>
              )}
              {isPlaying && (
                <span onClick={() => audioRef.current && handlePauseAudio()}>
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
          <span id="audio-passed-duration">00:00</span>
          <Seeker audioRef={audioRef} setPlayAt={setPlayAt} />
          <span>
            {audioRef.current?.duration
              ? formatAudioDuration(audioRef.current.duration)
              : "00:00"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;

const Seeker = ({ audioRef, setPlayAt }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const seekerTrackRect =
        getNodeByID("seeker-track").getBoundingClientRect();
      const offsetX = e.clientX - seekerTrackRect.left;
      let percentage = (offsetX / seekerTrackRect.width) * 100;

      if (percentage < 0) {
        percentage = 0;
      } else if (percentage > 100) {
        percentage = 100;
      }

      moveSeeker(percentage);

      const playAt = (audioRef.current.duration / 100) * percentage;

      getNodeByID("audio-passed-duration").innerText =
        formatAudioDuration(playAt);
    },
    [audioRef, isDragging]
  );

  const handleMouseDown = useCallback(() => {
    if (!isNaN(audioRef.current.duration)) {
      setIsDragging(true);
      audioRef.current.pause();
    }
  }, [audioRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const audioSeeked = getNodeByID("audio-seeked");
    const percentage = audioSeeked.style.width.split("%")[0];
    setPlayAt((audioRef.current.duration / 100) * percentage);
    audioRef.current.currentTime =
      (audioRef.current.duration / 100) * percentage;
  }, [audioRef, setPlayAt]);

  useEffect(() => {
    getNodeByID("seeker-thumb").addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      getNodeByID("seeker-thumb").removeEventListener(
        "mousedown",
        handleMouseDown
      );
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div
      id="seeker-track"
      className="w-full rounded-md shadow-sm h-2 bg-white relative cursor-pointer z-50"
    >
      <span
        id="seeker-thumb"
        className="w-4 left-0 translate-x-[-50%] h-4 bg-teal-500 hover:bg-teal-600 inline-block rounded-full absolute top-[-4px] cursor-pointer z-30"
      ></span>
      <div
        id="audio-seeked"
        className="w-0 rounded-md h-2 bg-blue-400 relative cursor-pointer z-10"
      ></div>
    </div>
  );
};
