import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const video = document.getElementById("preview");
const actionBtn = document.getElementById("actionBtn");
const previewTxt = document.getElementById("preview_unavailable");
const actionBtn2 = document.getElementById("actionBtn2");
const recordingIcon = document.getElementById("recordingIcon");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleStart = () => {
  actionBtn.innerText = "Recording...";
  actionBtn.disabled = true;
  recordingIcon.classList.remove("hidden");
  actionBtn.removeEventListener("click", handleStart);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    recordingIcon.classList.add("hidden");
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  let count = 4;
  let countdown = setInterval(() => {
    if (count === 0) {
      clearInterval(countdown);
      recorder.stop();
      actionBtn2.classList.remove("hidden-Retake");
    }
    actionBtn.innerText = `Recording ends in... ${count}`;
    count = count - 1;
  }, 1000);
};

const handleDownload = async () => {
  actionBtn2.classList.add("hidden-Retake");
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  init();
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const init = async () => {
  actionBtn.removeEventListener("click", init);
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 500,
      height: 300,
    },
  });
  video.srcObject = stream;
  video.play();
  handleReady();
};

const handleReady = () => {
  actionBtn.addEventListener("click", handleStart);
  previewTxt.innerText = "";
  actionBtn.innerText = "Start Recording";
};

const handleRetake = () => {
  actionBtn2.classList.add("hidden-Retake");
  actionBtn.removeEventListener("click", handleDownload);
  init();
};

actionBtn.addEventListener("click", init);
actionBtn2.addEventListener("click", handleRetake);
