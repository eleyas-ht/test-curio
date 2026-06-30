// ============================================================
//  Wishlist store — localStorage-backed nanostore.
//  Stores full product snapshots so the drawer can render
//  images, prices and add-to-cart without extra API calls.
// ============================================================
import { atom } from 'nanostores';

const STORAGE_KEY = 'omnix-wishlist';

export interface WishlistProduct {
  id: string;
  handle: string;
  title: string;
  image: string;
  price: string;
  currency: string;
  vendor: string;
  variantId: string;
  availableForSale: boolean;
}

export const $wishlist = atom<WishlistProduct[]>([]);
export const $wishlistOpen = atom<boolean>(false);

let initialized = false;

export function initWishlist(): void {
  if (initialized || typeof localStorage === 'undefined') return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) $wishlist.set(JSON.parse(raw) as WishlistProduct[]);
  } catch {}
}

function persist(products: WishlistProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

/** Toggle a product. Returns true if now wishlisted. */
export function toggleWishlist(product: WishlistProduct): boolean {
  initWishlist();
  const current = $wishlist.get();
  const exists = current.some((p) => p.id === product.id);
  const next = exists
    ? current.filter((p) => p.id !== product.id)
    : [...current, product];
  $wishlist.set(next);
  persist(next);
  return !exists;
}

export function removeFromWishlist(productId: string): void {
  const next = $wishlist.get().filter((p) => p.id !== productId);
  $wishlist.set(next);
  persist(next);
}

export function isWishlisted(productId: string): boolean {
  return $wishlist.get().some((p) => p.id === productId);
}

export function openWishlist(): void  { $wishlistOpen.set(true); }
export function closeWishlist(): void { $wishlistOpen.set(false); }
