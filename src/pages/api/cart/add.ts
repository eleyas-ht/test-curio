// POST /api/cart/add — { merchandiseId, quantity? }
import type { APIRoute } from 'astro';
import { addLines, buyerIpFrom, countryFrom, json } from '~/lib/cart-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const merchandiseId = String(body?.merchandiseId ?? '');
    // Coerce to a positive integer (1..99); never send NaN/fractional to the Int field.
    const n = Math.floor(Number(body?.quantity));
    const quantity = Number.isFinite(n) && n > 0 ? Math.min(n, 99) : 1;

    if (!merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
      return json({ cart: null, userErrors: [{ message: 'Invalid variant id' }] }, 400);
    }

    // Optional line attributes (e.g. _bundleDiscount: "10" from the bundle section).
    const rawAttrs = body?.attributes;
    const attributes: { key: string; value: string }[] | undefined =
      Array.isArray(rawAttrs)
        ? rawAttrs
            .filter(
              (a: unknown): a is { key: string; value: string } =>
                typeof (a as any)?.key === 'string' && typeof (a as any)?.value === 'string',
            )
        : undefined;

    const { cart, userErrors } = await addLines(
      cookies,
      [{ merchandiseId, quantity, ...(attributes ? { attributes } : {}) }],
      buyerIpFrom(request),
      request,
      countryFrom(request),
    );
    return json({ cart, userErrors });
  } catch (err) {
    return json({ cart: null, error: (err as Error).message }, 500);
  }
};
