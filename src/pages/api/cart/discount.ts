// POST /api/cart/discount — { codes: string[] }  (pass [] to clear)
// Applies/clears Shopify cart discount codes. Returns the updated cart;
// the cart's `discountCodes[].applicable` flag tells the UI whether the
// code was accepted.
import type { APIRoute } from 'astro';
import { buyerIpFrom, setDiscountCodes, json } from '~/lib/cart-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = Array.isArray(body?.codes) ? body.codes : body?.code ? [body.code] : [];
    const codes = raw.map((c: unknown) => String(c).trim()).filter(Boolean).slice(0, 5);

    const { cart, userErrors } = await setDiscountCodes(cookies, codes, buyerIpFrom(request));
    return json({ cart, userErrors });
  } catch (err) {
    return json({ cart: null, error: (err as Error).message }, 500);
  }
};
