document.addEventListener('DOMContentLoaded', function() {
  const messagingPopupHeader = document.getElementById('messagingPopupHeader');
  const messagingPopup = document.getElementById('messagingPopup');
  const messagingToggle = document.getElementById('messagingPopupToggle');

  if (messagingPopupHeader && messagingPopup) {
    messagingPopupHeader.addEventListener('click', () => {
      messagingPopup.classList.toggle('messaging-popup-collapsed');
      messagingToggle.classList.toggle('fa-chevron-up');
      messagingToggle.classList.toggle('fa-chevron-down');
    });
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
});