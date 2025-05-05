// Feed page functionality for reactions and comments

document.addEventListener('DOMContentLoaded', function() {
    // Toggle comments visibility
    window.toggleComments = function(postId) {
        const commentsList = document.getElementById(`commentsList-${postId}`);
        const showCommentsBtn = document.getElementById(`showCommentsBtn-${postId}`);
        if (commentsList) {
            const isHidden = commentsList.classList.contains('hidden');
            commentsList.classList.toggle('hidden');
            if (showCommentsBtn) {
                const commentCount = showCommentsBtn.textContent.match(/\d+/)[0];
                showCommentsBtn.textContent = isHidden ? 
                    `Hide Comments (${commentCount})` : 
                    `Show Comments (${commentCount})`;
            }
        }
    };
    window.showMoreComments = function(postId) {
        const additionalComments = document.getElementById(`additionalComments-${postId}`);
        const showMoreBtn = document.getElementById(`showMoreComments-${postId}`);
        if (additionalComments) {
            additionalComments.classList.remove('hidden');
            if (showMoreBtn) {
                showMoreBtn.classList.add('hidden');
            }
        }
    };
    window.toggleReactionPopup = function(postId) {
        const popup = document.getElementById(`reactionPopup-${postId}`);
        if (popup) {
            popup.classList.toggle('hidden');
        }
    };
    window.submitReaction = function(postId, reaction) {
        const popup = document.getElementById(`reactionPopup-${postId}`);
        if (popup) {
            popup.classList.add('hidden');
        }
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
                const reactionButton = document.querySelector(`button[onclick="toggleReactionPopup(${postId})"]`);
                if (reactionButton) {
                    const reactionEmoji = getReactionEmoji(reaction);
                    reactionButton.innerHTML = `<span class="text-xl">${reactionEmoji}</span>`;
                    reactionButton.classList.add('text-blue-500');
                }
                location.reload();
            } else {
                console.error('Error submitting reaction:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
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
    window.toggleCommentForm = function(postId) {
        const commentForm = document.getElementById(`commentForm-${postId}`);
        if (commentForm) {
            commentForm.classList.toggle('hidden');
            if (!commentForm.classList.contains('hidden')) {
                const input = commentForm.querySelector('input[name="content"]');
                if (input) input.focus();
            }
        }
    };
    window.submitComment = function(form, postId) {
        const contentInput = form.querySelector('input[name="content"]');
        const content = contentInput.value.trim();
        if (!content) return;
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
                contentInput.value = '';
                let commentsList = document.getElementById(`commentsList-${postId}`);
                let showCommentsBtn = document.getElementById(`showCommentsBtn-${postId}`);
                if (!commentsList) {
                    const postContainer = document.getElementById(`post-${postId}`);
                    if (postContainer) {
                        commentsList = document.createElement('div');
                        commentsList.id = `commentsList-${postId}`;
                        commentsList.className = 'space-y-3';
                        postContainer.querySelector('.px-4.py-2.border-t.border-gray-200.mt-3').prepend(commentsList);
                    }
                }
                if (!showCommentsBtn) {
                    const postContainer = document.getElementById(`post-${postId}`);
                    if (postContainer) {
                        showCommentsBtn = document.createElement('button');
                        showCommentsBtn.id = `showCommentsBtn-${postId}`;
                        showCommentsBtn.className = 'text-sm text-blue-600 hover:text-blue-800 mb-3';
                        showCommentsBtn.onclick = function() { toggleComments(postId); };
                        showCommentsBtn.textContent = 'Hide Comments (1)';
                        commentsList.before(showCommentsBtn);
                    }
                }
                if (commentsList && commentsList.classList.contains('hidden')) {
                    toggleComments(postId);
                }
                if (commentsList) {
                    const newComment = createCommentElement(data.comment);
                    if (commentsList.firstChild) {
                        commentsList.insertBefore(newComment, commentsList.firstChild);
                    } else {
                        commentsList.appendChild(newComment);
                    }
                    const countElement = document.querySelector(`#post-${postId} .comment-count`);
                    if (countElement) {
                        const currentCount = parseInt(countElement.textContent.split(' ')[0] || '0');
                        countElement.textContent = `${currentCount + 1} comments`;
                    }
                    if (showCommentsBtn && commentsList) {
                        const commentCount = commentsList.childElementCount;
                        showCommentsBtn.textContent = `Hide Comments (${commentCount})`;
                    }
                }
                toggleCommentForm(postId);
            } else {
                console.error('Error submitting comment:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
    function createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'flex items-start space-x-3';
        const userName = `${comment.user.firstName} ${comment.user.lastName}`;
        commentDiv.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}" 
                alt="Commenter" class="rounded-full shadow" style="width: 32px; height: 32px; object-fit: cover;">
            <div>
                <div class="bg-blue-50 rounded-lg px-3 py-2">
                    <p class="text-sm text-gray-800">${comment.content}</p>
                </div>
                <div class="mt-1 text-xs text-gray-500">
                    <span>${new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        return commentDiv;
    }
    window.showEditPostModal = function(postId, title, content) {
        document.getElementById('editPostId').value = postId;
        document.getElementById('editTitle').value = title;
        document.getElementById('editContent').value = content;
        document.getElementById('editPostModal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };
    window.toggleEditPostModal = function() {
        document.getElementById('editPostModal').classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    };
    document.getElementById('editPostForm').onsubmit = function(e) {
        e.preventDefault();
        const postId = document.getElementById('editPostId').value;
        const title = document.getElementById('editTitle').value;
        const content = document.getElementById('editContent').value;
        fetch(`/feed/post/${postId}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const postDiv = document.getElementById(`post-${postId}`);
                if (postDiv) {
                    postDiv.querySelector('h5').textContent = title;
                    postDiv.querySelector('p.text-gray-700').textContent = content.length > 150 ? content.substring(0, 150) + '...' : content;
                }
                toggleEditPostModal();
            } else {
                alert(data.error || 'Failed to edit post.');
            }
        });
    };
    document.getElementById('editCommentForm').onsubmit = function(e) {
        e.preventDefault();
        const commentId = document.getElementById('editCommentId').value;
        const content = document.getElementById('editCommentContent').value;
        fetch(`/feed/comment/${commentId}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelectorAll(`[data-comment-id="${commentId}"]`).forEach(btn => {
                    const commentText = btn.closest('.bg-blue-50').querySelector('p.text-sm');
                    if (commentText) commentText.textContent = content;
                });
                toggleEditCommentModal();
            } else {
                alert(data.error || 'Failed to edit comment.');
            }
        });
    };
    window.showEditPostModalFromButton = function(btn) {
        const postId = btn.getAttribute('data-post-id');
        const title = btn.getAttribute('data-title');
        const content = btn.getAttribute('data-content');
        // Removed global showEditPostModalFromButton function as listener is now attached dynamically
    };
    // Attach event listeners for edit post buttons
    document.querySelectorAll('.edit-post-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            const title = this.getAttribute('data-title');
            const content = this.getAttribute('data-content');
            showEditPostModal(postId, title, content);
        });
    });

    window.showEditCommentModalFromButton = function(btn) {
        const commentId = btn.getAttribute('data-comment-id');
        const content = btn.getAttribute('data-content');
        document.getElementById('editCommentId').value = commentId;
        document.getElementById('editCommentContent').value = content;
        document.getElementById('editCommentModal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };
    // Custom delete confirmation modal logic
    let pendingDelete = { type: null, id: null, postId: null };
    window.showDeleteModal = function(type, id, postId) {
        pendingDelete = { type, id, postId };
        const modal = document.getElementById('deleteConfirmModal');
        modal.classList.remove('hidden'); // Revert to Tailwind hidden class
        // document.body.classList.add('overflow-hidden'); // Removed to test conflict
    };
    window.hideDeleteModal = function() {
        pendingDelete = { type: null, id: null, postId: null };
        const modal = document.getElementById('deleteConfirmModal');
        modal.classList.add('hidden'); // Revert to Tailwind hidden class
        // document.body.classList.remove('overflow-hidden'); // Removed to test conflict
    };

    // Attach event listeners for delete buttons
    document.querySelectorAll('.delete-post-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            showDeleteModal('post', postId);
        });
    });

    document.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.getAttribute('data-comment-id');
            const postId = this.getAttribute('data-post-id');
            showDeleteModal('comment', commentId, postId);
        });
    });
    window.confirmDelete = function() {
        if (pendingDelete.type === 'comment') {
            fetch(`/feed/comment/${pendingDelete.id}/delete`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.querySelectorAll(`[data-comment-id="${pendingDelete.id}"]`).forEach(btn => {
                        const commentDiv = btn.closest('.flex.items-start');
                        if (commentDiv) commentDiv.remove();
                    });
                    const commentsList = document.getElementById(`commentsList-${pendingDelete.postId}`);
                    const showCommentsBtn = document.getElementById(`showCommentsBtn-${pendingDelete.postId}`);
                    if (commentsList && showCommentsBtn) {
                        const commentCount = commentsList.childElementCount;
                        showCommentsBtn.textContent = `Hide Comments (${commentCount})`;
                        const countElement = document.querySelector(`#post-${pendingDelete.postId} .comment-count`);
                        if (countElement) countElement.textContent = `${commentCount} comments`;
                    }
                } else {
                    alert(data.error || 'Failed to delete comment.');
                }
                hideDeleteModal();
            });
        } else if (pendingDelete.type === 'post') {
            fetch(`/feed/post/${pendingDelete.id}/delete`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const postDiv = document.getElementById(`post-${pendingDelete.id}`);
                    if (postDiv) postDiv.remove();
                } else {
                    alert(data.error || 'Failed to delete post.');
                }
                hideDeleteModal();
            });
        }
    };
    // Removed global deleteComment and deletePost functions as listeners are now attached dynamically
    window.toggleEditCommentModal = function() {
        document.getElementById('editCommentModal').classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    };
});