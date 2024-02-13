function audioFileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      let arrayBuffer = event.target.result;
      resolve(arrayBuffer);
    };

    reader.onerror = function (event) {
      reject(event.target.error);
    };

    reader.readAsDataURL(file);
  });
}

function formatAudioDuration(totalSeconds) {
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds - hours * 3600 - minutes * 60;

  seconds = (Math.round(seconds * 100) / 100)?.toFixed(0);
  let result = hours === 0 ? "" : hours < 10 ? "0" + hours + ":" : hours + ":";
  result += minutes < 10 ? "0" + minutes : minutes;
  result += ":" + (seconds < 10 ? "0" + seconds : seconds);
  return result;
}

const getNodeByID = (id) => {
  return document.getElementById(id);
};

export { formatAudioDuration, audioFileToDataURL, getNodeByID };
