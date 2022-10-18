const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");

const fullScreenBtn = document.getElementById("fullscreen");
const videoContainer = document.getElementById("videoContainer");

let volumeValue = 0.5;
video.volume = volumeValue;

let videoPlayStatus = false;
let videoPlayStatusFlag = false;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? "0" : volumeValue;
};

const handleVolumeInput = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  video.volume = value;

  if (value == 0) {
    video.muted = true;
    muteBtn.innerText = "Unmute";
  } else {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;

  if (value != 0) {
    volumeValue = value;
  }
};

const formatTime = (seconds) => {
  let startIndex = 0;
  switch (true) {
    case seconds >= 3600:
      startIndex = 11;
      break;
    case seconds >= 600:
      startIndex = 14;
      break;
    default:
      startIndex = 15;
      break;
  }
  return new Date(seconds * 1000).toISOString().substring(startIndex, 19);
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = () => {
  videoPlayStatus ? video.play() : video.pause();
  videoPlayStatusFlag = false;
};

const handleTimelineInput = (event) => {
  const {
    target: { value },
  } = event;
  if (!videoPlayStatusFlag) {
    videoPlayStatus = video.paused ? false : true;
    videoPlayStatusFlag = true;
  }
  video.pause();
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
};

const handleFullScreenBtn = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    fullScreenBtn.innerText = "Exit Fullscreen";
  } else {
    fullScreenBtn.innerText = "Enter Fullscreen";
  }
};

const handleKeyDown = (event) => {
  const volumeStep = 0.1;
  switch (event.code) {
    case "Space":
      handlePlayClick();
      break;
    case "ArrowUp":
      if (video.volume + volumeStep >= 1) {
        video.volume = 1;
      } else {
        video.volume = (video.volume + volumeStep).toFixed(1);
      }
      volumeRange.value = video.volume;
      if (volumeRange.value > 0) {
        video.muted = false;
        muteBtn.innerText = "Mute";
      }
      break;
    case "ArrowDown":
      if (video.volume - volumeStep <= 0) {
        video.volume = 0;
        video.muted = true;
        muteBtn.innerText = "Unmute";
      } else {
        video.volume = (video.volume - volumeStep).toFixed(1);
      }
      volumeRange.value = video.volume;
      break;
    case "ArrowLeft":
      video.currentTime -= 2;
      break;
    case "ArrowRight":
      video.currentTime += 2;
      break;
    case "Enter":
      handleFullScreen();
  }

  console.log(event.code);
};

play.addEventListener("click", handlePlayClick);
mute.addEventListener("click", handleMute);
volumeRange.addEventListener("change", handleVolumeChange);
volumeRange.addEventListener("input", handleVolumeInput);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("change", handleTimelineChange);
timeline.addEventListener("input", handleTimelineInput);
videoContainer.addEventListener("fullscreenchange", handleFullScreenBtn);
fullScreenBtn.addEventListener("click", handleFullScreen);

window.addEventListener("keydown", handleKeyDown);
