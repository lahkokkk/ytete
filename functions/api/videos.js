/**
 * Cloudflare Pages Function
 * File: /functions/api/videos.js
 *
 * Versi HYBRID:
 * - Jika ada parameter ?id=... ia akan mengambil detail video spesifik.
 * - Jika tidak ada parameter, ia akan mengambil video paling populer.
 */

// --- KONFIGURASI DINAMIS ---
const REGION_CODE = 'ID'; // Ganti ke 'US' untuk Amerika, 'SG' untuk Singapura, dll.
const MAX_RESULTS = 12;   // Jumlah video yang ingin ditampilkan (maksimal 50)


// --- LOGIKA UTAMA WORKER ---
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('YouTube API key is not configured on the server.');
    }
    
    // --- INILAH LOGIKA BARU YANG LEBIH PINTAR ---
    const videoId = url.searchParams.get('id');
    let ytApiUrl;

    if (videoId) {
      // KASUS 1: Jika ada ID di URL, bangun URL untuk mengambil video spesifik.
      ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    } else {
      // KASUS 2: Jika tidak ada ID, bangun URL untuk mengambil video populer (untuk halaman utama).
      ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${REGION_CODE}&maxResults=${MAX_RESULTS}&key=${apiKey}`;
    }
    // -------------------------------------------

    const ytResponse = await fetch(ytApiUrl);
    const data = await ytResponse.json();

    if (!ytResponse.ok || data.error) {
      const errorDetails = data.error ? data.error.message : `Status code: ${ytResponse.status}`;
      throw new Error(`Failed to fetch from YouTube API: ${errorDetails}`);
    }

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
    const errorResponse = { error: err.message };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}