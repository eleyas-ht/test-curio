export interface JudgeMeWidget {
  rating: number;
  count: number;
  html: string;
  productId: number;
}

export async function getProductWidget(handle: string): Promise<JudgeMeWidget | null> {
  const token = import.meta.env.JUDGEME_API_TOKEN as string | undefined;
  const shop  = import.meta.env.SHOPIFY_SHOP_DOMAIN as string | undefined;
  if (!token || !shop) return null;

  try {
    const url =
      `https://judge.me/api/v1/widgets/product_review` +
      `?api_token=${encodeURIComponent(token)}` +
      `&shop_domain=${encodeURIComponent(shop)}` +
      `&handle=${encodeURIComponent(handle)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    const data = (await res.json()) as { product_external_id?: number; widget?: string };
    if (!data.widget) return null;

    // Pull rating + count from data-attributes the API embeds in the widget HTML
    const ratingM = data.widget.match(/data-average-rating='([^']+)'/);
    const countM  = data.widget.match(/data-number-of-reviews='(\d+)'/);
    const rating  = ratingM ? parseFloat(ratingM[1]) : 0;
    const count   = countM  ? parseInt(countM[1], 10) : 0;
    if (!count) return null;

    const productId = data.product_external_id ?? 0;

    // Build the hosted write-review URL — used as the link href (fallback navigation)
    // and as the iframe src in our modal overlay.
    const reviewFormUrl =
      `https://judge.me/review/new` +
      `?shop_domain=${encodeURIComponent(shop)}` +
      `&api_token=${encodeURIComponent(token)}` +
      `&platform=shopify` +
      `&id=${productId}` +
      `&url=${encodeURIComponent(`https://${shop}/products/${handle}`)}`;

    // 1. Inject data-id + data-handle so Judge.me's JS can initialise the widget.
    // 2. Replace href='#' on the write-review link with the real form URL so our
    //    modal interceptor (and the href fallback) always have a working destination.
    const html = data.widget
      .replace(
        "class='jdgm-rev-widg'",
        `class='jdgm-rev-widg' data-id='${productId}' data-handle='${handle}'`,
      )
      .replace(
        "href='#' class='jdgm-write-rev-link'",
        `href='${reviewFormUrl}' class='jdgm-write-rev-link'`,
      );

    return { rating, count, html, productId };
  } catch {
    return null;
  }
}
