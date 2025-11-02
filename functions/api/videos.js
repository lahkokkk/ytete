// File: functions/api/videos.js

// Daftar video default untuk halaman utama
const DEFAULT_VIDEO_IDS = [
  'zh0P40GfvFA',
  'PssKpzB0Ah0',
  'mkUdveY0cFQ',
  'nFXPcdSv0qA',
  'NGSn5cY0o3k'
];

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    // Dapatkan ID video dari parameter URL (misal: /api/videos?id=xxxx)
    const urlParamId = url.searchParams.get('id');
    
    // Jika tidak ada ID di URL, gunakan daftar default. Jika ada, gunakan ID itu.
    const videoIdsToFetch = urlParamId ? urlParamId : DEFAULT_VIDEO_IDS.join(',');

    // Ambil Kunci API dari secret yang sudah Anda set di dasbor Cloudflare
    const apiKey = env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'YouTube API key is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIdsToFetch}&key=${apiKey}`;

    const ytResponse = await fetch(ytApiUrl);
    const data = await ytResponse.json();

    if (!ytResponse.ok || data.error) {
      return new Response(JSON.stringify({ error: 'YouTube API error', details: data }), {
        status: ytResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format data agar mudah digunakan di frontend
    const videos = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelId: item.snippet.channelId,
      channel: item.snippet.channelTitle,
      views: item.statistics.viewCount ? parseInt(item.statistics.viewCount, 10) : 0,
      publishedAt: item.snippet.publishedAt,
    }));

    return new Response(JSON.stringify(videos), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch videos', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}