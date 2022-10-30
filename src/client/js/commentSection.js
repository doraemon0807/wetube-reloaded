const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

let deleteBtns = document.querySelectorAll(".video__comment__delete");
let editBtns = document.querySelectorAll(".video__comment__edit");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";

  const icon = document.createElement("i");
  icon.className = "fas fa-comment";

  const span = document.createElement("span");
  span.innerText = text;

  const deleteBtn = document.createElement("button");
  const deleteIcon = document.createElement("i");

  deleteBtn.className = "video__comment__delete";
  deleteIcon.className = "fas fa-trash-alt";

  deleteBtn.appendChild(deleteIcon);

  const editBtn = document.createElement("button");
  const editIcon = document.createElement("i");

  editBtn.className = "video__comment__edit";
  editIcon.className = "fas fa-pen";

  editBtn.appendChild(editIcon);

  const btns = document.createElement("div");
  btns.className = "video__comment__buttons";

  const commentContainer = document.createElement("div");
  commentContainer.className = "video__comment__container";

  commentContainer.appendChild(icon);
  commentContainer.appendChild(span);
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
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
  btnAddEventListener();
};

const handleDelete = async (event) => {
  let deleteBtn = "";

  if (event.target.tagName == "I") {
    deleteBtn = event.target.parentElement;
  } else if (event.target.tagName == "BUTTON") {
    deleteBtn = event.target;
  }

  const li = deleteBtn.parentElement.parentElement.parentElement;

  console.log(li);

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
    li.remove();
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
  const commentContainer = commentSection.querySelector(
    ".video__comment__container"
  );

  const commentText =
    event.target.parentElement.parentElement.parentElement.innerText;

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
    const textSpan = li.querySelector(".video__comment__container span");
    textSpan.innerText = text;
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

  const commentEditContainer = videoComment.querySelector(
    ".video__comment__edit__container"
  );
  commentEditContainer.remove();

  const editBtn = videoComment.querySelector(".video__comment__edit");
  editBtn.classList.remove("hidden");
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const btnAddEventListener = () => {
  deleteBtns = document.querySelectorAll(".video__comment__delete");
  if (deleteBtns) {
    deleteBtns.forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", handleDelete);
    });
  }
  editBtns = document.querySelectorAll(".video__comment__edit");
  if (editBtns) {
    editBtns.forEach((editBtn) => {
      editBtn.addEventListener("click", handleEdit);
    });
  }
};

btnAddEventListener();
