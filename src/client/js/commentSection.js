import { isHeroku, addAlertBox, deleteAlertBox } from "./main";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentsCount = document.querySelector(".commentsCount");
const commentsCountUnit = document.querySelector(".commentsCountUnit");

const addComment = (comment) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = comment._id;
  newComment.id = comment._id;
  newComment.className = "video__comment";

  const commentOwner = document.createElement("span");
  commentOwner.innerText = comment.owner.name;
  commentOwner.className = "video__comment__info__owner__username";

  const createdTime = document.createElement("span");
  createdTime.innerText = "Just Now";
  createdTime.className = "video__comment__info__createdAt";

  const commentText = document.createElement("span");
  commentText.className = "video__comment__info__description__span";
  commentText.innerText = comment.text;

  const editedText = document.createElement("span");
  editedText.className = "video__comment__info__edited";

  const likeBtn = document.createElement("button");
  const likeIcon = document.createElement("i");
  const likeSpan = document.createElement("span");

  likeBtn.className = "video__comment__buttons__like likeButton tooltip";
  likeBtn.setAttribute("tooltip", "Like!");
  likeIcon.className = "fas fa-heart likeCommentIcon";
  likeSpan.className = "likeCommentCount";
  likeSpan.innerText = "0";

  likeBtn.appendChild(likeIcon);
  likeBtn.appendChild(likeSpan);
  likeBtn.addEventListener("click", handleCommentLike);

  const deleteBtn = document.createElement("button");
  const deleteIcon = document.createElement("i");

  deleteBtn.className = "video__comment__buttons__delete tooltip";
  deleteBtn.setAttribute("tooltip", "Delete");
  deleteIcon.className = "fas fa-trash-alt";

  deleteBtn.appendChild(deleteIcon);
  // deleteBtn.addEventListener("click", () => {
  //   addAlertBox(deleteBtn, "deleteComment");
  // });

  const editBtn = document.createElement("button");
  const editIcon = document.createElement("i");

  editBtn.className = "video__comment__buttons__edit tooltip";
  editBtn.setAttribute("tooltip", "Edit");
  editIcon.className = "fas fa-pen";
  editBtn.appendChild(editIcon);
  editBtn.addEventListener("click", handleEdit);

  const btns = document.createElement("div");
  btns.className = "video__comment__buttons";

  const commentContainer = document.createElement("div");
  commentContainer.className = "video__comment__container";

  const commentAvatar = document.createElement("div");
  commentAvatar.className = "video__comment__avatar";

  const commentInfo = document.createElement("div");
  commentInfo.className = "video__comment__info";

  const commentInfoOwner = document.createElement("div");
  commentInfoOwner.className = "video__comment__info__owner";

  const commentInfoDesc = document.createElement("div");
  commentInfoDesc.className = "video__comment__info__description";

  if (!comment.owner.avatarUrl) {
    const avatarMissing = document.createElement("div");
    avatarMissing.className = "avatar avatar--medium avatar--missing";
    const avatarMissingLetter = document.createElement("span");
    avatarMissingLetter.innerText = comment.owner.username
      .slice(1, 2)
      .toUpperCase();
    avatarMissing.appendChild(avatarMissingLetter);
    commentAvatar.appendChild(avatarMissing);
  } else {
    const avatar = document.createElement("img");
    avatar.className = "avatar avatar--medium";

    if (isHeroku || comment.owner.avatarUrl.includes(".com")) {
      avatar.src = comment.owner.avatarUrl;
    } else {
      avatar.src = "/" + comment.owner.avatarUrl;
    }

    avatar.crossOrigin = "anonymous";
    commentAvatar.appendChild(avatar);
  }

  commentContainer.appendChild(commentAvatar);

  commentContainer.appendChild(commentInfo);
  commentInfo.appendChild(commentInfoOwner);
  commentInfoOwner.appendChild(commentOwner);
  commentInfoOwner.appendChild(createdTime);
  commentInfoOwner.appendChild(editedText);
  commentInfo.appendChild(commentInfoDesc);
  commentInfoDesc.appendChild(commentText);

  btns.appendChild(likeBtn);
  btns.appendChild(editBtn);
  btns.appendChild(deleteBtn);
  commentContainer.appendChild(btns);

  newComment.appendChild(commentContainer);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // <- telling Express that we are sending JSON
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { commentInfoJSON } = await response.json();
    const commentInfo = JSON.parse(commentInfoJSON);
    addComment(commentInfo);
    commentsCount.innerText = parseInt(commentsCount.innerText) + 1;
    commentsCountUnit.innerText =
      commentsCount.innerText === "1" ? " Comment" : " Comments";

    const deleteBtn = document.querySelector(
      ".video__comment__buttons__delete"
    );

    deleteBtn.addEventListener("click", () => {
      addAlertBox(deleteBtn, "deleteComment");
      document
        .querySelector(".alert__link")
        .addEventListener("click", handleDelete);
    });
  }
};

const handleDelete = async (event) => {
  event.preventDefault();
  let deleteBtn = "";

  if (event.target.tagName == "SPAN") {
    deleteBtn = event.target.parentElement;
  } else if (event.target.tagName == "A") {
    deleteBtn = event.target;
  }

  const videoCommentContainer =
    deleteBtn.parentElement.parentElement.parentElement;
  const li = videoCommentContainer.parentElement;

  const commentId = li.dataset.id;
  const videoId = videoContainer.dataset.id;

  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json", // <- telling Express that we are sending JSON
    },
    body: JSON.stringify({ videoId }),
  });

  if (response.status === 200) {
    const alertBox = document.querySelector(".alertContainer");
    alertBox.remove();
    document.body.removeEventListener("click", deleteAlertBox);

    li.style.transform = "translateX(2000px)";
    setTimeout(() => {
      li.remove();
    }, 800);
    commentsCount.innerText = parseInt(commentsCount.innerText) - 1;
    commentsCountUnit.innerText =
      commentsCountUnit.innerText == 1 ? " Comment" : " Comments";
  }
};

const handleEdit = (event) => {
  let editBtn = "";

  if (event.target.tagName == "I") {
    editBtn = event.target.parentElement;
  } else if (event.target.tagName == "BUTTON") {
    editBtn = event.target;
  }

  const commentSection = editBtn.parentElement.parentElement;
  const commentText = commentSection.childNodes[1].childNodes[1].innerText;

  const videoComment = commentSection.parentElement;

  const commentEditContainer = document.createElement("div");
  const commentEditContainerForm = document.createElement("form");
  const commentEditContainerFormTextArea = document.createElement("textarea");

  const commentEditContainerFormButtons = document.createElement("div");
  const commentEditContainerFormButton1 = document.createElement("button");
  const commentEditContainerFormButton2 = document.createElement("button");
  const commentEditContainerFormButtonIcon = document.createElement("i");
  const commentEditContainerFormButtonIcon2 = document.createElement("i");

  commentEditContainerFormButtonIcon.className = "fas fa-check";
  commentEditContainerFormButtonIcon2.className = "fas fa-times";

  commentEditContainerFormButton1.className =
    "video__comment__edit__buttons__submit tooltip";
  commentEditContainerFormButton2.className =
    "video__comment__edit__buttons__cancel tooltip";
  commentEditContainerFormButton1.setAttribute("tooltip", "Submit");
  commentEditContainerFormButton2.setAttribute("tooltip", "Cancel");

  commentEditContainerFormTextArea.value = commentText;
  commentEditContainerFormTextArea.id = "editTextArea";
  commentEditContainerForm.id = "commentEditForm";
  commentEditContainer.className = "video__comment__edit__container";

  commentEditContainerFormButtons.className = "video__comment__edit__buttons";

  commentEditContainerFormButton1.append(commentEditContainerFormButtonIcon);
  commentEditContainerFormButton2.append(commentEditContainerFormButtonIcon2);

  commentEditContainerFormButtons.append(commentEditContainerFormButton1);
  commentEditContainerFormButtons.append(commentEditContainerFormButton2);

  commentEditContainerForm.append(commentEditContainerFormTextArea);
  commentEditContainerForm.append(commentEditContainerFormButtons);

  commentEditContainer.append(commentEditContainerForm);

  videoComment.append(commentEditContainer);

  videoComment.style.backgroundColor = "#d0ffc0";
  videoComment.style.color = "#202020";
  editBtn.classList.add("hidden");

  commentEditContainerFormButton1.addEventListener("click", handleEditSubmit);
  commentEditContainerFormButton2.addEventListener("click", handleEditCancel);
};

const handleEditSubmit = async (event) => {
  event.preventDefault();

  let submitBtn = "";

  if (event.target.tagName == "I") {
    submitBtn = event.target.parentElement;
  } else if (event.target.tagName == "BUTTON") {
    submitBtn = event.target;
  }

  const li = submitBtn.parentElement.parentElement.parentElement.parentElement;
  const commentId = li.dataset.id;

  const textArea = li.querySelector("#editTextArea");
  const text = textArea.value;

  if (text.trim() === "") {
    return;
  }

  const response = await fetch(`/api/comments/${commentId}/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // <- telling Express that we are sending JSON
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 200) {
    const textSpan = li.querySelector(
      ".video__comment__info__description__span"
    );
    const edited = li.querySelector(".video__comment__info__edited");
    textSpan.innerText = text;
    edited.innerText = "(Edited)";

    restoreEditComment(submitBtn);
  }
};

const handleEditCancel = (event) => {
  event.preventDefault();

  let cancelBtn = "";

  if (event.target.tagName == "I") {
    cancelBtn = event.target.parentElement;
  } else if (event.target.tagName == "BUTTON") {
    cancelBtn = event.target;
  }
  restoreEditComment(cancelBtn);
};

const restoreEditComment = (btn) => {
  const videoComment =
    btn.parentElement.parentElement.parentElement.parentElement;

  videoComment.style.backgroundColor = "";
  videoComment.style.color = "";

  const commentEditContainer = videoComment.querySelector(
    ".video__comment__edit__container"
  );
  commentEditContainer.remove();

  const editBtn = videoComment.querySelector(".video__comment__buttons__edit");
  editBtn.classList.remove("hidden");
};

const handleCommentLike = async (event) => {
  event.preventDefault();

  let likeCommentBtn = "";

  if (event.target.tagName == "I" || event.target.tagName == "SPAN") {
    likeCommentBtn = event.target.parentElement;
  } else if (event.target.tagName == "BUTTON") {
    likeCommentBtn = event.target;
  }

  const likeCommentCount = likeCommentBtn.querySelector(".likeCommentCount");

  const commentId =
    likeCommentBtn.parentElement.parentElement.parentElement.dataset.id;

  const response = await fetch(`/api/comments/${commentId}/like`, {
    method: "POST",
  });

  if (response.status === 200) {
    likeCommentBtn.classList.add("liked");
    likeCommentBtn.setAttribute("tooltip", "Liked!");
    likeCommentCount.innerText = parseInt(likeCommentCount.innerText) + 1;
    likeCommentBtn.removeEventListener("click", handleCommentLike);
    likeCommentBtn.addEventListener("click", handleCommentUnlike);
  } else if (response.status === 400) {
    addAlertBox(likeCommentBtn, "comment");
  }
};

const handleCommentUnlike = async (event) => {
  event.preventDefault();

  let likeCommentBtn = "";

  if (event.target.tagName == "I" || event.target.tagName == "SPAN") {
    likeCommentBtn = event.target.parentElement;
  } else if (event.target.tagName == "BUTTON") {
    likeCommentBtn = event.target;
  }

  const likeCommentCount = likeCommentBtn.querySelector(".likeCommentCount");

  const commentId =
    likeCommentBtn.parentElement.parentElement.parentElement.dataset.id;

  const response = await fetch(`/api/comments/${commentId}/unlike`, {
    method: "POST",
  });

  if (response.status === 200) {
    likeCommentBtn.classList.remove("liked");
    likeCommentBtn.setAttribute("tooltip", "Like!");
    likeCommentCount.innerText = parseInt(likeCommentCount.innerText) - 1;
    likeCommentBtn.removeEventListener("click", handleCommentUnlike);
    likeCommentBtn.addEventListener("click", handleCommentLike);
  }
};

const btnAddEventListener = () => {
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  const deleteBtns = document.querySelectorAll(
    ".video__comment__buttons__delete"
  );
  if (deleteBtns) {
    deleteBtns.forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", () => {
        addAlertBox(deleteBtn, "deleteComment");
        document
          .querySelector(".alert__link")
          .addEventListener("click", handleDelete);
      });
    });
  }

  const editBtns = document.querySelectorAll(".video__comment__buttons__edit");
  if (editBtns) {
    editBtns.forEach((editBtn) => {
      editBtn.addEventListener("click", handleEdit);
    });
  }

  const likeBtns = document.querySelectorAll(".video__comment__buttons__like");
  if (likeBtns) {
    likeBtns.forEach((likeBtn) => {
      if (likeBtn.classList.contains("liked")) {
        likeBtn.addEventListener("click", handleCommentUnlike);
      } else {
        likeBtn.addEventListener("click", handleCommentLike);
      }
    });
  }
};

btnAddEventListener();
