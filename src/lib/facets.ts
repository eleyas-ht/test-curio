// ============================================================
//  buildFacets — derive the shop/collection filter facets
//  (categories, brands, price max) from a product list.
// ============================================================
import type { ProductCard } from '~/lib/shopify/types';

const slug = (s?: string) => (s ?? 'other').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export interface Facets {
  categories: { value: string; label: string }[];
  brands: string[];
  priceMax: number;
}

export function buildFacets(products: ProductCard[]): Facets {
  const catMap = new Map<string, string>();
  for (const p of products) if (p.productType) catMap.set(slug(p.productType), p.productType);
  const categories = [...catMap]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const brands = [...new Set(products.map((p) => p.vendor).filter((v): v is string => !!v))].sort();
  const priceMax = products.reduce((m, p) => Math.max(m, Number(p.priceRange.maxVariantPrice.amount) || 0), 0);

  return { categories, brands, priceMax };
}
