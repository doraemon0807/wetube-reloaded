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
    likeVideoCount.innerText = parseInt(likeVideoCount.innerText) - 1;
    likeVideoBtn.removeEventListener("click", handleUnlike);
    likeVideoBtn.addEventListener("click", handleLike);
  }
};

const handleDeleteVideoAlertBox = (event) => {
  addAlertBox(deleteBtn, "deleteVideo");
};

const addAlertBox = (btn, object) => {
  let title = "";
  let desc = "";
  let text = "";
  let link = "";

  switch (object) {
    case "video":
      title = "Like this video?";
      desc = "Log in to make your opinion count.";
      text = "Log in";
      link = "/login";
      break;
    case "comment":
      title = "Like this comment?";
      desc = "Log in to make your opinion count.";
      text = "Log in";
      link = "/login";
      break;
    case "user":
      title = "Want to subscribe to this channel?";
      desc = "Log in to subscribe to this channel.";
      text = "Log in";
      link = "/login";
      break;
    case "deleteVideo":
      title = "Are you sure you want to delete?";
      desc = "Deleted videos cannot be restored.";
      text = "Delete";
      link = `/videos/${
        document.getElementById("videoContainer").dataset.id
      }/delete`;
      break;
  }

  const alertContainer = document.createElement("div");
  alertContainer.classList = "alertContainer";

  const alert__title = document.createElement("h3");
  const alert__description = document.createElement("span");
  const alert__link = document.createElement("a");
  const alert__link__span = document.createElement("span");
  alert__title.classList = "alert__title titleFont";
  alert__title.innerText = title;
  alert__description.classList = "alert__description grayFont";
  alert__description.innerText = desc;
  alert__link.classList = "alert__link linkFont";
  alert__link.href = link;
  alert__link__span.innerText = text;

  alert__link.appendChild(alert__link__span);

  alertContainer.appendChild(alert__title);
  alertContainer.appendChild(alert__description);
  alertContainer.appendChild(alert__link);
  btn.parentElement.appendChild(alertContainer);

  setTimeout(() => document.body.addEventListener("click", deleteAlertBox), 0);
};

const deleteAlertBox = (event) => {
  const alertBox = document.querySelector(".alertContainer");

  if (event.target === alertBox || alertBox.contains(event.target)) {
    return;
  } else {
    alertBox.remove();
    document.body.removeEventListener("click", deleteAlertBox);
  }
};

const likeSubsBtnAddEventListener = () => {
  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteVideoAlertBox);
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
