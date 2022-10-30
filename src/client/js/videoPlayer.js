const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const videoHud = document.getElementById("videoHud");
const videoHudIcon = videoHud.querySelector("i");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");

const fullScreenBtn = document.getElementById("fullscreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const videoControlsVolume = document.querySelector(".videoControls__volume");

const volumeStep = 0.1;
let volumeValue = 0.5;
video.volume = volumeValue;

let videoPlayStatus = false;
let videoPlayStatusFlag = false;

let controlsTimeout = null;
let volumeTimeout = null;
let hudTimeout = null;

const hideHud = () => {
  videoHud.style.opacity = 0;
  videoHud.classList = "fade-out";
};

const handleHud = () => {
  if (hudTimeout) {
    clearTimeout(hudTimeout);
    hudTimeout = null;
  }
  videoHud.style.opacity = 1;
  videoHud.classList = "";
  if (!video.ended) {
    hudTimeout = setTimeout(hideHud, 1);
  }
};

const handleVideoHudPlay = () => {
  switch (true) {
    case video.paused:
      videoHudIcon.classList = "fas fa-pause";
      break;

    case !video.paused:
      videoHudIcon.classList = "fas fa-play";
      break;
  }
  handleHud();
};

const handleVideoHudMute = () => {
  switch (true) {
    case video.muted:
      videoHudIcon.classList = "fas fa-volume-mute";
      break;

    case !video.muted:
      videoHudIcon.classList = "fas fa-volume-up";
      break;
  }
  handleHud();
};

const handleVideoHudEnd = () => {
  switch (true) {
    case video.ended:
      videoHudIcon.classList = "fas fa-redo";
      break;
  }
  handleHud();
};

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
    handleVideoHudPlay();
  } else {
    video.pause();
    handleVideoHudPlay();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;

    if (volumeValue == 0) {
      volumeValue = volumeStep;
    }

    volumeRange.value = volumeValue;
    handleVolumeIcon(volumeValue);
  } else {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
    volumeRange.value = 0;
  }
  handleVideoHudMute();
};

const handleVolumeIcon = (value) => {
  switch (true) {
    case value >= 0.5:
      muteBtnIcon.classList = "fas fa-volume-up";
      break;
    case value > 0:
      muteBtnIcon.classList = "fas fa-volume-down";
      break;
    case value == 0:
      muteBtnIcon.classList = "fas fa-volume-mute";
      break;
  }
};

const handleVolumeInput = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
  }
  video.volume = value;

  if (value == 0) {
    video.muted = true;
  } else {
    video.muted = false;
  }

  handleVolumeIcon(video.volume);
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
  //   let startIndex = 0;
  //   switch (true) {
  //     case seconds >= 3600:
  //       startIndex = 11;
  //       break;
  //     case seconds >= 600:
  //       startIndex = 14;
  //       break;
  //     default:
  //       startIndex = 15;
  //       break;
  //   }
  startIndex = seconds >= 3600 ? 11 : seconds >= 600 ? 14 : 15;
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

const handleTimelineColor = () => {
  const { min, max, value } = timeline;
  timeline.style.background = `linear-gradient(to right, red 0%, red ${
    ((value - min) / (max - min)) * 100
  }%, #FFFFFF ${((value - min) / (max - min)) * 100}%, #FFFFFF 100%)`;
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
    fullScreenBtnIcon.classList = "fas fa-compress";
  } else {
    fullScreenBtnIcon.classList = "fas fa-expand";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsTimeout = setTimeout(hideControls, 2000);
};

const hideVolume = () => volumeRange.classList.remove("animate_volume");

const handleVolumeAnimation = () => {
  volumeRange.style.width = "90px";
  volumeRange.style.opacity = 1;
};

const handleVolumeAnimationExit = () => {
  volumeRange.style.width = "0px";
  volumeRange.style.opacity = 0;
};

const handleVolumeTimeout = () => {
  if (volumeTimeout) {
    clearTimeout(volumeTimeout);
    volumeTimeout = null;
  }
  volumeTimeout = setTimeout(handleVolumeAnimationExit, 2000);
};

const handleVideoReplay = () => {
  playBtnIcon.classList = "fas fa-redo";
  handleVideoHudEnd();
};

const handleViews = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};

const handleArrowUpDown = () => {
  handleVolumeIcon(volumeValue);
  handleVolumeAnimation();
  handleVolumeTimeout();
  if (!video.ended) {
    videoHudIcon.classList = "fas fa-volume-up";
    handleHud();
  }
  handleMouseMove();
};

const handleKeyDown = (event) => {
  if (event.target.tagName == "TEXTAREA") {
    return;
  } else {
    switch (event.code) {
      case "Space":
        handlePlayClick();
        break;
      case "ArrowUp":
        if (volumeValue + volumeStep >= 1) {
          volumeValue = 1;
        } else {
          volumeValue = Math.round(volumeValue * 10) / 10 + volumeStep;
        }
        volumeRange.value = volumeValue;
        video.volume = volumeValue;
        if (volumeRange.value > 0) {
          video.muted = false;
        }
        handleArrowUpDown();
        break;

      case "ArrowDown":
        if (!video.muted) {
          if (volumeValue - volumeStep <= 0) {
            volumeValue = 0;
          } else {
            volumeValue = Math.round(volumeValue * 10) / 10 - volumeStep;
          }
          volumeRange.value = volumeValue;
          video.volume = volumeValue;
          if (volumeRange.value == 0) {
            video.muted = true;
          }
          handleArrowUpDown();
        }
        break;
      case "ArrowLeft":
        videoHudIcon.classList = "fas fa-fast-backward";
        handleHud();
        video.currentTime -= 2;
        break;
      case "ArrowRight":
        videoHudIcon.classList = "fas fa-fast-forward";
        handleHud();
        video.currentTime += 2;
        break;
      case "KeyF":
        handleFullScreen();
        break;
      case "KeyM":
        handleMute();
        break;
    }

    // console.log(event.code);
  }
};

play.addEventListener("click", handlePlayClick);
mute.addEventListener("click", handleMute);
volumeRange.addEventListener("change", handleVolumeChange);
volumeRange.addEventListener("input", handleVolumeInput);
video.addEventListener("loadedmetadata", handleLoadedMetadata);

[handleTimeUpdate, handleTimelineColor].forEach((e) => {
  video.addEventListener("timeupdate", e);
});

timeline.addEventListener("change", handleTimelineChange);
timeline.addEventListener("input", handleTimelineInput);
videoContainer.addEventListener("fullscreenchange", handleFullScreenBtn);
fullScreenBtn.addEventListener("click", handleFullScreen);
video.addEventListener("click", handlePlayClick);
videoHud.addEventListener("click", handlePlayClick);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoControlsVolume.addEventListener("mouseenter", handleVolumeAnimation);
videoControlsVolume.addEventListener("mouseleave", handleVolumeAnimationExit);

[handleVideoReplay, handleViews].forEach((e) => {
  video.addEventListener("ended", e);
});
// video.addEventListener("ended", handleVideoReplay);

window.addEventListener("keydown", handleKeyDown);
