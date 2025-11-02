// File: src/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid');
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    // Fungsi untuk memformat angka (misal: 1000 -> 1K)
    function formatViews(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num;
    }

    // Fungsi untuk membuat setiap kartu video
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
                    <img src="https://picsum.photos/seed/${video.channelId}/36/36" class="w-9 h-9 rounded-full mt-1">
                </div>
                <div class="flex-1">
                    <a href="${videoLink}" class="text-white font-semibold leading-tight">${video.title}</a>
                    <p class="text-gray-400 text-sm mt-1">${video.channel}</p>
                    <p class="text-gray-400 text-sm">${formatViews(video.views)} views</p>
                </div>
            </div>
        `;
        return card;
    }

    // Ambil data video dari backend function kita
    async function loadVideos() {
        try {
            // Ini memanggil file /functions/api/videos.js
            const response = await fetch('/api/videos');
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const videos = await response.json();
            
            videoGrid.innerHTML = ''; // Kosongkan grid sebelum diisi
            videos.forEach(video => {
                const card = createVideoCard(video);
                videoGrid.appendChild(card);
            });

        } catch (error) {
            videoGrid.innerHTML = `<p class="text-red-500 col-span-full">Error loading videos: ${error.message}</p>`;
            console.error('Failed to fetch videos:', error);
        }
    }
    
    // Toggle sidebar untuk mobile
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });

    // Muat video saat halaman dibuka
    loadVideos();
});