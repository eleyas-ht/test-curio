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
  updateCartBuyerIdentity,
  type CartLineInput,
  type CartLineUpdateInput,
  type CartResult,
} from '~/lib/shopify';
import {
  createCustomerClient,
  CUSTOMER_EMAIL_QUERY,
  getPublicOrigin,
} from '~/lib/shopify/customer';
import { clearCartId, getCartId, setCartId } from './cart-cookie';
import { buyerIpFrom } from './shopify/buyer-ip';
import { countryFrom } from './shopify/country';

export { buyerIpFrom, countryFrom };

interface CustomerEmailResult {
  customer: { emailAddress: { emailAddress: string } | null } | null;
}

/**
 * If the visitor is logged in via the Customer Account API, fetch their
 * email. Used to attach `buyerIdentity` to the cart so the resulting order
 * is linked to the customer's account (otherwise it completes and shows in
 * Shopify Admin, but never appears under the customer's Order History).
 */
async function loggedInEmail(
  cookies: AstroCookies,
  request: Request,
): Promise<string | undefined> {
  const client = createCustomerClient(cookies, getPublicOrigin(request, new URL(request.url)));
  if (!client.isLoggedIn()) return undefined;
  try {
    const data = await client.query<CustomerEmailResult>(CUSTOMER_EMAIL_QUERY);
    return data.customer?.emailAddress?.emailAddress ?? undefined;
  } catch {
    // Session expired/invalid — fall back to an anonymous cart rather than fail the request.
    return undefined;
  }
}

/** Attach the logged-in customer's email to the cart if it isn't already set. */
async function syncBuyerIdentity(
  cart: NonNullable<CartResult['cart']>,
  cookies: AstroCookies,
  request: Request,
  buyerIp?: string,
  country?: string,
): Promise<typeof cart> {
  const email = await loggedInEmail(cookies, request);
  if (!email || cart.buyerIdentity?.email === email) return cart;
  const res = await updateCartBuyerIdentity(cart.id, email, { buyerIp, country });
  return res.cart ?? cart;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Fetch the current cart from the cookie; self-heals stale ids. */
export async function readCart(
  cookies: AstroCookies,
  buyerIp?: string,
  request?: Request,
  country?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [] };
  let cart = await getCart(id, { buyerIp, country });
  if (!cart) {
    clearCartId(cookies); // expired / invalid — forget it
    return { cart: null, userErrors: [] };
  }
  if (request) cart = await syncBuyerIdentity(cart, cookies, request, buyerIp, country);
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
  request?: Request,
  country?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (id) {
    const res = await addCartLines(id, lines, { buyerIp, country });
    if (res.cart) {
      if (request) res.cart = await syncBuyerIdentity(res.cart, cookies, request, buyerIp, country);
      return res;
    }
    // Stored cart vanished — fall through and start a fresh one.
    clearCartId(cookies);
  }
  const email = request ? await loggedInEmail(cookies, request) : undefined;
  const created = await createCart(lines, { buyerIp, country }, email);
  if (created.cart) setCartId(cookies, created.cart.id);
  return created;
}

/** Update a line quantity; quantity 0 removes the line. */
export async function updateLine(
  cookies: AstroCookies,
  line: CartLineUpdateInput,
  buyerIp?: string,
  country?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res =
    line.quantity !== undefined && line.quantity <= 0
      ? await removeCartLines(id, [line.id], { buyerIp, country })
      : await updateCartLines(id, [line], { buyerIp, country });
  if (!res.cart) clearCartId(cookies); // cart expired — forget it so the next GET self-heals
  return res;
}

/** Apply or clear discount codes on the active cart. */
export async function setDiscountCodes(
  cookies: AstroCookies,
  codes: string[],
  buyerIp?: string,
  country?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res = await updateCartDiscountCodes(id, codes, { buyerIp, country });
  if (!res.cart) clearCartId(cookies);
  return res;
}

/** Set the order note on the active cart. */
export async function setCartNote(
  cookies: AstroCookies,
  note: string,
  buyerIp?: string,
  country?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res = await updateCartNote(id, note, { buyerIp, country });
  if (!res.cart) clearCartId(cookies);
  return res;
}

/** Remove one or more lines. */
export async function removeLines(
  cookies: AstroCookies,
  lineIds: string[],
  buyerIp?: string,
  country?: string,
): Promise<CartResult> {
  const id = getCartId(cookies);
  if (!id) return { cart: null, userErrors: [{ message: 'No active cart' }] };
  const res = await removeCartLines(id, lineIds, { buyerIp, country });
  if (!res.cart) clearCartId(cookies); // cart expired — forget it so the next GET self-heals
  return res;
}
