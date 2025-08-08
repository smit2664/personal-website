// === Image & Modal Data ===
const images = [
  { src: "photos/01.jpg", caption: "Portland Head Lighthouse - Cape Elizabeth, Maine" },
  { src: "photos/02.jpg", caption: "Schönbrunn Palace - Vienna, Austria" },
  { src: "photos/03.jpg", caption: "Point Betsie Lighthouse - Frankfort, Michigan" },
  { src: "photos/04.jpg", caption: "Sun and Moon" },
  { src: "photos/05.jpg", caption: "Marblehead Lighthouse - Marblehead, Ohio" },
  { src: "photos/06.jpg", caption: "St Joseph North Pier Outer Lighthouse - St. Joseph, Michigan" },
  { src: "photos/07.jpg", caption: "St. Peter Cathedral - Regensburg, Germany" },
  { src: "photos/08.jpg", caption: "Old Faithful - Yellowstone National Park" },
  { src: "photos/09.jpg", caption: "Grand Teton - Grand Teton National Park" },
  { src: "photos/10.jpg", caption: "Lake Minnewanka - Banff National Park" },
  { src: "photos/11.jpg", caption: "Mount Rundle - Alberta, Canada" },
  { src: "photos/12.jpg", caption: "Mackinac Bridge - Mackinac City, Michigan" },
  { src: "photos/13.jpg", caption: "Windmills - Kinderdijk, The Netherlands" },
  { src: "photos/14.jpg", caption: "Cologne Catherdral - Cologne, Germany" },
  { src: "photos/15.jpg", caption: "Signal Mountain - Jackson, Wyoming" },
  { src: "photos/16.jpg", caption: "St. Paul's Cathedral - Strasbourg, France" },
  { src: "photos/17.jpg", caption: "XX - XX" },
  { src: "photos/18.jpg", caption: "XX - XX" },
  { src: "photos/19.jpg", caption: "Cologne Catherdral - Cologne, Germany" },
  { src: "photos/20.jpg", caption: "Windmills - Kinderdijk, The Netherlands" },
  { src: "photos/21.jpg", caption: "St. Jakobus Church - Rüdesheim am Rhein, Germany" },
  { src: "photos/22.jpg", caption: "St. Jakobus Church - Rüdesheim am Rhein, Germany" },
  { src: "photos/23.jpg", caption: "Windmill - Kinderdijk, The Netherlands" },
  { src: "photos/24.jpg", caption: "St. Jakobus Church - Rüdesheim am Rhein, Germany" }
];

// === Preload Full-Size Modal Images ===
const preloadedImages = [];
images.forEach((img) => {
  const preload = new Image();
  preload.src = img.src;
  preloadedImages.push(preload);
});

// === Modal Logic ===
let currentIndex = 0;

function openModal(index) {
  currentIndex = index;
  document.getElementById("modal").style.display = "flex";
  updateModal();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function changeSlide(step) {
  currentIndex = (currentIndex + step + images.length) % images.length;
  updateModal();
}

function updateModal() {
  const modalImg = document.querySelector(".modal-image");
  const modalCaption = document.querySelector(".modal-caption");

  modalImg.classList.remove("loaded");
  modalImg.onload = () => modalImg.classList.add("loaded");

  modalImg.src = images[currentIndex].src;
  modalCaption.textContent = images[currentIndex].caption;
}

// === Keyboard Navigation for Modal ===
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("modal");
  if (modal.style.display === "flex") {
    if (e.key === "ArrowRight") changeSlide(1);
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "Escape") closeModal();
  }
});

// === Mobile Menu Toggle === 
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
}

// === Mobile Menu Test ===
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

// === Expose globally (if needed) ===
window.openModal = openModal;
window.closeModal = closeModal;
window.changeSlide = changeSlide;
window.toggleMobileMenu = toggleMobileMenu;
