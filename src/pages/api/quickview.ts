// ============================================================
//  GET /api/quickview?handle=... — product data for the Quick View
//  modal (image, price, description, options + variants).
// ============================================================
import type { APIRoute } from 'astro';
import { getProduct } from '~/lib/shopify';
import { formatMoney, isOnSale } from '~/lib/utils';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ url }) => {
  const handle = url.searchParams.get('handle') ?? '';
  if (!handle) return json({ error: 'Missing handle' }, 400);
  try {
    const p = await getProduct(handle);
    if (!p) return json({ error: 'Not found' }, 404);

    const min = p.priceRange.minVariantPrice;
    const cmp = p.compareAtPriceRange?.minVariantPrice ?? null;
    const onSale = isOnSale(min, cmp);

    // Hide a single "Default Title" option (no real variants to choose).
    const realOptions = p.options.filter(
      (o) => !(o.optionValues.length === 1 && o.optionValues[0].name === 'Default Title'),
    );

    return json({
      handle: p.handle,
      title: p.title,
      category: p.productType || p.vendor || 'Shop',
      image: p.featuredImage?.url ?? p.images[0]?.url ?? '',
      priceNow: formatMoney(min.amount, min.currencyCode),
      priceWas: onSale && cmp ? formatMoney(cmp.amount, cmp.currencyCode) : '',
      desc: (p.description || '').slice(0, 220),
      currency: min.currencyCode,
      options: realOptions.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
      variants: p.variants.map((v) => ({
        id: v.id,
        available: v.availableForSale,
        price: formatMoney(v.price.amount, v.price.currencyCode),
        priceNum: Number(v.price.amount),
        options: v.selectedOptions,
        image: v.image?.url ?? null,
      })),
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
};
