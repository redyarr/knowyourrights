document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchForm = document.getElementById('searchForm');

    if (!searchInput || !searchResults || !searchForm) return;

    let debounceTimer;

    // Prevent form submission and page reload when pressing Enter
    searchForm.addEventListener('submit', function (e) {
        // Only prevent default if the dropdown is open and has results
        if (!searchResults.classList.contains('hidden') && searchResults.children.length > 0) {
            e.preventDefault();
        }
    });

    // Handle input with debounce
    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSearchResults(query);
        }, 300);
    });

    // Hide results when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });

    // Fetch search results
    function fetchSearchResults(query) {
        fetch(`/search/api/users?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data.users);
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
            });
    }

    // Display search results
    function displaySearchResults(users) {
        if (!users || users.length === 0) {
            searchResults.innerHTML = '<div class="p-3 text-sm text-gray-500">No users found</div>';
            searchResults.classList.remove('hidden');
            return;
        }

        let html = '';
        users.forEach(user => {
            const isLawyer = user.role === 'lawyer' && user.lawyer;
            const profileImage = user.profileImage && user.profileImage.imagePath
                ? user.profileImage.imagePath
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`;

            html += `
                <a href="/in/${user.id}" class="block hover:bg-gray-50">
                    <div class="flex items-center p-3">
                        <div class="relative mr-3">
                            <img src="${profileImage}" 
                                alt="${user.firstName} ${user.lastName}" 
                                class="rounded-full w-10 h-10 object-cover ${isLawyer ? 'ring-2 ring-blue-500' : ''}">
                            ${isLawyer ? '<div class="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs border border-white">⚖️</div>' : ''}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center">
                                <span class="font-medium text-gray-900">${user.firstName} ${user.lastName}</span>
                                ${isLawyer ? '<span class="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">LAWYER</span>' : ''}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${isLawyer ? `Lawyer at ${user.lawyer.lawFirm}` : 'User'}
                            </div>
                        </div>
                    </div>
                </a>
            `;
        });

        searchResults.innerHTML = html;
        searchResults.classList.remove('hidden');
    }
});