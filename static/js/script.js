// -----------------------------
// Copy summary text to clipboard
// -----------------------------
function copySummary() {
  const text = document.getElementById("summaryBox")?.innerText;
  if (text) {
    navigator.clipboard.writeText(text);
    alert("Summary copied!");
  }
}

// -----------------------------
// Toggle background music with persistence
// -----------------------------
function toggleMusic() {
  const music = document.getElementById("bgm");
  const btn = document.querySelector(".music-toggle");
  if (!music || !btn) return;

  if (music.paused) {
    music.volume = 0.3;
    music.play().catch(err => console.warn("Autoplay blocked:", err));
    btn.setAttribute("aria-pressed", "true");
    btn.textContent = "🔊 Music On";
    localStorage.setItem("musicEnabled", "true");
  } else {
    music.pause();
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = "🔇 Music Off";
    localStorage.setItem("musicEnabled", "false");
  }
}

// -----------------------------
// Apply saved music setting on page load
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bgm");
  const btn = document.querySelector(".music-toggle");
  const musicEnabled = localStorage.getItem("musicEnabled");

  if (music && btn) {
    if (musicEnabled === "true") {
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "🔊 Music On";
      music.volume = 0.3;
      music.play().catch(() => {}); // try autoplay
    } else {
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "🔇 Music Off";
      music.pause();
    }
  }

  // -----------------------------
  // Star rating + sound effect
  // -----------------------------
  let soundMuted = localStorage.getItem("soundEnabled") === "false";
  const soundToggle = document.getElementById("soundToggle");
  if (soundToggle) {
    soundToggle.textContent = soundMuted ? "🔇" : "🔈";
    soundToggle.setAttribute("aria-pressed", !soundMuted);

    soundToggle.addEventListener("click", () => {
      soundMuted = !soundMuted;
      soundToggle.textContent = soundMuted ? "🔇" : "🔈";
      soundToggle.setAttribute("aria-pressed", !soundMuted);
      localStorage.setItem("soundEnabled", !soundMuted);
      alert(soundMuted ? "Sound effects muted" : "Sound effects unmuted");
    });

    soundToggle.addEventListener("keypress", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        soundToggle.click();
      }
    });
  }

  const stars = document.querySelectorAll(".star");
  const ratingMessage = document.getElementById("ratingMessage");

  stars.forEach(star => {
    star.addEventListener("mouseenter", () => {
      stars.forEach(s => s.classList.remove("hover"));
      for (let i = 0; i < star.dataset.value; i++) {
        stars[i].classList.add("hover");
      }
    });

    star.addEventListener("mouseleave", () => {
      stars.forEach(s => s.classList.remove("hover"));
    });

    star.addEventListener("click", () => {
      stars.forEach(s => s.classList.remove("selected"));
      for (let i = 0; i < star.dataset.value; i++) {
        stars[i].classList.add("selected");
      }

      const rating = parseInt(star.getAttribute("data-value"));
      if (ratingMessage) {
        ratingMessage.textContent = `You rated this summary ${rating} star${rating > 1 ? "s" : ""}!`;
        setTimeout(() => (ratingMessage.textContent = ""), 3000);
      }

      if (!soundMuted) {
        const audio = document.getElementById("sound-star");
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
      }
    });
  });

  // -----------------------------
  // Show loading animation
  // -----------------------------
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", () => {
      const loading = document.getElementById("loadingAnimation");
      if (loading) loading.style.display = "block";
    });
  }

  // -----------------------------
  // File Upload Display
  // -----------------------------
  const fileInput = document.getElementById("document");
  const fileName = document.getElementById("fileName");

  if (fileInput && fileName) {
    fileInput.addEventListener("change", () => {
      fileName.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : "No file chosen";
    });
  }

  // -----------------------------
  // Toggle navbar upload form
  // -----------------------------
  const uploadToggle = document.getElementById("uploadToggle");
  const formContainer = document.getElementById("uploadFormContainer");

  if (uploadToggle && formContainer) {
    uploadToggle.addEventListener("click", () => {
      formContainer.style.display = formContainer.style.display === "none" ? "flex" : "none";
    });
  }
});

// -----------------------------
// Scroll home button behavior
// -----------------------------
function goHome() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
}

// -----------------------------
// Theme toggle logic placeholder
// -----------------------------
function toggleTheme() {
  // Add dark/light or pixel toggle logic here
}
