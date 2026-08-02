// ============================================================
// LOCATION GALLERY PAGE
//
// Expects, per location, two things living in the "locations" folder,
// named after the location itself (lowercase, spaces as dashes,
// no date needed) — e.g. for a trip whose "location" field is
// "Apartment":
//   locations/apartment.json     — a manifest: ["photo1.jpg", "photo2.jpg", ...]
//   locations/apartment/photo1.jpg  — the actual edited photo files
//
// These are entirely separate from the field-log admin's snapshots —
// this is for your polished, edited-at-home photos, organized by
// location name.
// ============================================================

const params = new URLSearchParams(window.location.search);
const tripId = params.get("trip");

// Same slug logic as journal.js — turns a location name into a
// clean, date-free folder name, e.g. "Apartment" -> "apartment".
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const locationTitle = document.getElementById("locationTitle");
const locationMeta = document.getElementById("locationMeta");
const locationSummary = document.getElementById("locationSummary");
const locationGrid = document.getElementById("locationGrid");

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

// ---- lightbox ----
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxMeta = document.getElementById("lightboxMeta");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption || "";
  lightboxMeta.textContent = caption || "";
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

// ---- render one photo into the grid ----
// Measures the image once loaded: width > height gets the "wide"
// class (2 grid columns), square/portrait stays at 1 column.
function addGridItem(src, caption) {
  const item = document.createElement("div");
  item.className = "location-grid__item";

  const img = document.createElement("img");
  img.src = src;
  img.alt = caption || "";
  img.loading = "lazy";

  img.addEventListener("load", () => {
    if (img.naturalWidth > img.naturalHeight) {
      item.classList.add("wide");
    }
  });

  img.addEventListener("error", () => {
    item.remove(); // silently skip files listed in the manifest that don't actually exist
  });

  item.appendChild(img);
  item.addEventListener("click", () => openLightbox(src, caption));
  locationGrid.appendChild(item);
}

function showEmptyState(message) {
  locationGrid.outerHTML = `<p class="location-empty">${message}</p>`;
}

// ---- main load sequence ----
if (!tripId) {
  locationTitle.textContent = "No location specified";
  showEmptyState("This page needs a trip in the URL, e.g. location.html?trip=your-trip-id.");
} else {
  fetch("trips.json")
    .then(res => {
      if (!res.ok) throw new Error(`trips.json HTTP ${res.status}`);
      return res.json();
    })
    .then(trips => {
      const trip = trips.find(t => slugify(t.location) === tripId);

      if (!trip) {
        locationTitle.textContent = "Location not found";
        showEmptyState("Couldn't find that location in trips.json.");
        return;
      }

      locationTitle.textContent = trip.title;
      locationMeta.textContent = `${trip.location} · ${formatDateRange(trip.startDate, trip.endDate)}`;
      locationSummary.textContent = trip.summary || "";
      document.title = `${trip.title} — [Your Name]`;

      // now load this location's photo manifest
      const folder = slugify(trip.location);
      return fetch(`locations/${folder}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`No manifest yet (HTTP ${res.status})`);
          return res.json();
        })
        .then(filenames => {
          if (!filenames.length) {
            showEmptyState("No photos added for this location yet — check back soon.");
            return;
          }
          filenames.forEach(filename => {
            addGridItem(`locations/${folder}/${filename}`, trip.title);
          });
        })
        .catch(() => {
          showEmptyState("Photos from this location haven't been added yet — check back soon.");
        });
    })
    .catch(err => {
      locationTitle.textContent = "Couldn't load this page";
      showEmptyState(`Something went wrong loading trip data. (${err.message})`);
    });
}
