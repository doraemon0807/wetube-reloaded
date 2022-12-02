import { addAlertBox } from "./main";

const hamburger = document.querySelector(".header__hamburger");
const hamburgerMenu = document.querySelector(".header__hamburger__menu");

const logout = document.getElementById("logout");

if (hamburger) {
  hamburger.addEventListener("click", (event) => {
    if (hamburgerMenu.contains(event.target)) {
      return;
    } else {
      hamburgerMenu.classList.toggle("hamburger__hidden");
      hamburger.classList.toggle("hamburger__selected");
    }
  });

  logout.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("hamburger__hidden");
    hamburger.classList.toggle("hamburger__selected");
    addAlertBox(hamburger, "logout");
    const alertBox = document.querySelector(".alertContainer");
    alertBox.style.transform = "translate(-100px,200px)";
  });
}

const darkmode = document.querySelector(".header__darkmode");
const darkmodeIcon = darkmode.querySelector("i");
let mode;

const handleDarkmode = () => {
  refreshMode();
  switch (mode) {
    case "darkmode":
      localStorage.setItem("mode", "default");
      darkmode.setAttribute("tooltip", "Dark Mode");
      break;
    case "default":
    case null:
      localStorage.setItem("mode", "darkmode");
      darkmode.setAttribute("tooltip", "Light Mode");
      break;
  }
  switchDarkmode();
};

const checkDarkmode = () => {
  switch (mode) {
    case "darkmode":
      switchDarkmode();
      darkmode.setAttribute("tooltip", "Light Mode");
      break;
    case "default":
    case null:
      darkmode.setAttribute("tooltip", "Dark Mode");
      break;
  }
};

const switchDarkmode = () => {
  darkmodeIcon.classList.toggle("fa-sun");
  darkmodeIcon.classList.toggle("fa-moon");
  document.body.classList.toggle("default");
  document.body.classList.toggle("darkmode");
};

const refreshMode = () => {
  mode = localStorage.getItem("mode");
};

refreshMode();
checkDarkmode();

darkmode.addEventListener("click", handleDarkmode);
