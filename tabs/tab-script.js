function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
}
