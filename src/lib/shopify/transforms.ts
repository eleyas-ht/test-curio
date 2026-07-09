// ============================================================
//  Transforms — flatten Shopify edges/node envelopes into the
//  clean domain shapes defined in types.ts.
// ============================================================
import type {
  Cart,
  CartLine,
  Collection,
  PageInfo,
  Paginated,
  Product,
  ProductCard,
  ProductVariant,
} from './types';

interface Edge<T> {
  cursor?: string;
  node: T;
}
interface Connection<T> {
  edges?: Edge<T>[];
  pageInfo?: PageInfo;
}

/** Pull the node list out of a Relay-style connection. */
export function nodes<T>(connection?: Connection<T> | null): T[] {
  return connection?.edges?.map((e) => e.node) ?? [];
}

const EMPTY_PAGE_INFO: PageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

/** Flatten a connection into { items, pageInfo }. */
export function paginate<TRaw, TOut>(
  connection: Connection<TRaw> | null | undefined,
  map: (node: TRaw) => TOut,
): Paginated<TOut> {
  return {
    items: nodes(connection).map(map),
    pageInfo: connection?.pageInfo ?? EMPTY_PAGE_INFO,
  };
}

// Raw shapes only need the connection-ish bits typed loosely.
type Raw = Record<string, any>;

export function mapProductCard(p: Raw): ProductCard {
  const opts: Raw[] = p.options ?? [];
  const hasOnlyDefaultVariant =
    opts.length === 0 ||
    (opts.length === 1 &&
      (opts[0].optionValues?.length ?? 0) <= 1 &&
      opts[0].optionValues?.[0]?.name === 'Default Title');

  // Shopify Product Reviews app stores rating as JSON: {"value":"4.8","scale_min":"1","scale_max":"5"}
  let rating: number | null = null;
  let ratingCount: number | null = null;
  try {
    const ratingMeta = p.rating?.value;
    if (ratingMeta) {
      const parsed = JSON.parse(ratingMeta) as { value?: string };
      const n = parseFloat(parsed.value ?? '');
      if (!isNaN(n)) rating = n;
    }
    const countMeta = p.ratingCount?.value;
    if (countMeta) {
      const n = parseInt(countMeta, 10);
      if (!isNaN(n)) ratingCount = n;
    }
  } catch {}

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description ?? '',
    vendor: p.vendor,
    productType: p.productType ?? '',
    tags: p.tags ?? [],
    availableForSale: p.availableForSale ?? true,
    variantId: p.variants?.nodes?.[0]?.id,
    firstVariantAvailable: p.variants?.nodes?.[0]?.availableForSale ?? false,
    hasOnlyDefaultVariant,
    featuredImage: p.featuredImage ?? null,
    priceRange: p.priceRange,
    compareAtPriceRange: p.compareAtPriceRange,
    rating,
    ratingCount,
  };
}

export function mapVariant(v: Raw): ProductVariant {
  // Flatten Shopify storeAvailability into the client-ready pickup shape.
  const pickup = nodes<Raw>(v.storeAvailability).map((s) => {
    const loc = s.location ?? {};
    const a = loc.address ?? {};
    const addr = [a.city, a.province, a.country].filter(Boolean).join(', ');
    return {
      name: loc.name ?? 'Store',
      addr,
      status: (s.available ? 'in' : 'out') as 'in' | 'low' | 'out',
      time: s.pickUpTime || (s.available ? 'Usually ready soon' : 'Currently unavailable for pickup'),
    };
  });

  return {
    id: v.id,
    title: v.title,
    sku: v.sku ?? null,
    availableForSale: v.availableForSale ?? false,
    quantityAvailable: v.quantityAvailable ?? null,
    selectedOptions: v.selectedOptions ?? [],
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? null,
    image: v.image ?? null,
    pickup,
  };
}

export function mapProduct(p: Raw): Product {
  let rating: number | null = null;
  let ratingCount: number | null = null;
  try {
    const ratingMeta = p.rating?.value;
    if (ratingMeta) {
      const parsed = JSON.parse(ratingMeta) as { value?: string };
      const n = parseFloat(parsed.value ?? '');
      if (!isNaN(n)) rating = n;
    }
    const countMeta = p.ratingCount?.value;
    if (countMeta) {
      const n = parseInt(countMeta, 10);
      if (!isNaN(n)) ratingCount = n;
    }
  } catch {}

  // custom.highlights — either a list.*_text_field (JSON array) or a
  // multi_line_text_field (newline-separated). Support both.
  let highlights: string[] = [];
  const hlMeta = p.highlights?.value;
  if (hlMeta) {
    try {
      const parsed = JSON.parse(hlMeta);
      if (Array.isArray(parsed)) highlights = parsed.map(String);
    } catch {
      highlights = String(hlMeta).split('\n');
    }
    highlights = highlights.map((s) => s.trim()).filter(Boolean);
  }

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description ?? '',
    descriptionHtml: p.descriptionHtml ?? '',
    vendor: p.vendor ?? '',
    productType: p.productType ?? '',
    tags: p.tags ?? [],
    availableForSale: p.availableForSale ?? false,
    featuredImage: p.featuredImage ?? null,
    images: nodes(p.images),
    priceRange: p.priceRange,
    compareAtPriceRange: p.compareAtPriceRange,
    options: p.options ?? [],
    variants: nodes(p.variants).map(mapVariant),
    seo: p.seo ?? {},
    rating,
    ratingCount,
    highlights,
  };
}

export function mapCollection(c: Raw): Collection {
  // Extract the cheapest product's min price when the query asked for it.
  const firstProduct = c.products?.edges?.[0]?.node;
  const minPrice = firstProduct?.priceRange?.minVariantPrice ?? null;
  const firstProductImage = firstProduct?.featuredImage ?? null;
  // c.editorialTitle is the GraphQL alias for metafield(namespace:"custom", key:"editorial_title")
  const editorialTitle = c.editorialTitle?.value ?? null;
  // Count edges from the products connection (populated by DEPT_*_QUERY).
  // The Storefront API has no productsCount scalar; counting edges is the
  // correct approach for collections with ≤250 products.
  const productEdges = c.products?.edges;
  const productCount = Array.isArray(productEdges) ? productEdges.length : null;
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
    description: c.description ?? '',
    descriptionHtml: c.descriptionHtml ?? '',
    image: c.image ?? null,
    seo: c.seo ?? {},
    minPrice,
    editorialTitle,
    productCount,
    firstProductImage,
  };
}

function mapCartLine(l: Raw): CartLine {
  return {
    id: l.id,
    quantity: l.quantity,
    cost: l.cost,
    discountAllocations: l.discountAllocations ?? [],
    attributes: l.attributes ?? [],
    merchandise: {
      id: l.merchandise?.id,
      title: l.merchandise?.title,
      availableForSale: l.merchandise?.availableForSale ?? true,
      selectedOptions: l.merchandise?.selectedOptions ?? [],
      price: l.merchandise?.price,
      image: l.merchandise?.image ?? null,
      product: l.merchandise?.product,
    },
  };
}

export function mapCart(c: Raw | null | undefined): Cart | null {
  if (!c) return null;
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity ?? 0,
    note: c.note ?? null,
    buyerIdentity: c.buyerIdentity ?? null,
    discountCodes: c.discountCodes ?? [],
    cost: c.cost,
    lines: nodes(c.lines).map(mapCartLine),
  };
}
