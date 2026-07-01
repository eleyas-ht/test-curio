import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const parsed = await request.json().catch(() => null);
  if (!parsed) return err('Bad request', 400);

  const token = import.meta.env.JUDGEME_API_TOKEN as string | undefined;
  const shop  = import.meta.env.SHOPIFY_SHOP_DOMAIN as string | undefined;
  if (!token || !shop) return err('Reviews not configured', 503);

  const {
    id,
    handle,
    rating,
    title,
    body: reviewBody,
    name,
    email,
  } = parsed as Record<string, unknown>;

  // Allow id = 0 (falsy) — Judge.me can match by handle when id is absent/zero
  if (!rating || !reviewBody || !name || !email) {
    return err('Missing required fields', 400);
  }

  // Judge.me's POST /api/v1/reviews expects FLAT fields — not a nested
  // `review`/`reviewer` object. Nesting makes it treat name/email/rating/body
  // as missing and return 422.
  const payload: Record<string, unknown> = {
    api_token: token,
    shop_domain: shop,
    platform: 'shopify',
    name: String(name).trim(),
    email: String(email).trim(),
    rating: Number(rating),
    title: String(title ?? '').trim(),
    body: String(reviewBody).trim(),
  };

  // Include id when non-zero, always include handle
  if (id) payload.id = Number(id);
  if (handle) payload.handle = String(handle);

  try {
    const res = await fetch('https://judge.me/api/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }

    if (!res.ok) {
      console.error('[reviews/create] Judge.me error', res.status, text.slice(0, 500));
    }

    return json(data, res.ok ? 200 : res.status);
  } catch (e) {
    console.error('[reviews/create] fetch failed', e);
    return err('Could not reach Judge.me', 502);
  }
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function err(message: string, status: number): Response {
  return json({ error: message }, status);
}
