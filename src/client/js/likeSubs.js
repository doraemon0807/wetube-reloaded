const videoOwnerData = document.getElementById("videoOwnerData");
const subsbtn = document.querySelector(".subsBtn");
const subsCount = document.querySelector(".subsCount");

const handleSubs = async (event) => {
  event.preventDefault();
  const { id } = videoOwnerData.dataset;
  const response = await fetch(`/api/users/${id}/subs`, { method: "POST" });

  if (response.status === 200) {
    subsbtn.innerText = "Subscribed";
    subsbtn.classList.add("subbed");
    subsbtn.removeEventListener("click", handleSubs);
    subsbtn.addEventListener("click", handleUnsubs);
  }
};

const handleUnsubs = async (event) => {
  event.preventDefault();
  const { id } = videoOwnerData.dataset;
  const response = await fetch(`/api/users/${id}/unsubs`, { method: "POST" });

  if (response.status === 200) {
    subsbtn.innerText = "Subscribe";
    subsbtn.classList.remove("subbed");
    subsbtn.removeEventListener("click", handleUnsubs);
    subsbtn.addEventListener("click", handleSubs);
  }
};

if (subsbtn.classList.contains("subbed")) {
  subsbtn.addEventListener("click", handleUnsubs);
} else {
  subsbtn.addEventListener("click", handleSubs);
}
