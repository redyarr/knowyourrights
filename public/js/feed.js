// Feed page functionality for reactions and comments

document.addEventListener('DOMContentLoaded', function() {
    // Toggle comments visibility
    window.toggleComments = function(postId) {
        const commentsList = document.getElementById(`commentsList-${postId}`);
        const showCommentsBtn = document.getElementById(`showCommentsBtn-${postId}`);
        
        if (commentsList) {
            const isHidden = commentsList.classList.contains('hidden');
            commentsList.classList.toggle('hidden');
            
            // Update button text
            if (showCommentsBtn) {
                const commentCount = showCommentsBtn.textContent.match(/\d+/)[0];
                showCommentsBtn.textContent = isHidden ? 
                    `Hide Comments (${commentCount})` : 
                    `Show Comments (${commentCount})`;
            }
        }
    };
    
    // Show more comments
    window.showMoreComments = function(postId) {
        const additionalComments = document.getElementById(`additionalComments-${postId}`);
        const showMoreBtn = document.getElementById(`showMoreComments-${postId}`);
        
        if (additionalComments) {
            additionalComments.classList.remove('hidden');
            // Hide the 'Show More' button once all comments are visible
            if (showMoreBtn) {
                showMoreBtn.classList.add('hidden');
            }
        }
    };

    // Toggle reaction popup
    window.toggleReactionPopup = function(postId) {
        const popup = document.getElementById(`reactionPopup-${postId}`);
        if (popup) {
            popup.classList.toggle('hidden');
        }
    };

    // Submit reaction
    window.submitReaction = function(postId, reaction) {
        // Hide the popup after selection
        const popup = document.getElementById(`reactionPopup-${postId}`);
        if (popup) {
            popup.classList.add('hidden');
        }

        // Send AJAX request to submit reaction
        fetch(`/feed/post/${postId}/react`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reaction: reaction }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI to show the reaction was successful
                const reactionButton = document.querySelector(`button[onclick="toggleReactionPopup(${postId})"]`);
                if (reactionButton) {
                    // Update the reaction button to show the selected reaction
                    const reactionEmoji = getReactionEmoji(reaction);
                    reactionButton.innerHTML = `<span class="text-xl">${reactionEmoji}</span>`;
                    reactionButton.classList.add('text-blue-500');
                }
                
                // Reload the page to show updated reactions
                // For a better UX, you could update the UI without reloading
                location.reload();
            } else {
                console.error('Error submitting reaction:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    // Helper function to get emoji for reaction type
    function getReactionEmoji(reaction) {
        const reactionTypes = {
            'like': '👍',
            'love': '❤️',
            'haha': '😂',
            'wow': '😮',
            'sad': '😢',
            'angry': '😠'
        };
        return reactionTypes[reaction] || '👍';
    }

    // Toggle comment form visibility
    window.toggleCommentForm = function(postId) {
        const commentForm = document.getElementById(`commentForm-${postId}`);
        if (commentForm) {
            commentForm.classList.toggle('hidden');
            // Focus the input field when showing the form
            if (!commentForm.classList.contains('hidden')) {
                const input = commentForm.querySelector('input[name="content"]');
                if (input) input.focus();
            }
        }
    };
    
    // Submit comment function for direct form calls
    window.submitComment = function(form, postId) {
        const contentInput = form.querySelector('input[name="content"]');
        const content = contentInput.value.trim();
        
        if (!content) return;
        
        // Send AJAX request to submit comment
        fetch(`/feed/post/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: content }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clear the input field
                contentInput.value = '';
                
                // Make sure comments section is visible
                const commentsList = document.getElementById(`commentsList-${postId}`);
                const showCommentsBtn = document.getElementById(`showCommentsBtn-${postId}`);
                
                if (commentsList && commentsList.classList.contains('hidden')) {
                    // Show comments section if it was hidden
                    toggleComments(postId);
                }
                
                // Add the new comment to the UI without page reload
                if (commentsList) {
                    // Create and add the new comment element
                    const newComment = createCommentElement(data.comment);
                    
                    // Add to the beginning of the list for better visibility
                    if (commentsList.firstChild) {
                        commentsList.insertBefore(newComment, commentsList.firstChild);
                    } else {
                        commentsList.appendChild(newComment);
                    }
                    
                    // Update the comment count in the stats section
                    const countElement = document.querySelector(`#post-${postId} .comment-count`);
                    if (countElement) {
                        const currentCount = parseInt(countElement.textContent.split(' ')[0] || '0');
                        countElement.textContent = `${currentCount + 1} comments`;
                    }
                    
                    // Update the Show Comments button text
                    if (showCommentsBtn) {
                        const currentCount = parseInt(showCommentsBtn.textContent.match(/\d+/)[0] || '0');
                        showCommentsBtn.textContent = `Hide Comments (${currentCount + 1})`;
                    }
                }
                
                // Hide the comment form after submission
                toggleCommentForm(postId);
            } else {
                console.error('Error submitting comment:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
    
    // We don't need additional event listeners since we're using onsubmit in the HTML
    // This was causing duplicate comments by triggering the submission twice

    // Helper function to create a comment element
    function createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'flex items-start space-x-3';
        
        const userInitials = `${comment.user.firstName.charAt(0)}${comment.user.lastName.charAt(0)}`;
        const userName = `${comment.user.firstName} ${comment.user.lastName}`;
        
        commentDiv.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}" 
                alt="Commenter" class="rounded-full"
                style="width: 32px; height: 32px; object-fit: cover;">
            <div>
                <div class="bg-gray-100 rounded-lg px-3 py-2">
                    <p class="text-sm text-gray-800">${comment.content}</p>
                </div>
                <div class="mt-1 text-xs text-gray-500">
                    <span>${new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        
        return commentDiv;
    }
});