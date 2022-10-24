const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".video__comment__delete");

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

  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(deleteBtn);

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
};

const handleDelete = async (event) => {
  let li = event.target.parentElement;

  if (li.tagName == "BUTTON") {
    li = event.target.parentElement.parentElement;
  }

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

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteBtns) {
  deleteBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDelete);
  });
}
