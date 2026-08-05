// ============================================================
// SHARED JOURNAL RENDERER
// Used by both index.html (limit: 3 most recent trips) and
// archive.html (no limit — every trip and entry).
//
// To set a limit, add data-limit="3" to the #journalList element
// in the page's HTML. Omit it (or set no attribute) to show all.
//
// This file expects the page to already have:
//   - a <div id="journalList"> to render into
//   - the standard #lightbox / #lightboxImg / #lightboxMeta /
//     #lightboxClose markup, for photo click-throughs
// ============================================================

(function () {
  const journalList = document.getElementById("journalList");
  if (!journalList) return;

  const limit = journalList.dataset.limit ? parseInt(journalList.dataset.limit, 10) : null;

  let PHOTOS_BY_ID = {};

  function formatDate(isoString) {
    const d = new Date(isoString + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  // Turns a location name into a clean, date-free folder/file slug,
  // e.g. "Apartment" -> "apartment", "Red Rock Canyon" -> "red-rock-canyon".
  // Used only for matching up the locations/ photo folder — separate
  // from the trip's internal id (which the admin app still generates
  // with a date suffix under the hood).
  function slugify(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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

  // Resolves a single photo reference (gallery link or attached snapshot)
  // into a consistent { src, caption } shape for rendering.
  function resolvePhoto(photoRef) {
    if (photoRef.type === "gallery") {
      const galleryPhoto = PHOTOS_BY_ID[photoRef.id];
      if (!galleryPhoto) return null;
      return { src: galleryPhoto.src, caption: galleryPhoto.title };
    }
    if (photoRef.type === "snapshot") {
      return { src: photoRef.src, caption: photoRef.caption || "" };
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

  function renderEntry(entry) {
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

  function renderTrips(trips) {
    journalList.innerHTML = "";

    const list = limit ? trips.slice(0, limit) : trips;

    list.forEach((trip, i) => {
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
          <a href="location.html?trip=${encodeURIComponent(slugify(trip.location))}" class="trip__gallery-link">
            view all photos from this location →
          </a>
          ${(trip.entries || []).map(entry => renderEntry(entry)).join("")}
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
        openJournalLightbox({ src, title: caption });
      });
    });
  }

  // ---- lightbox (shared markup assumed present on the page) ----
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxMeta = document.getElementById("lightboxMeta");
  const lightboxClose = document.getElementById("lightboxClose");

  function openJournalLightbox(photo) {
    if (!lightbox) return;
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title || "";
    lightboxMeta.innerHTML = photo.title || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // ---- load data and render ----
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
      PHOTOS_BY_ID = Object.fromEntries(photos.map(p => [p.id, p]));
      renderTrips(trips);
    })
    .catch(err => {
      journalList.innerHTML = `
        <p style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-faint);">
          couldn't load photos.json / trips.json — if you're viewing this from
          a local file, run a local server (e.g. Live Server) instead of
          opening this page directly. (${err.message})
        </p>`;
    });
})();
