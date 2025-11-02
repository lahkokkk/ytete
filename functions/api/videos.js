/**
 * Cloudflare Pages Function
 * File: /functions/api/videos.js
 *
 * Versi SUPER PINTAR:
 * - Menangani ?id=... untuk video spesifik.
 * - Menangani ?search=... untuk pencarian video.
 * - Default ke video populer jika tidak ada parameter.
 */

// --- KONFIGURASI ---
const REGION_CODE = 'ID';
const MAX_RESULTS = 12;

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
    if (!apiKey) throw new Error('YouTube API key is not configured.');
    
    const videoId = url.searchParams.get('id');
    const searchQuery = url.searchParams.get('search');
    let ytApiUrl;
    let isSearch = false;

    if (videoId) {
      // KASUS 1: Ambil detail video spesifik
      ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    } else if (searchQuery) {
      // KASUS 2: Lakukan pencarian video
      isSearch = true;
      ytApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${MAX_RESULTS}&key=${apiKey}`;
    } else {
      // KASUS 3: Ambil video populer (default)
      ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${REGION_CODE}&maxResults=${MAX_RESULTS}&key=${apiKey}`;
    }

    const ytResponse = await fetch(ytApiUrl);
    const data = await ytResponse.json();

    if (!ytResponse.ok || data.error) {
      const errorDetails = data.error ? data.error.message : `Status code: ${ytResponse.status}`;
      throw new Error(`YouTube API Error: ${errorDetails}`);
    }

    // --- PEMFORMATAN DATA ---
    // Format data berbeda untuk hasil pencarian dan hasil video biasa
    const formattedVideos = data.items.map(item => {
      if (isSearch) {
        // Format untuk data dari endpoint PENCARIAN
        return {
          id: item.id.videoId, // ID ada di dalam item.id
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channelId: item.snippet.channelId,
          channel: item.snippet.channelTitle,
          views: 0, // Endpoint pencarian TIDAK memberikan view count
          publishedAt: item.snippet.publishedAt,
        };
      } else {
        // Format untuk data dari endpoint VIDEO (populer atau spesifik)
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channelId: item.snippet.channelId,
          channel: item.snippet.channelTitle,
          views: item.statistics.viewCount ? parseInt(item.statistics.viewCount, 10) : 0,
          publishedAt: item.snippet.publishedAt,
        };
      }
    });

    return new Response(JSON.stringify(formattedVideos), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
