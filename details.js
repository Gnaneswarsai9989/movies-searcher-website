import { db } from "./firebase.js";
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const movieId = localStorage.getItem("selectedMovieId");

const hero = document.getElementById("detailsHero");
const title = document.getElementById("movieTitle");
const meta = document.getElementById("movieMeta");
const desc = document.getElementById("movieDescription");
const poster = document.getElementById("moviePoster");
const trailerFrame = document.getElementById("trailerFrame");
const trailerSection = document.getElementById("trailerSection");
const playBtn = document.getElementById("playTrailer");
const backBtn = document.getElementById("backBtn");

function getVideoId(url) {
  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regExp);
  return match ? match[1] : "";
}

async function loadMovie() {
  const docRef = doc(db, "movies", movieId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const movie = docSnap.data();

    title.innerText = movie.title;
    meta.innerText = `${movie.year} • ${movie.language} • ⭐ ${movie.rating}`;
    desc.innerText = movie.description;
    poster.src = movie.poster;

    hero.style.backgroundImage = `url(${movie.poster})`;

    playBtn.onclick = () => {
      const videoId = getVideoId(movie.video);
      trailerFrame.src =
        `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      trailerSection.style.display = "block";
      trailerSection.scrollIntoView({ behavior: "smooth" });
    };
  }
}

backBtn.onclick = () => window.history.back();

loadMovie();