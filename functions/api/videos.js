/**
 * Cloudflare Pages Function
 * File: /functions/api/videos.js
 *
 * Versi DINAMIS:
 * Endpoint ini sekarang mengambil video paling populer dari YouTube.
 */

// --- KONFIGURASI DINAMIS ---
const REGION_CODE = 'ID'; // Ganti ke 'US' untuk Amerika, 'SG' untuk Singapura, dll.
const MAX_RESULTS = 12;   // Jumlah video yang ingin ditampilkan (maksimal 50)


// --- LOGIKA UTAMA WORKER ---
export async function onRequest(context) {
  // Header CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { request, env } = context;

    // Menangani permintaan preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env.YOUTUBE_API_KEY;

    if (!apiKey) {
      const errorResponse = { error: 'YouTube API key is not configured on the server.' };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- PERUBAHAN UTAMA ADA DI SINI ---
    // Kita tidak lagi menggunakan daftar ID video statis.
    // Kita sekarang memanggil endpoint 'videos' dengan parameter 'chart=mostPopular'.
    const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${REGION_CODE}&maxResults=${MAX_RESULTS}&key=${apiKey}`;
    
    // Panggil API YouTube
    const ytResponse = await fetch(ytApiUrl);
    const data = await ytResponse.json();

    if (!ytResponse.ok || data.error) {
      const errorDetails = data.error ? data.error.message : `Status code: ${ytResponse.status}`;
      const errorResponse = { error: 'Failed to fetch data from YouTube API.', details: errorDetails };
      return new Response(JSON.stringify(errorResponse), {
        status: ytResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Proses pemformatan data tetap sama seperti sebelumnya, karena struktur data dari YouTube mirip.
    const formattedVideos = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelId: item.snippet.channelId,
      channel: item.snippet.channelTitle,
      views: item.statistics.viewCount ? parseInt(item.statistics.viewCount, 10) : 0,
      publishedAt: item.snippet.publishedAt,
    }));

    return new Response(JSON.stringify(formattedVideos), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorResponse = { error: 'An unexpected error occurred.', details: err.message };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}