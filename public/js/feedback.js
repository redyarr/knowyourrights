// Feedback System JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get lawyer ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const lawyerId = urlParams.get('id');
    
    if (!lawyerId) {
        showAlert('Lawyer ID is required', 'danger');
        setTimeout(() => {
            window.location.href = '/feed';
        }, 2000);
        return;
    }
    
    // Set lawyer ID in form
    document.getElementById('lawyer-id').value = lawyerId;
    
    // Fetch lawyer details and feedback
    fetchLawyerDetails(lawyerId);
    fetchLawyerFeedback(lawyerId);
    
    // Handle form submission
    document.getElementById('feedback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
    });
});

/**
 * Fetch lawyer details from the server
 * @param {number} lawyerId - The ID of the lawyer
 */
function fetchLawyerDetails(lawyerId) {
    fetch(`/profile/lawyer/${lawyerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.lawyer) {
                document.getElementById('lawyer-name').textContent = `${data.lawyer.User.firstName} ${data.lawyer.User.lastName}`;
                document.getElementById('lawyer-firm').textContent = data.lawyer.lawFirm;
            }
        })
        .catch(error => {
            console.error('Error fetching lawyer details:', error);
            showAlert('Error loading lawyer details. Please try again later.', 'danger');
        });
}

/**
 * Fetch lawyer feedback from the server
 * @param {number} lawyerId - The ID of the lawyer
 */
function fetchLawyerFeedback(lawyerId) {
    fetch(`/feedback/lawyer/${lawyerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('loading-feedback').style.display = 'none';
            
            // Update average rating and total reviews
            document.getElementById('average-rating').textContent = data.averageRating;
            document.getElementById('total-reviews').textContent = `(${data.totalReviews} reviews)`;
            
            // Update rating stars
            const starsHtml = generateStars(data.averageRating);
            document.getElementById('rating-stars').innerHTML = starsHtml;
            
            // Display feedback items
            const feedbackList = document.getElementById('feedback-list');
            
            if (data.feedback.length === 0) {
                feedbackList.innerHTML = '<p class="text-center">No reviews yet. Be the first to leave a review!</p>';
                return;
            }
            
            let feedbackHtml = '';
            data.feedback.forEach(item => {
                const date = new Date(item.created_at).toLocaleDateString();
                feedbackHtml += `
                    <div class="feedback-item">
                        <div class="d-flex justify-content-between">
                            <h5 class="feedback-author">${item.User.firstName} ${item.User.lastName}</h5>
                            <small class="feedback-date">${date}</small>
                        </div>
                        <div class="feedback-stars mb-2">${generateStars(item.rating)}</div>
                        <p class="feedback-content">${item.review || 'No written review provided.'}</p>
                    </div>
                `;
            });
            
            feedbackList.innerHTML = feedbackHtml;
        })
        .catch(error => {
            console.error('Error fetching lawyer feedback:', error);
            document.getElementById('loading-feedback').style.display = 'none';
            document.getElementById('feedback-list').innerHTML = '<p class="text-center text-danger">Error loading reviews. Please try again later.</p>';
        });
}

/**
 * Generate HTML for star rating display
 * @param {number} rating - The rating value (0-5)
 * @returns {string} HTML string for star display
 */
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="feedback-stars">★</span>';
    }
    
    // Half star
    if (halfStar) {
        starsHtml += '<span class="feedback-stars">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<span style="color: #ddd;">★</span>';
    }
    
    return starsHtml;
}

/**
 * Submit feedback to the server
 */
function submitFeedback() {
    const lawyerId = document.getElementById('lawyer-id').value;
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const review = document.getElementById('review').value;
    
    if (!ratingInput) {
        showAlert('Please select a rating', 'warning');
        return;
    }
    
    const rating = parseInt(ratingInput.value);
    
    const data = {
        lawyerId,
        rating,
        review
    };
    
    fetch('/feedback/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        showAlert(data.message, 'success');
        // Refresh feedback list
        fetchLawyerFeedback(lawyerId);
        // Reset form
        document.getElementById('feedback-form').reset();
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
        showAlert('Error submitting feedback. Please try again.', 'danger');
    });
}

/**
 * Display an alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}