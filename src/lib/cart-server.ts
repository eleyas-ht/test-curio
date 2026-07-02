// ============================================================
//  Cart server helpers — used by the /api/cart/* endpoints.
//  Centralizes "ensure a cart exists", cookie sync, and the
//  self-healing path when a stored cart id has expired.
// ============================================================
import type { AstroCookies } from 'astro';
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
  updateCartDiscountCodes,
  updateCartNote,
  type CartLineInput,
  type CartLineUpdateInput,
  type CartResult,
} from '~/lib/shopify';
import { clearCartId, getCartId, setCartId } from './cart-cookie';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * The buyer's IP, forwarded to Shopify for tax/duty estimation and fraud
 * signals. On Cloudflare Workers `Astro.clientAddress` throws, so we read
 * the IP from the edge headers instead (CF-Connecting-IP, then XFF).
 */
export function buyerIpFrom(request: Request): string | undefined {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    undefined
  );
}

/** Fetch the current cart from the cookie; self-heals stale ids. */
export async function readCart(cookies: AstroCookies, buyerIp?: string): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [] };
  const cart = await getCart(id, { buyerIp });
  if (!cart) clearCartId(cookies); // expired / invalid — forget it
  return { cart, userErrors: [] };
}

/**
 * Add lines, creating a cart on first add (or recreating one when
 * the stored cart has expired). Keeps the cookie in sync.
 */
export async function addLines(
  cookies: AstroCookies,
  lines: CartLineInput[],
  buyerIp?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (id) {
    const res = await addCartLines(id, lines, { buyerIp });
    if (res.cart) return res;
    // Stored cart vanished — fall through and start a fresh one.
    clearCartId(cookies);
  }
  const created = await createCart(lines, { buyerIp });
  if (created.cart) setCartId(cookies, created.cart.id);
  return created;
}

/** Update a line quantity; quantity 0 removes the line. */
export async function updateLine(
  cookies: AstroCookies,
  line: CartLineUpdateInput,
  buyerIp?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res =
    line.quantity !== undefined && line.quantity <= 0
      ? await removeCartLines(id, [line.id], { buyerIp })
      : await updateCartLines(id, [line], { buyerIp });
  if (!res.cart) clearCartId(cookies); // cart expired — forget it so the next GET self-heals
  return res;
}

/** Apply or clear discount codes on the active cart. */
export async function setDiscountCodes(
  cookies: AstroCookies,
  codes: string[],
  buyerIp?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res = await updateCartDiscountCodes(id, codes, { buyerIp });
  if (!res.cart) clearCartId(cookies);
  return res;
}

/** Set the order note on the active cart. */
export async function setCartNote(
  cookies: AstroCookies,
  note: string,
  buyerIp?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res = await updateCartNote(id, note, { buyerIp });
  if (!res.cart) clearCartId(cookies);
  return res;
}

/** Remove one or more lines. */
export async function removeLines(
  cookies: AstroCookies,
  lineIds: string[],
  buyerIp?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res = await removeCartLines(id, lineIds, { buyerIp });
  if (!res.cart) clearCartId(cookies); // cart expired — forget it so the next GET self-heals
  return res;
}
