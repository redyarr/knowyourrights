document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenu = document.getElementById('mobile-menu');
  const navbarMenu = document.getElementById('navbar-menu');
  
  if (mobileMenu && navbarMenu) {
    mobileMenu.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      navbarMenu.classList.toggle('active');
    });
  }
  
  // Dropdown functionality
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      // Prevent default behavior only on mobile
      if (window.innerWidth <= 960) {
        e.preventDefault();
        
        // Toggle aria-expanded attribute
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        
        // Close other dropdowns
        dropdownToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            otherToggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 960 && 
        navbarMenu.classList.contains('active') && 
        !e.target.closest('.navbar-container')) {
      mobileMenu.classList.remove('active');
      navbarMenu.classList.remove('active');
    }
  });
  
  // Close mobile menu when window is resized above mobile breakpoint
  window.addEventListener('resize', function() {
    if (window.innerWidth > 960) {
      if (mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        navbarMenu.classList.remove('active');
      }
      
      // Reset aria-expanded on all dropdown toggles
      dropdownToggles.forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });
});