// File: src/js/video.js

document.addEventListener('DOMContentLoaded', () => {
    const recommendationsContainer = document.getElementById('recommendations');
    
    // Fungsi untuk memformat angka
    function formatViews(num) {
        return num.toLocaleString() + ' views';
    }

    // Fungsi untuk membuat kartu rekomendasi
    function createRecommendationCard(video) {
        const card = document.createElement('a');
        card.href = `video.html?id=${video.id}`;
        card.className = 'flex space-x-3 hover:bg-gray-800 p-1 rounded-lg';
        
        card.innerHTML = `
            <div class="w-2/5">
                <img src="${video.thumbnail}" alt="${video.title}" class="rounded-lg w-full h-full object-cover">
            </div>
            <div class="w-3/5">
                <h3 class="text-sm font-semibold leading-tight">${video.title}</h3>
                <p class="text-xs text-gray-400 mt-1">${video.channel}</p>
                <p class="text-xs text-gray-400">${formatViews(video.views)}</p>
            </div>
        `;
        return card;
    }

    // Fungsi untuk mengisi detail video utama
    function populateVideoDetails(video) {
        document.getElementById('video-player').innerHTML = `
            <iframe class="w-full h-full" src="https://www.youtube.com/embed/${video.id}?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>`;
        
        document.getElementById('video-title').textContent = video.title;
        document.getElementById('channel-name').textContent = video.channel;
        document.getElementById('channel-avatar').src = `https://picsum.photos/seed/${video.channelId}/48/48`;
        // Anda bisa menambahkan info subscriber jika API-nya dimodifikasi
    }
    
    // Ambil data untuk video utama DAN video rekomendasi
    async function loadVideoPage() {
        // 1. Dapatkan video ID dari URL
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('id');

        if (!videoId) {
            document.getElementById('video-info').innerHTML = '<p class="text-red-500">Video ID not found in URL.</p>';
            return;
        }

        try {
            // 2. Fetch data untuk video utama
            const mainVideoResponse = await fetch(`/api/videos?id=${videoId}`);
            const mainVideoData = await mainVideoResponse.json();
            
            if (mainVideoData.length > 0) {
                populateVideoDetails(mainVideoData[0]);
            } else {
                 throw new Error('Video not found.');
            }

            // 3. Fetch data untuk semua video rekomendasi
            const recsResponse = await fetch('/api/videos');
            const allVideos = await recsResponse.json();

            recommendationsContainer.innerHTML = '';
            allVideos
                .filter(v => v.id !== videoId) // Jangan tampilkan video yang sedang diputar
                .forEach(video => {
                    const card = createRecommendationCard(video);
                    recommendationsContainer.appendChild(card);
                });

        } catch (error) {
            console.error('Failed to load video page:', error);
            document.getElementById('video-info').innerHTML = `<p class="text-red-500">Error loading video data: ${error.message}</p>`;
        }
    }

    loadVideoPage();
});