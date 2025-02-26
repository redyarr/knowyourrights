document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (mobileMenu) {
      mobileMenu.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        navbarMenu.classList.toggle('active');
        
        // Toggle the bars to form an X
        const bars = mobileMenu.querySelectorAll('.bar');
        if (mobileMenu.classList.contains('active')) {
          bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
          bars[1].style.opacity = '0';
          bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
          bars[0].style.transform = 'none';
          bars[1].style.opacity = '1';
          bars[2].style.transform = 'none';
        }
      });
    }
    
    // Handle dropdowns on mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (window.innerWidth <= 992) {
      dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        
        dropdownToggle.addEventListener('click', function(e) {
          e.preventDefault();
          dropdown.classList.toggle('active');
        });
      });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (
        navbarMenu.classList.contains('active') && 
        !e.target.closest('.navbar-menu') && 
        !e.target.closest('.navbar-toggle')
      ) {
        mobileMenu.classList.remove('active');
        navbarMenu.classList.remove('active');
        
        const bars = mobileMenu.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });
    
    // Add shadow on scroll
    window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }
    });
  });