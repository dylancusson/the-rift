let userCollectedIds = new Set();
let currentEndpoint = '/api/cards';

async function fetchAndDisplayCards() {
    try {
        // Fetch data from API
        const response = await fetch('/api/cards');
        const cards = await response.json();

        // Get the container element
        const container = document.getElementById('card-container');

        // Clear any existing content
        container.innerHTML = '';

        // Create card elements
        cards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'cursor-pointer shadow-lg hover:scale-105 transition';
            
            // Only show the image and name in the grid view
            cardDiv.innerHTML = `
                <img src="${card.image_url}" class="w-full object-cover mb-2">
            `;

            // On click event to show modal with details
            cardDiv.onclick = () => showModal(card);
            
            container.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Error fetching cards:', error);
        document.getElementById('card-container').innerHTML = '<p class="text-red-500">Failed to load cards.</p>';
    }
}

// A helper function to fetch and display based on ANY URL
async function loadCards(urlWithParams = '/api/cards') {
    currentEndpoint = urlWithParams.split('?')[0];
    try {
        // Update title
        document.getElementById('card-gallery-title').innerText = 
        currentEndpoint.includes('my-collection') ? "My Collection" : "Card Gallery";

        // Fetch
        const headers = {};
        const token = localStorage.getItem('rift_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(urlWithParams, { headers });
        const cards = await response.json();

        // Update the set of collected card IDs if we're loading the collection
        if (urlWithParams.includes('my-collection')) {
            userCollectedIds = new Set(cards.map(c => c.id));
        }

        // Clear existing cards and display new ones
        const container = document.getElementById('card-container');
        container.innerHTML = ''; 

        cards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'cursor-pointer shadow-lg hover:scale-105 transition';
            cardDiv.innerHTML = `
                <img src="${card.image_url}" class="w-full object-cover mb-2">
            `;
            cardDiv.onclick = () => showModal(card);
            container.appendChild(cardDiv);
        });

        if (cards.length === 0) {
            if (url.includes('my-collection')) {
                container.innerHTML = '<p class="text-gray-400 center">Your collection is empty.</p>';
            } else {
                container.innerHTML = '<p class="text-gray-400 center">No cards found, check your search query.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching cards:', error);
    }
}

// Add to collection button listener
const addBtn = document.getElementById('add-to-collection-btn');

// Card reference
let currentModalCardId = null;
// Function to show modal
function showModal(card) {
    currentModalCardId = card.id;
    // Basic Info
    document.getElementById('modal-img').src = card.image_url;
    document.getElementById('modal-name').innerText = card.name;
    document.getElementById('modal-artist').innerText = card.artist || 'Unknown';
    document.getElementById('modal-set').innerText = card.card_set || 'Base Set';
    
    // Stats (Handle empty values)
    document.getElementById('modal-energy').innerText = card.energy || '-';
    document.getElementById('modal-power').innerText = card.power || '-';
    document.getElementById('modal-might').innerText = card.might || '-';
    
    // Ability
    document.getElementById('modal-ability').innerHTML = card.ability || 'No ability listed.';

    // Tags (Handle comma-separated types)
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = ''; // Clear old tags
    if (card.card_types) {
        const types = card.card_types.split(',').filter(t => t.trim() !== "");
        types.forEach(type => {
            const span = document.createElement('span');
            span.className = 'bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs font-bold';
            span.innerText = type.trim();
            tagsContainer.appendChild(span);
        });
    }
    if (card.tags) {
        const tags = card.tags.split(',').filter(t => t.trim() !== "");
        tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'bg-green-900 text-green-200 px-2 py-1 rounded text-xs font-bold';
            span.innerText = tag.trim();
            tagsContainer.appendChild(span);
        });
    }

    // Show add to collection button if user is logged in
    const addBtn = document.getElementById('add-to-collection-btn');
    const removeBtn = document.getElementById('remove-from-collection-btn');
    
    // Check if the card is in our "Collected" set
    const isCollected = userCollectedIds.has(card.id);

    if (localStorage.getItem('rift_token')) {
        addBtn.classList.remove('hidden');
        
        if (isCollected) {
            addBtn.classList.add('hidden');
            removeBtn.classList.remove('hidden');
        } else {
            addBtn.classList.remove('hidden');
            removeBtn.classList.add('hidden');
        }
    } else {
        addBtn.classList.add('hidden');
        removeBtn.classList.add('hidden');
    }

    // Display the modal
    document.getElementById('card-modal').classList.remove('hidden');
}

// Function to Close Modal
function closeModal() {
    document.getElementById('card-modal').classList.add('hidden');
}

// Unified function to trigger the search
function updateFilters() {
    const searchValue = document.getElementById('search-input').value.trim();
    const filterKey = document.getElementById('filter-search').value; // 'name', 'energy', 'rarity', etc.

    const params = new URLSearchParams();

    // Only add the parameter if there is actually text in the search bar
    if (searchValue) {
        params.append(filterKey, searchValue);
    }

    // Call loadCards using the current endpoint (home or collection) + the new filter
    loadCards(`${currentEndpoint}?${params.toString()}`);
}

//  Attach the listeners
const searchInput = document.getElementById('search-input');
const filterDropdown = document.getElementById('filter-search');

// Search bar: Use debounce to prevent spamming the server while typing
let debounceTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(updateFilters, 300);
});

// Dropdown: Trigger refresh immediately when the category
filterDropdown.addEventListener('change', updateFilters);


// Login system
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "Don't have an account?" : 'Already have an account?';
    document.getElementById('auth-switch-btn').innerText = isLoginMode ? 'Switch to Sign Up' : 'Switch to Login';
}

async function handleAuth() {
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            if (isLoginMode) {
                // Store JWT token in localStorage
                localStorage.setItem('rift_token', data.token);
                updateNavbar();
                showToast('Login successful!');
                document.getElementById('auth-modal').classList.add('hidden');
            } else {
                showToast('Registration successful! Please login.');
                toggleAuthMode();
            }
        } else {
            showToast(data.error || 'Authentication failed.', 'error');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Open and Close Auth Modal
function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function openAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

// Navbar
function updateNavbar() {
    const token = localStorage.getItem('rift_token');
    const authBtn = document.getElementById('nav-auth-btn');
    const collectionBtn = document.getElementById('my-collection-btn');

    if (token) {
        // If logged in, show logout and collection buttons
        authBtn.innerText = 'Logout';
        authBtn.onclick = logout;
        collectionBtn.classList.remove('hidden');
    }
    else {
        // If not logged in, show login button and hide collection
        authBtn.innerText = "Login / Sign Up";
        authBtn.onclick = openAuthModal;
        collectionBtn.classList.add('hidden');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('rift_token');
    updateNavbar();
    showToast('Logged out successfully!');
    loadCards('/api/cards');
}

// Add to collection function
async function addToCollection() {
    if (!currentModalCardId) return;
    const token = localStorage.getItem('rift_token');
    if (!token) {
        showToast('You must be logged in to add to collection.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/my-collection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cardId: currentModalCardId })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Card added to collection!');
        } else {
            showToast(data.error || 'Failed to add card to collection.', 'error');
        }
    } catch (error) {
        console.error('Error adding to collection:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

async function removeFromCollection() {
    const token = localStorage.getItem('rift_token');
    
    const response = await fetch(`/api/my-collection/${currentModalCardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        userCollectedIds.delete(currentModalCardId); 
        showToast('Removed from collection!');
        document.getElementById('card-modal').classList.add('hidden');
        
        // Refresh the collection view if we're currently on it
        if (currentEndpoint === '/api/my-collection') {
            loadCards('/api/my-collection');
        }
    }
}

// Toast function
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Style the toast based on type (success or error)
    const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-xl transition-all duration-300 opacity-0 translate-y-2`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Trigger animation (in)
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    }, 10);

    // Remove after 3 seconds (out)
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize the card display on page load
fetchAndDisplayCards();
// Update Navbar on load
updateNavbar();