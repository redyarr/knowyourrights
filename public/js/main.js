document.addEventListener('DOMContentLoaded', function() {
    // Add any JavaScript functionality here
    
    // Example: Add confirmation for delete actions
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });
    
    // Example: Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
    
    // LinkedIn-style messaging popup
    const messagingPopup = document.getElementById('messagingPopup');
    const messagingPopupHeader = document.getElementById('messagingPopupHeader');
    const messagingPopupToggle = document.getElementById('messagingPopupToggle');
    
    if (messagingPopupHeader && messagingPopup) {
        messagingPopupHeader.addEventListener('click', function() {
            if (messagingPopup.classList.contains('messaging-popup-collapsed')) {
                messagingPopup.classList.remove('messaging-popup-collapsed');
                messagingPopup.classList.add('messaging-popup-expanded');
                messagingPopupToggle.classList.remove('fa-chevron-up');
                messagingPopupToggle.classList.add('fa-chevron-down');
            } else {
                messagingPopup.classList.remove('messaging-popup-expanded');
                messagingPopup.classList.add('messaging-popup-collapsed');
                messagingPopupToggle.classList.remove('fa-chevron-down');
                messagingPopupToggle.classList.add('fa-chevron-up');
            }
        });
    }
    
    // User type tabs in registration and login
    const userTypeTabs = document.querySelectorAll('#userTypeTab button');
    if (userTypeTabs.length > 0) {
        userTypeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                userTypeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});