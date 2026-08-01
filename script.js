// ============================================
// DATA — photos now live in photos.json.
// Add new gallery photos there; each needs a stable "id" so
// field-log entries can link back to it.
// ============================================
let PHOTOS = [];
let PHOTOS_BY_ID = {};

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
// RENDER JOURNAL — loaded from trips.json
// Each trip can contain multiple entries; trips render as
// expandable accordion rows.
// ============================================
const journalList = document.getElementById("journalList");

function formatDate(isoString) {
  const d = new Date(isoString + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateRange(start, end) {
  const startD = new Date(start + "T00:00:00");
  const endD = new Date(end + "T00:00:00");
  const sameMonth = startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear();
  const startStr = startD.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = sameMonth
    ? endD.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })
    : endD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} – ${endStr}`;
}

function renderTrips(trips) {
  journalList.innerHTML = "";

  trips.forEach((trip, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "trip";

    const entryCount = trip.entries ? trip.entries.length : 0;

    wrapper.innerHTML = `
      <button class="trip__header" aria-expanded="false" aria-controls="trip-entries-${i}">
        <span class="trip__caret">▸</span>
        <span class="trip__info">
          <span class="trip__title">${trip.title}</span>
          <span class="trip__summary">${trip.summary || ""}</span>
        </span>
        <span class="trip__meta">
          <span class="trip__dates">${formatDateRange(trip.startDate, trip.endDate)}</span>
          <span class="trip__count">${entryCount} ${entryCount === 1 ? "entry" : "entries"}</span>
        </span>
      </button>
      <div class="trip__entries" id="trip-entries-${i}" hidden>
        ${(trip.entries || []).map((entry, j) => renderEntry(entry, i, j)).join("")}
      </div>
    `;

    const header = wrapper.querySelector(".trip__header");
    const entriesEl = wrapper.querySelector(".trip__entries");

    header.addEventListener("click", () => {
      const isOpen = header.getAttribute("aria-expanded") === "true";
      header.setAttribute("aria-expanded", String(!isOpen));
      entriesEl.hidden = isOpen;
      wrapper.classList.toggle("trip--open", !isOpen);
    });

    journalList.appendChild(wrapper);
  });

  // wire up per-entry photo-strip toggles and thumbnail clicks
  // (delegated once, after all entries exist in the DOM)
  journalList.querySelectorAll(".entry-photos__more").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const strip = btn.closest(".entry-photos");
      strip.classList.toggle("entry-photos--expanded");
      const hiddenCount = strip.querySelectorAll(".entry-photos__thumb--extra").length;
      btn.textContent = strip.classList.contains("entry-photos--expanded")
        ? "show less"
        : `+${hiddenCount} more`;
    });
  });

  journalList.querySelectorAll(".entry-photos__thumb").forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.stopPropagation();
      const src = thumb.getAttribute("data-full-src");
      const caption = thumb.getAttribute("data-caption") || "";
      openLightbox({ src, title: caption, location: "", elevation: "", conditions: "" });
    });
  });
}

// Resolves a single photo reference (gallery link or attached snapshot)
// into a consistent { src, caption, isGallery } shape for rendering.
function resolvePhoto(photoRef) {
  if (photoRef.type === "gallery") {
    const galleryPhoto = PHOTOS_BY_ID[photoRef.id];
    if (!galleryPhoto) return null;
    return { src: galleryPhoto.src, caption: galleryPhoto.title, isGallery: true };
  }
  if (photoRef.type === "snapshot") {
    return { src: photoRef.src, caption: photoRef.caption || "", isGallery: false };
  }
  return null;
}

// Renders the thumbnail strip for one entry: first photo visible,
// the rest hidden behind a "+N more" toggle.
function renderEntryPhotos(photoRefs) {
  if (!photoRefs || !photoRefs.length) return "";

  const resolved = photoRefs.map(resolvePhoto).filter(Boolean);
  if (!resolved.length) return "";

  const thumbsHtml = resolved.map((p, idx) => `
    <button
      class="entry-photos__thumb ${idx > 0 ? "entry-photos__thumb--extra" : ""}"
      data-full-src="${p.src}"
      data-caption="${p.caption}"
      aria-label="View photo${p.caption ? ": " + p.caption : ""}"
    >
      <img src="${p.src}" alt="${p.caption}" loading="lazy">
    </button>
  `).join("");

  const moreBtn = resolved.length > 1
    ? `<button class="entry-photos__more" type="button">+${resolved.length - 1} more</button>`
    : "";

  return `<div class="entry-photos">${thumbsHtml}${moreBtn}</div>`;
}

function renderEntry(entry, tripIndex, entryIndex) {
  return `
    <div class="trip__entry">
      <span class="trip__entry-date">${formatDate(entry.date)}</span>
      <div class="trip__entry-body">
        <p class="trip__entry-title">${entry.title}</p>
        ${entry.body ? `<p class="trip__entry-text">${entry.body}</p>` : ""}
        ${renderEntryPhotos(entry.photos)}
      </div>
      ${entry.conditions ? `<span class="trip__entry-conditions">${entry.conditions}</span>` : ""}
    </div>
  `;
}

Promise.all([
  fetch("photos.json").then(res => {
    if (!res.ok) throw new Error(`photos.json HTTP ${res.status}`);
    return res.json();
  }),
  fetch("trips.json").then(res => {
    if (!res.ok) throw new Error(`trips.json HTTP ${res.status}`);
    return res.json();
  })
])
  .then(([photos, trips]) => {
    PHOTOS = photos;
    PHOTOS_BY_ID = Object.fromEntries(photos.map(p => [p.id, p]));
    renderGallery(photos);
    renderTrips(trips);
  })
  .catch(err => {
    // Most common cause: opening index.html directly from the file
    // system (file://) instead of through a server. Browsers block
    // fetch() for local files as a security measure.
    journalList.innerHTML = `
      <p style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-faint);">
        couldn't load photos.json / trips.json — if you're viewing this from
        a local file, run a local server (e.g. Live Server) instead of
        opening index.html directly. (${err.message})
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

function typeMessage(el, text, speed = 125) {
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
