function toggleMobileMenu() {
    const nav = document.querySelector('nav ul');
    const overlay = document.querySelector('.nav-overlay');
    const toggle = document.querySelector('.mobile-menu-toggle');

    nav.classList.toggle('show');
    overlay.classList.toggle('show');
    document.body.classList.toggle('menu-open');

    toggle.textContent = nav.classList.contains('show') ? '' : '☰';
}
