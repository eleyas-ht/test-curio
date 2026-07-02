// POST /api/cart/note — { note: string }
// Updates the order note on the active cart.
import type { APIRoute } from 'astro';
import { buyerIpFrom, setCartNote, json } from '~/lib/cart-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const note = typeof body?.note === 'string' ? body.note.slice(0, 5000) : '';
    const { cart, userErrors } = await setCartNote(cookies, note, buyerIpFrom(request));
    return json({ cart, userErrors });
  } catch (err) {
    return json({ cart: null, error: (err as Error).message }, 500);
  }
};
