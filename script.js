function toggleMobileMenu() {
    const nav = document.querySelector('nav ul');
    const overlay = document.querySelector('.nav-overlay');
    nav.classList.toggle('show');
    overlay.classList.toggle('show');
}

function toggleMobileMenu() {
    const nav = document.querySelector('nav ul');
    const overlay = document.querySelector('.nav-overlay');
    const toggle = document.querySelector('.mobile-menu-toggle');

    nav.classList.toggle('show');
    overlay.classList.toggle('show');

    toggle.textContent = nav.classList.contains('show') ? '' : '☰';
}
