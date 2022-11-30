import { addAlertBox, deleteAlertBox } from "./main";

const videoContainer = document.getElementById("videoContainer");
const videoOwnerData = document.getElementById("videoOwnerData");
const userProfileData = document.getElementById("userProfileData");

const likeVideoBtn = document.querySelector(".likeVideoBtn");
const likeVideoCount = document.querySelector(".likeVideoCount");

const deleteBtn = document.querySelector(".video__btns__delete");

let subsBtn = "";
let subsCount = "";
let subsCountUnit = "";

const handleSubs = async (event) => {
  event.preventDefault();
  let id =
    videoOwnerData === null
      ? userProfileData.dataset.id
      : videoOwnerData.dataset.id;

  const response = await fetch(`/api/users/${id}/subs`, { method: "POST" });

  if (response.status === 200) {
    subsBtn.innerText = "Subscribed";
    subsBtn.classList.add("subbed");
    subsCount.innerText = parseInt(subsCount.innerText) + 1;
    subsCountUnit.innerText =
      subsCount.innerText === "1" ? " Subscriber" : " Subscribers";
    subsBtn.removeEventListener("click", handleSubs);
    subsBtn.addEventListener("click", handleUnsubs);
  } else if (response.status === 400) {
    addAlertBox(subsBtn, "user");
  }
};

const handleUnsubs = async (event) => {
  event.preventDefault();
  let id =
    videoOwnerData === null
      ? userProfileData.dataset.id
      : videoOwnerData.dataset.id;

  const response = await fetch(`/api/users/${id}/unsubs`, { method: "POST" });

  if (response.status === 200) {
    subsBtn.innerText = "Subscribe";
    subsBtn.classList.remove("subbed");
    subsCount.innerText = parseInt(subsCount.innerText) - 1;
    subsCountUnit.innerText =
      subsCount.innerText === "1" ? " Subscriber" : " Subscribers";
    subsBtn.removeEventListener("click", handleUnsubs);
    subsBtn.addEventListener("click", handleSubs);
  }
};

const handleLike = async (event) => {
  event.preventDefault();
  const videoId = videoContainer.dataset.id;

  const response = await fetch(`/api/videos/${videoId}/like`, {
    method: "POST",
  });

  if (response.status === 200) {
    likeVideoBtn.classList.add("liked");
    likeVideoBtn.setAttribute("tooltip", "Liked!");
    likeVideoCount.innerText = parseInt(likeVideoCount.innerText) + 1;
    likeVideoBtn.removeEventListener("click", handleLike);
    likeVideoBtn.addEventListener("click", handleUnlike);
  } else if (response.status === 400) {
    addAlertBox(likeVideoBtn, "video");
  }
};

const handleUnlike = async (event) => {
  event.preventDefault();
  const videoId = videoContainer.dataset.id;

  const response = await fetch(`/api/videos/${videoId}/unlike`, {
    method: "POST",
  });

  if (response.status === 200) {
    likeVideoBtn.classList.remove("liked");
    likeVideoBtn.setAttribute("tooltip", "Like!");
    likeVideoCount.innerText = parseInt(likeVideoCount.innerText) - 1;
    likeVideoBtn.removeEventListener("click", handleUnlike);
    likeVideoBtn.addEventListener("click", handleLike);
  }
};

const likeSubsBtnAddEventListener = () => {
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      addAlertBox(deleteBtn, "deleteVideo");
    });
  }

  if (document.querySelector(".subsBtn")) {
    subsBtn = document.querySelector(".subsBtn");
    subsCount = document.querySelector(".subsCount");
    subsCountUnit = document.querySelector(".subsCountUnit");

    if (subsBtn.classList.contains("subbed")) {
      subsBtn.addEventListener("click", handleUnsubs);
    } else {
      subsBtn.addEventListener("click", handleSubs);
    }
  }

  if (!likeVideoBtn) {
    return;
  }

  if (likeVideoBtn.classList.contains("liked")) {
    likeVideoBtn.addEventListener("click", handleUnlike);
  } else {
    likeVideoBtn.addEventListener("click", handleLike);
  }
};

likeSubsBtnAddEventListener();
