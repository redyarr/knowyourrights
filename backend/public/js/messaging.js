document.addEventListener('DOMContentLoaded', function () {
  const messagingPopupHeader = document.getElementById('messagingPopupHeader');
  const messagingPopup = document.getElementById('messagingPopup');
  const messagingToggle = document.getElementById('messagingPopupToggle');

  if (messagingPopupHeader && messagingPopup) {
    messagingPopupHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      messagingPopup.classList.toggle('messaging-popup-collapsed');
      messagingToggle.classList.toggle('fa-chevron-up');
      messagingToggle.classList.toggle('fa-chevron-down');
    });

    document.addEventListener('click', (e) => {
      if (!messagingPopup.contains(e.target) && !messagingPopupHeader.contains(e.target)) {
        messagingPopup.classList.add('messaging-popup-collapsed');
        messagingToggle.classList.remove('fa-chevron-down');
        messagingToggle.classList.add('fa-chevron-up');
      }
    });

    // Ensure popup is visible on initial load
    messagingPopup.classList.remove('messaging-popup-collapsed');
    messagingToggle.classList.remove('fa-chevron-up');
    messagingToggle.classList.add('fa-chevron-down');
  }

  // Handle message search
  const messageSearch = document.getElementById('messageSearch');
  if (messageSearch) {
    messageSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const messageItems = document.querySelectorAll('.message-item');

      messageItems.forEach(item => {
        const name = item.querySelector('.message-name').textContent.toLowerCase();
        const preview = item.querySelector('.message-preview').textContent.toLowerCase();

        if (name.includes(searchTerm) || preview.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Scroll to bottom of message container on page load
  const messageContainer = document.getElementById('messageContainer');
  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // Handle conversation search in conversation view
  const conversationSearch = document.getElementById('conversationSearch');
  if (conversationSearch) {
    conversationSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const conversationItems = document.querySelectorAll('.conversation-item');

      conversationItems.forEach(item => {
        const name = item.querySelector('.conversation-name')?.textContent.toLowerCase() || '';
        const preview = item.querySelector('.conversation-preview')?.textContent.toLowerCase() || '';

        if (name.includes(searchTerm) || preview.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Fetch and display conversations
  async function loadConversations() {
    try {
      const response = await fetch('/messaging'); // Ensure this endpoint returns the correct JSON structure
      if (response.ok) {
        const data = await response.json(); // Assuming the server sends { messages: [...] }
        const messages = data.messages; // Access the messages array
        const messagingBody = document.querySelector('.messaging-popup-body');
        messagingBody.innerHTML = ''; // Clear existing messages

        if (messages && messages.length > 0) {
          messagingBody.innerHTML = messages.map(msg => `
            <div class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer message-item" data-user-id="${msg.user.id}" data-conversation-id="${msg.user.id}">
              <img src="${msg.user.profileImage || '/images/default-profile.png'}" alt="Contact" class="w-10 h-10 rounded-full">
              <div>
                <div class="font-medium message-name">${msg.user.firstName} ${msg.user.lastName}</div>
                <div class="text-sm text-gray-500 message-preview">${msg.lastMessage?.content || 'No messages yet'}</div>
              </div>
            </div>
          `).join('');

          // Add event listeners to new message items
          document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', function () {
              const userId = this.dataset.userId;
              // TODO: Implement logic to open conversation with userId
              console.log('Open conversation with user ID:', userId);
              // Example: window.location.href = `/messaging/conversation/${userId}`;
            });
          });
        } else {
          messagingBody.innerHTML = '<p class="text-center text-gray-500">No conversations yet.</p>';
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      const messagingBody = document.querySelector('.messaging-popup-body');
      messagingBody.innerHTML = '<p class="text-center text-red-500">Error loading conversations.</p>';
    }
  }

  // Initial load of conversations
  loadConversations();
});