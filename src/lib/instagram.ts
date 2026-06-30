// ============================================================
//  Instagram Basic Display API — server-side only
//
//  Requires INSTAGRAM_ACCESS_TOKEN in environment vars.
//  Never import this from client code (no PUBLIC_ prefix on the token).
// ============================================================

export interface InstagramMedia {
  id: string;
  media_url: string;
  thumbnail_url?: string; // present for VIDEO type; use in place of media_url
  permalink: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
}

interface InstagramApiResponse {
  data: InstagramMedia[];
  paging?: { cursors: { before: string; after: string }; next?: string };
}

export async function fetchInstagramPosts(count: number): Promise<InstagramMedia[]> {
  const token =
    (import.meta.env.INSTAGRAM_ACCESS_TOKEN as string | undefined) ??
    process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) return [];

  const params = new URLSearchParams({
    fields: 'id,caption,media_url,thumbnail_url,permalink,media_type,timestamp',
    limit: String(count),
    access_token: token,
  });

  try {
    const res = await fetch(`https://graph.instagram.com/me/media?${params}`);
    if (!res.ok) return [];
    const data: InstagramApiResponse = await res.json();
    return (data.data ?? []).slice(0, count);
  } catch {
    return [];
  }
}
