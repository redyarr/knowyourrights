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
            performSearch();
        }, 300);
    });

    // Hide results when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });

    // Debounced search function
    function performSearch() {
        const query = searchInput.value.trim();
        const searchType = document.getElementById('searchType')?.value || 'all';
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        // Make API call to search users
        fetch(`/search/api/users?query=${encodeURIComponent(query)}&searchType=${encodeURIComponent(searchType)}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data.users || []);
            })
            .catch(error => {
                console.error('Search error:', error);
                searchResults.innerHTML = '<div class="p-3 text-sm text-red-500">Error occurred while searching</div>';
                searchResults.classList.remove('hidden');
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

            // Authority level styling for lawyers
            let authorityColor = 'blue';
            let authorityBadge = 'LAWYER';
            let authorityIcon = '⚖️';
            
            if (isLawyer && user.lawyer.badgeIssuingAuthority) {
                switch(user.lawyer.badgeIssuingAuthority) {
                    case 'Training':
                        authorityColor = 'yellow';
                        authorityBadge = 'TRAINING';
                        authorityIcon = '📚';
                        break;
                    case 'Approved':
                        authorityColor = 'green';
                        authorityBadge = 'APPROVED';
                        authorityIcon = '✅';
                        break;
                    case 'Consultant':
                        authorityColor = 'purple';
                        authorityBadge = 'CONSULTANT';
                        authorityIcon = '👨‍💼';
                        break;
                }
            }

            html += `
                <a href="/in/${user.id}" class="block hover:bg-gray-50">
                    <div class="flex items-center p-3">
                        <div class="relative mr-3">
                            <img src="${profileImage}" 
                                alt="${user.firstName} ${user.lastName}" 
                                class="rounded-full w-10 h-10 object-cover ${isLawyer ? `ring-2 ring-${authorityColor}-500` : ''}">
                            ${isLawyer ? `<div class="absolute -bottom-0.5 -right-0.5 bg-${authorityColor}-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs border border-white">${authorityIcon}</div>` : ''}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center">
                                <span class="font-medium text-gray-900">${user.firstName} ${user.lastName}</span>
                                ${isLawyer ? `<span class="ml-2 bg-${authorityColor}-100 text-${authorityColor}-800 px-2 py-0.5 rounded-full text-xs font-medium">${authorityBadge}</span>` : ''}
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