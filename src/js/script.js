// File: src/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- AMBIL ELEMENT DARI HTML ---
    const videoGrid = document.getElementById('video-grid');
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // --- FUNGSI PEMBANTU ---
    function formatViews(num) {
        if (num === 0) return ''; // Jangan tampilkan view count untuk hasil pencarian
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M views';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K views';
        return num + ' views';
    }

    function createVideoCard(video) {
        const videoLink = `video.html?id=${video.id}`;
        const card = document.createElement('div');
        card.className = 'flex flex-col space-y-2';
        
        card.innerHTML = `
            <a href="${videoLink}" class="relative">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full rounded-lg object-cover">
            </a>
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <img src="https://i.ytimg.com/i/${video.channelId}/1.jpg" class="w-9 h-9 rounded-full mt-1 object-cover">
                </div>
                <div class="flex-1">
                    <a href="${videoLink}" class="text-white font-semibold leading-tight">${video.title}</a>
                    <p class="text-gray-400 text-sm mt-1">${video.channel}</p>
                    <p class="text-gray-400 text-sm">${formatViews(video.views)}</p>
                </div>
            </div>
        `;
        return card;
    }
    
    // --- FUNGSI UTAMA UNTUK MENGAMBIL DATA ---
    async function fetchAndDisplayVideos(apiUrl) {
        try {
            videoGrid.innerHTML = '<p class="text-gray-400 col-span-full">Loading videos...</p>';
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.details || response.statusText}`);
            }
            const videos = await response.json();
            
            videoGrid.innerHTML = ''; // Kosongkan grid

            if (videos.length === 0) {
                videoGrid.innerHTML = '<p class="text-gray-400 col-span-full">No videos found.</p>';
                return;
            }

            videos.forEach(video => {
                const card = createVideoCard(video);
                videoGrid.appendChild(card);
            });

        } catch (error) {
            videoGrid.innerHTML = `<p class="text-red-500 col-span-full">Error loading videos: ${error.message}</p>`;
            console.error('Failed to fetch videos:', error);
        }
    }

    // --- FUNGSI BARU UNTUK PENCARIAN ---
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            const searchUrl = `/api/videos?search=${encodeURIComponent(query)}`;
            fetchAndDisplayVideos(searchUrl);
        }
    }

    // --- EVENT LISTENERS ---
    // Dengarkan klik pada tombol cari
    searchButton.addEventListener('click', handleSearch);

    // Dengarkan saat menekan 'Enter' di kolom input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Toggle sidebar
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });

    // Muat video populer saat halaman pertama kali dibuka
    fetchAndDisplayVideos('/api/videos');
});
