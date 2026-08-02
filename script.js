// ============================================
// DATA — photos now live in photos.json.
// Add new gallery photos there; each needs a stable "id" so
// field-log entries can link back to it.
// ============================================
let PHOTOS = [];

// ============================================
// RENDER GALLERY
// ============================================
const galleryGrid = document.getElementById("galleryGrid");

function renderGallery(photos) {
  galleryGrid.innerHTML = "";
  photos.forEach((photo, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${photo.title}`);
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.title} — ${photo.location}" loading="lazy">
      <div class="card__meta">
        <span class="loc">${photo.location}</span>
        <span>${photo.elevation} · ${photo.conditions}</span>
      </div>
    `;
    card.addEventListener("click", () => openLightbox(photo));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") openLightbox(photo);
    });
    galleryGrid.appendChild(card);
  });
}

// ============================================
// RENDER JOURNAL — moved to journal.js
// (shared between this homepage and archive.html)
// ============================================

Promise.all([
  fetch("photos.json").then(res => {
    if (!res.ok) throw new Error(`photos.json HTTP ${res.status}`);
    return res.json();
  })
])
  .then(([photos]) => {
    PHOTOS = photos;
    renderGallery(photos);
  })
  .catch(err => {
    // Most common cause: opening index.html directly from the file
    // system (file://) instead of through a server. Browsers block
    // fetch() for local files as a security measure.
    galleryGrid.innerHTML = `
      <p style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-faint);">
        couldn't load photos.json — if you're viewing this from a local
        file, run a local server (e.g. Live Server) instead of opening
        index.html directly. (${err.message})
      </p>`;
  });

// ============================================
// LIGHTBOX
// ============================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxMeta = document.getElementById("lightboxMeta");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(photo) {
  lightboxImg.src = photo.src;
  lightboxImg.alt = photo.title || "";
  const metaLine = [photo.elevation, photo.conditions].filter(Boolean).join(" · ");
  lightboxMeta.innerHTML = `
    ${photo.location ? `<span class="loc">${photo.location}</span> — ` : ""}${photo.title || ""}
    ${metaLine ? `<br>${metaLine}` : ""}
  `;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// ============================================
// FIELD LOG — typewriter readout in hero
// (purely cosmetic; swap the message for real per-shoot data if you like)
// ============================================
const fieldlogLine = document.getElementById("fieldlogLine");

function buildFieldlogMessage() {
  const now = new Date();
  const hour = now.getHours();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let light;
  if (hour >= 5 && hour < 7) light = "golden hour — go now";
  else if (hour >= 7 && hour < 17) light = "flat daylight — scouting only";
  else if (hour >= 17 && hour < 19) light = "golden hour — go now";
  else if (hour >= 19 && hour < 20) light = "blue hour";
  else light = "dark — resting";
  return `local time ${timeStr} · ${light}`;
}

function typeMessage(el, text, speed = 28) {
  let i = 0;
  el.textContent = "";
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

typeMessage(fieldlogLine, buildFieldlogMessage());

// ============================================
// NAV STATUS DOT — reflects the same light logic
// ============================================
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

function updateStatus() {
  const hour = new Date().getHours();
  const goldenHour = (hour >= 5 && hour < 7) || (hour >= 17 && hour < 19);
  if (goldenHour) {
    statusDot.classList.add("gold");
    statusText.textContent = "golden hour now";
  } else {
    statusDot.classList.remove("gold");
    statusText.textContent = "shooting: on location";
  }
}
updateStatus();

// ============================================
// CONTACT FORM (front-end only — wire up to your
// own backend/service, e.g. Formspree, Netlify Forms)
// ============================================
const contactForm = document.getElementById("contactForm");
const contactNote = document.getElementById("contactNote");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  contactNote.textContent = "$ message queued — this form isn't wired to a backend yet.";
  contactForm.reset();
});

// ============================================
// FOOTER YEAR
// ============================================
document.getElementById("year").textContent = new Date().getFullYear();
