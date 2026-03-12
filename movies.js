import { db } from "./firebase.js";
import { collection, getDocs }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth } from "./firebase.js";
import { doc, setDoc, getDoc}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ===============================
   DOM ELEMENTS
================================ */

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("movieSearch");

const langButtons = document.querySelectorAll(".lang-btn");
const ratingButtons = document.querySelectorAll(".rating-btn");
const genreButtons = document.querySelectorAll(".genre-btn");

const nextBtn = document.getElementById("nextPage");
const prevBtn = document.getElementById("prevPage");

/* ===============================
   VARIABLES
================================ */

let allMovies = [];
let filteredMovies = [];

let currentPage = 1;
const moviesPerPage = 12;

let selectedLang = "All";
let selectedRating = null;
let selectedGenre = "All";

/* ===============================
   LOAD MOVIES
================================ */

async function loadMovies() {

  const snapshot = await getDocs(collection(db, "movies"));

  allMovies = [];

  snapshot.forEach(docSnap => {
    allMovies.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  filteredMovies = [...allMovies];
  renderMovies();
}

/* ===============================
   RENDER MOVIES
================================ */

async function renderMovies() {
  movieGrid.innerHTML = "";

  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;

  const pageMovies = filteredMovies.slice(start, end);

  pageMovies.forEach(movie => {

    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <div class="poster-wrapper">
        <img src="${movie.poster}" class="poster-img">

        <div class="movie-overlay">
          <button class="watchlist-btn">
            + Watchlist
          </button>
        </div>
      </div>
    `;

    const watchBtn = card.querySelector(".watchlist-btn");

    watchBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await addToWatchlist(
        movie.id,
        movie.title,
        movie.poster,
        movie.trailer
      );
    });

  card.onclick = async () => {

  const user = auth.currentUser;

  if (!user) {
    alert("Login first 🔐");
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists() || !userSnap.data().isSubscribed) {
    alert("🔒 Cinefy Premium required");
    return;
  }

  localStorage.setItem("selectedMovieId", movie.id);
  window.location.href = "movie-details.html";
};

    movieGrid.appendChild(card);
  });

  updatePaginationButtons();
}

/* ===============================
   UPDATE BUTTON VISIBILITY
================================ */

function updatePaginationButtons() {

  prevBtn.style.display = currentPage > 1 ? "inline-block" : "none";

  const hasMore =
    currentPage * moviesPerPage < filteredMovies.length;

  nextBtn.style.display = hasMore ? "inline-block" : "none";
}

/* ===============================
   FILTER LOGIC
================================ */

function applyFilters() {

  filteredMovies = allMovies.filter(movie => {

    const matchLang =
      selectedLang === "All" ||
      movie.language
        ?.toLowerCase()
        .includes(selectedLang.toLowerCase());

    const matchRating =
      !selectedRating ||
      parseFloat(movie.rating) >= selectedRating;

    const matchGenre =
      selectedGenre === "All" ||
      movie.genre
        ?.toLowerCase()
        .includes(selectedGenre.toLowerCase());

    const matchSearch =
      movie.title
        ?.toLowerCase()
        .includes(searchInput.value.toLowerCase());

    return matchLang && matchRating && matchGenre && matchSearch;
  });

  currentPage = 1;
  renderMovies();
}

/* ===============================
   SEARCH
================================ */

searchInput.addEventListener("input", applyFilters);

/* ===============================
   FILTER BUTTONS
================================ */

langButtons.forEach(btn => {
  btn.onclick = () => {
    document.querySelector(".lang-btn.active")
      ?.classList.remove("active");
    btn.classList.add("active");
    selectedLang = btn.dataset.lang;
    applyFilters();
  };
});

ratingButtons.forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".rating-btn")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedRating = parseFloat(btn.dataset.rating);
    applyFilters();
  };
});

genreButtons.forEach(btn => {
  btn.onclick = () => {
    document.querySelector(".genre-btn.active")
      ?.classList.remove("active");
    btn.classList.add("active");
    selectedGenre = btn.dataset.genre;
    applyFilters();
  };
});

/* ===============================
   PAGINATION
================================ */

nextBtn.onclick = () => {
  currentPage++;
  renderMovies();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

prevBtn.onclick = () => {
  currentPage--;
  renderMovies();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

/* ===============================
   WATCHLIST FUNCTION
================================ */

window.addToWatchlist = async function(id, title, poster, trailer) {

  const user = auth.currentUser;

  if (!user) {
    alert("Please login first!");
    return;
  }

  try {

    const movieData = {
      id: id || "",
      title: title || "",
      poster: poster || "",
      addedAt: new Date()
    };

    if (trailer) {
      movieData.trailer = trailer;
    }

    await setDoc(
      doc(db, "users", user.uid, "watchlist", id),
      movieData
    );

    alert("Added to Watchlist ❤️");

  } catch (error) {
    console.error("FULL ERROR:", error);
    alert(error.message);
  }
};

/* ===============================
   START
================================ */

loadMovies();