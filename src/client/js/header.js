import { addAlertBox } from "./main";

const hamburger = document.querySelector(".header__hamburger");
const hamburgerMenu = document.querySelector(".header__hamburger__menu");
const hamburgerIcon = document.querySelector(".header__hamburger__icon");

const logout = document.getElementById("logout");

const handleRemoveHamburger = (event) => {
  if (event.target === hamburgerIcon || hamburgerIcon.contains(event.target)) {
    return;
  } else {
    hamburgerMenu.classList.toggle("hamburger__hidden");
    hamburger.classList.toggle("hamburger__selected");
    document.body.removeEventListener("click", handleRemoveHamburger);
  }
};

if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("hamburger__hidden");
    hamburger.classList.toggle("hamburger__selected");
    document.body.addEventListener("click", handleRemoveHamburger);
  });

  logout.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("hamburger__hidden");
    addAlertBox(hamburgerIcon, "logout");
    const alertBox = document.querySelector(".alertContainer");
    alertBox.style.transform = "translateY(200px)";
  });
}
