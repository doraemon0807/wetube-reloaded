import regeneratorRuntime from "regenerator-runtime";
import "../scss/styles.scss";

export const isHeroku = process.env.NODE_ENV === "production";

export const addAlertBox = (btn, object) => {
  let title = "";
  let desc = "";
  let text = "";
  let link = "";

  const alertContainer = document.createElement("div");
  const alert__title = document.createElement("h3");
  const alert__description = document.createElement("span");
  const alert__link = document.createElement("a");
  const alert__link__span = document.createElement("span");

  switch (object) {
    case "video":
      title = "Like this video?";
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
    case "comment":
      title = "Like this comment?";
      desc = "Log in to make your opinion count.";
      text = "Log in";
      link = "/login";
      break;
    case "deleteComment":
      title = "Are you sure you want to delete?";
      desc = "Deleted comments cannot be restored.";
      text = "Delete";
      break;
    case "logout":
      title = "Leaving Already?";
      desc = "Are you sure you want to log out?";
      text = "Log Out";
      link = "/users/logout";
      break;
  }

  alertContainer.classList = "alertContainer";

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

export const deleteAlertBox = (event) => {
  const alertBox = document.querySelector(".alertContainer");

  if (event.target === alertBox || alertBox.contains(event.target)) {
    return;
  } else {
    alertBox.remove();
    document.body.removeEventListener("click", deleteAlertBox);
  }
};
