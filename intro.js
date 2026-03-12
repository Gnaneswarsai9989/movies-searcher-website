window.addEventListener("load", function() {
  setTimeout(function() {
    const intro = document.getElementById("intro");
    if (intro) {
      intro.style.opacity = "0";
      intro.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        intro.style.display = "none";
      }, 500);
    }
  }, 2000);
});