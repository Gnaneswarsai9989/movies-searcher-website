// 🔥 IMPORTS
import { db, auth } from "./firebase.js";


import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/// 🎬 DOM READY
document.addEventListener("DOMContentLoaded", () => {

  // 🔒 Global Subscription Status
  let isSubscribed = false;
  /* =============================
     🔐 PROFILE NAME + PHOTO
  ============================== */

  const profileName = document.getElementById("profileName");
  const profileAvatar = document.getElementById("profileAvatar");

 onAuthStateChanged(auth, async (user) => {
  // 🔒 Check subscription from Firestore
const userSnap = await getDoc(doc(db, "users", user.uid));

if (userSnap.exists() && userSnap.data().isSubscribed) {
  isSubscribed = true;
}

    if (user) {

// 🔊 Welcome Audio – Play Only Once Per Login
const audio = document.getElementById("welcomeAudio");

if (audio && !sessionStorage.getItem("welcomePlayed")) {

  const playOnce = () => {
    audio.play().catch(() => {});
    sessionStorage.setItem("welcomePlayed", "true");

    document.removeEventListener("click", playOnce);
    document.removeEventListener("keydown", playOnce);
  };

  // Trigger after first interaction
  document.addEventListener("click", playOnce);
  document.addEventListener("keydown", playOnce);
}      // NAME
      if (profileName) {
        if (user.displayName) {
          profileName.innerText = user.displayName;
        } else if (user.email) {
          const namePart = user.email.split("@")[0];
          profileName.innerText =
            namePart.charAt(0).toUpperCase() +
            namePart.slice(1);
        }
      }

      // PHOTO
      if (profileAvatar) {
        profileAvatar.src =
          user.photoURL ? user.photoURL : "default-avatar.png";
      }

    } else {

      if (profileName) profileName.innerText = "Guest";
      if (profileAvatar) profileAvatar.src = "default-avatar.png";

    }

  });


  /* =============================
     🎬 ELEMENTS
  ============================== */

  const movieGrid = document.getElementById("movieGrid");
  const closeVideo = document.getElementById("closeVideo");
  const watchlistBtn = document.getElementById("watchlistBtn");

  const profileBtn = document.getElementById("profileBtn");
  const profilePanel = document.getElementById("profilePanel");
  const closeProfile = document.getElementById("closeProfile");

  const logoutBtn = document.getElementById("logoutBtn");
  const switchAccount = document.getElementById("switchAccount");
  const helpBtn = document.getElementById("helpBtn");

  const genreButtons = document.querySelectorAll(".genre-btn");
  const clearBtn = document.getElementById("clearSearch");
  const searchInput = document.getElementById("searchInput");

  const sendBtn = document.getElementById("sendSuggestion");

  let currentMovie = null;
  let allMovies = [];


  /* =============================
     🚀 LOAD MOVIES
  ============================== */

  async function loadMovies() {

    try {

      const snapshot = await getDocs(collection(db, "movies"));
      allMovies = [];

      snapshot.forEach(docSnap => {
        allMovies.push(docSnap.data());
      });

      displayMovies("All");

    } catch (error) {
      console.error("Firebase Error:", error);
    }
  }


 /* =============================
   🎬 DISPLAY MOVIES
============================== */

function displayMovies(filter) {

  if (!movieGrid) return;

  movieGrid.innerHTML = "";

  let filtered = filter === "All"
    ? allMovies
    : allMovies.filter(movie =>
        movie.genre &&
        movie.genre.toLowerCase().includes(filter.toLowerCase())
      );

  // 🔥 LIMIT TO ONLY 10 MOVIES WHEN SHOWING ALL (TRENDING)
  if (filter === "All") {
    filtered = filtered.slice(0, 12);
  }

  filtered.forEach(movie => {

    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <div class="latest-badge">LATEST</div>
      <img src="${movie.poster}" alt="${movie.title}">
      <div class="movie-overlay-info">
        <h4 class="movie-title">${movie.title}</h4>
        <p class="movie-genre">${movie.genre}</p>
        <span class="movie-rating">⭐ ${movie.rating}</span>
      </div>
    `;

    card.addEventListener("click", () => openTrailer(movie));
    movieGrid.appendChild(card);
  });
}
async function openTrailer(movie) {

  const user = auth.currentUser;

  if (!user) {
    alert("Login first");
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists() || !userDoc.data().isSubscribed) {
    alert("Subscribe to watch this movie 🔒");
    return;
  }

  currentMovie = movie;

  let videoId = "";

  if (movie.video.includes("watch?v=")) {
    videoId = movie.video.split("v=")[1].split("&")[0];
  } else if (movie.video.includes("youtu.be/")) {
    videoId = movie.video.split("youtu.be/")[1].split("?")[0];
  }

  const videoSection = document.getElementById("videoSection");
  const frame = document.getElementById("fullTrailerFrame");

  document.getElementById("trailerTitle").innerText = movie.title;
  document.getElementById("trailerRating").innerText = "⭐ " + movie.rating;

  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  videoSection.style.display = "flex";
  document.body.classList.add("cinema-open");
}
  /* =============================
     ❌ CLOSE TRAILER
  ============================== */

  if (closeVideo) {
    closeVideo.addEventListener("click", () => {

      const videoSection = document.getElementById("videoSection");
      const frame = document.getElementById("fullTrailerFrame");

      videoSection.style.display = "none";
      frame.src = "";
      document.body.classList.remove("cinema-open");

    });
  }


/* =============================
   ❤️ WATCHLIST (FIXED STRUCTURE)
============================== */

if (watchlistBtn) {

  watchlistBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!currentMovie) {
      alert("Select a movie first");
      return;
    }

    try {

      const movieData = {
        id: currentMovie.title,
        title: currentMovie.title || "",
        poster: currentMovie.poster || "",
        addedAt: new Date()
      };

      if (currentMovie.video) {
        movieData.trailer = currentMovie.video;
      }

      await setDoc(
        doc(db, "users", user.uid, "watchlist", currentMovie.title),
        movieData
      );

      alert("Added to Watchlist ❤️");

    } catch (error) {
      console.error("Watchlist error:", error);
      alert(error.message);
    }

  });

}

  /* =============================
     🔍 SEARCH
  ============================== */

  if (searchInput) {

    searchInput.addEventListener("input", (e) => {

      const text = e.target.value.toLowerCase().trim();

      if (text === "") {
        displayMovies("All");
        return;
      }

      const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(text) ||
        (movie.genre && movie.genre.toLowerCase().includes(text))
      );

      movieGrid.innerHTML = "";

      filtered.forEach(movie => {

        const card = document.createElement("div");
        card.classList.add("movie-card");

        card.innerHTML = `
          <div class="latest-badge">LATEST</div>
          <img src="${movie.poster}">
          <div class="movie-overlay-info">
            <h4>${movie.title}</h4>
            <p>${movie.genre}</p>
            <span>⭐ ${movie.rating}</span>
          </div>
        `;

        card.addEventListener("click", () => Trailer(movie));
        movieGrid.appendChild(card);

      });

    });
  }


  /* =============================
     🎭 GENRE FILTER
  ============================== */

  genreButtons.forEach(button => {

    button.addEventListener("click", () => {

      document.querySelector(".genre-btn.active")
        ?.classList.remove("active");

      button.classList.add("active");

      displayMovies(button.dataset.genre);

    });

  });


  /* =============================
     📝 SUBMIT RECOMMENDATION
  ============================== */

  if (sendBtn) {

    sendBtn.addEventListener("click", async () => {

      const user = auth.currentUser;
      const text = document.getElementById("userSuggestion").value;

      if (!user) {
        alert("Please login first");
        return;
      }

      if (!text || !currentMovie) {
        alert("Select a movie first");
        return;
      }

      await addDoc(collection(db, "userSuggestions"), {
        movieTitle: currentMovie.title,
        user: user.email,
        suggestion: text,
        time: new Date()
      });

      alert("Recommendation submitted 🎉");
      document.getElementById("userSuggestion").value = "";

    });

  }


  /* =============================
     👤 PROFILE PANEL
  ============================== */

  if (profileBtn && profilePanel) {
    profileBtn.addEventListener("click", () => {
      profilePanel.classList.add("active");
    });
  }

  if (closeProfile && profilePanel) {
    closeProfile.addEventListener("click", () => {
      profilePanel.classList.remove("active");
    });
  }


  /* =============================
     🔓 LOGOUT
  ============================== */

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  if (switchAccount) {
    switchAccount.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      alert("For support contact: gnaneswarsai9989@gmail.com");
    });
  }


  /* =============================
     🚀 START
  ============================== */

  loadMovies();

});