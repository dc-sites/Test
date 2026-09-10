document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    // Create scroll up/down buttons
    const scrollUpBtn = document.createElement('button');
    scrollUpBtn.className = 'menu-scroll-btn scroll-up-btn';
    scrollUpBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    scrollUpBtn.title = 'Scroll Up';

    const scrollDownBtn = document.createElement('button');
    scrollDownBtn.className = 'menu-scroll-btn scroll-down-btn';
    scrollDownBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    scrollDownBtn.title = 'Scroll Down';

    // Insert buttons before and after the nav container
    sidebarNav.parentNode.insertBefore(scrollUpBtn, sidebarNav);
    sidebarNav.parentNode.insertBefore(scrollDownBtn, sidebarNav.nextSibling);

    // Scroll actions
    const scrollAmount = 150;
    scrollUpBtn.addEventListener('click', () => {
        sidebarNav.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    });

    scrollDownBtn.addEventListener('click', () => {
        sidebarNav.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    });

    // Toggle button visibility based on scroll position
    function updateScrollButtonVisibility() {
        const { scrollTop, scrollHeight, clientHeight } = sidebarNav;
        scrollUpBtn.style.display = scrollTop > 10 ? 'flex' : 'none';
        scrollDownBtn.style.display = scrollTop + clientHeight < scrollHeight - 10 ? 'flex' : 'none';
    }

    sidebarNav.addEventListener('scroll', updateScrollButtonVisibility);
    window.addEventListener('resize', updateScrollButtonVisibility);
    
    // Initial check
    updateScrollButtonVisibility();
});
