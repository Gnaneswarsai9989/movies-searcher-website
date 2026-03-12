import { auth, provider } from "./firebase.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleLogin");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const signupContainer = document.getElementById("signupContainer");



// Toggle Signup Mode
showSignup.addEventListener("click", () => {
  signupContainer.style.display = "block";
  loginBtn.style.display = "none";
  showSignup.style.display = "none";
  showLogin.style.display = "inline";
});

showLogin.addEventListener("click", () => {
  signupContainer.style.display = "none";
  loginBtn.style.display = "block";
  showSignup.style.display = "inline";
  showLogin.style.display = "none";
});

// Email Login
loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      alert("Login Successful!");
      window.location.href = "intro.html";
    })
    .catch(error => alert(error.message));
});

// Signup
signupBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      alert("Account Created Successfully!");
      window.location.href = "intro.html";
    })
    .catch(error => alert(error.message));
});

// Google Login
googleBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Google Login Successful!");
      window.location.href = "intro.html";
    })
    .catch(error => alert(error.message));
});