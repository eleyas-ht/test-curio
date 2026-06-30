// ============================================================
//  Compare store — localStorage-backed nanostore.
//  Holds up to MAX_COMPARE lightweight product snapshots so
//  the compare bar and compare page can render without extra
//  Shopify API calls.
// ============================================================
import { atom } from 'nanostores';

const STORAGE_KEY = 'omnix-compare';
export const MAX_COMPARE = 4;

export interface CompareProduct {
  id: string;
  handle: string;
  title: string;
  image: string;
  price: string;
  currency: string;
  vendor: string;
  productType: string;
}

export const $compare = atom<CompareProduct[]>([]);

let initialized = false;

export function initCompare(): void {
  if (initialized || typeof localStorage === 'undefined') return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) $compare.set(JSON.parse(raw) as CompareProduct[]);
  } catch {}
}

function persist(products: CompareProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

/**
 * Toggle a product in/out of the compare list.
 * Returns true if now in compare, false if removed.
 * Returns false without adding if the list is already at MAX_COMPARE.
 */
export function toggleCompare(product: CompareProduct): boolean {
  initCompare();
  const current = $compare.get();
  const exists = current.some((p) => p.id === product.id);
  let next: CompareProduct[];
  if (exists) {
    next = current.filter((p) => p.id !== product.id);
  } else {
    if (current.length >= MAX_COMPARE) return false;
    next = [...current, product];
  }
  $compare.set(next);
  persist(next);
  return !exists;
}

export function removeFromCompare(productId: string): void {
  const next = $compare.get().filter((p) => p.id !== productId);
  $compare.set(next);
  persist(next);
}

export function clearCompare(): void {
  $compare.set([]);
  persist([]);
}

export function isInCompare(productId: string): boolean {
  return $compare.get().some((p) => p.id === productId);
}
