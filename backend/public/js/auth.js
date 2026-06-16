document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const passwordToggle = document.querySelector('.password-toggle');
    
    if (passwordToggle) {
      const passwordInput = document.getElementById('password');
      
      passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = this.querySelector('i');
        if (type === 'text') {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    }
    
    // Form validation
    const authForm = document.querySelector('.auth-form');
    
    if (authForm) {
      authForm.addEventListener('submit', function(e) {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        let isValid = true;
        
        // Simple validation
        if (!email.value.trim()) {
          highlightError(email, 'Email is required');
          isValid = false;
        } else if (!isValidEmail(email.value)) {
          highlightError(email, 'Please enter a valid email address');
          isValid = false;
        } else {
          removeError(email);
        }
        
        if (!password.value.trim()) {
          highlightError(password, 'Password is required');
          isValid = false;
        } else {
          removeError(password);
        }
        
        if (!isValid) {
          e.preventDefault();
        }
      });
    }
    
    // Helper functions
    function isValidEmail(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
    
    function highlightError(input, message) {
      input.classList.add('is-invalid');
      
      // Check if error message already exists
      let errorElement = input.parentElement.querySelector('.error-message');
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.parentElement.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
    }
    
    function removeError(input) {
      input.classList.remove('is-invalid');
      const errorElement = input.parentElement.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    }
  });