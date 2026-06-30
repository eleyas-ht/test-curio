// ============================================================
//  BundleSection — React island
//
//  Handles the entire CURATED BUNDLE interactive experience:
//    • Multi-slide carousel with animated transitions
//    • Per-item toggle (include / exclude from bundle)
//    • Per-item variant selector (Shopify mode)
//    • Dynamic price + savings calculations
//    • Add-to-cart (sequential Shopify API calls, one per item)
//
//  Props are pre-resolved by the SSR wrapper (Bundle.astro):
//  the parent does all Shopify fetching; this island is pure UI.
// ============================================================

import { useState } from 'react';
import { addItem, openCart, applyDiscount, $cart } from '~/stores/cart';
import { formatMoney } from '~/lib/utils';

// ── Exported types (imported by Bundle.astro) ────────────────

export interface BundleVariant {
  /** Shopify variant GID — e.g. gid://shopify/ProductVariant/123 */
  id: string;
  /** Combined option label, e.g. "Black / Large". "Default Title" for simple products. */
  title: string;
  /** Numeric price in store currency (parsed from Storefront Money.amount). */
  price: number;
  /** Numeric compare-at price; undefined when not set. */
  compareAtPrice?: number;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  /** Variant-specific image URL; falls back to product image when absent. */
  imageUrl?: string;
}

export interface BundleItemData {
  // Shopify fields (only populated in shopify mode)
  shopifyId?: string;
  handle?: string;
  variants?: BundleVariant[];
  hasOnlyDefaultVariant?: boolean;
  availableForSale?: boolean;
  // Display fields (both modes)
  image: string;
  imageAlt?: string;
  name: string;
  description: string;
  /** Base display price (first variant price in shopify mode; config price in custom mode). */
  price: number;
  compareAtPrice?: number;
}

export interface BundleSlideData {
  label: string;
  /** May contain <em> tags — rendered via dangerouslySetInnerHTML (config-controlled, safe). */
  title: string;
  intro: string;
  heroImage: string;
  discount: number;
  ctaText: string;
  /** True when products carry real Shopify variant IDs that can be added to cart. */
  isShopifyMode: boolean;
  /**
   * Shopify discount code to apply when the full bundle is added to cart.
   * Merged with any code the shopper already entered — existing codes are kept.
   * Create this code in Shopify Admin → Discounts with the matching percentage.
   */
  discountCode?: string;
  /** ISO 4217 currency code for all prices in this slide (e.g. "USD", "EUR"). */
  currencyCode: string;
  items: BundleItemData[];
}

interface Props {
  slides: BundleSlideData[];
}

// ── Helpers ───────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// ── Component ─────────────────────────────────────────────────

export default function BundleSection({ slides }: Props) {
  const total = slides.length;

  // Current slide index
  const [cur, setCur] = useState(0);
  // CSS transition in-flight flag (drives .switching classes)
  const [switching, setSwitching] = useState(false);
  // Which item indices are deselected (off) in the current slide
  const [offItems, setOffItems] = useState<boolean[]>(() =>
    Array(slides[0]?.items.length ?? 0).fill(false),
  );
  // Selected variant index per item
  const [selectedVariants, setSelectedVariants] = useState<number[]>(() =>
    Array(slides[0]?.items.length ?? 0).fill(0),
  );
  // Add-to-cart loading state
  const [adding, setAdding] = useState(false);
  // Success flash after add-to-cart completes
  const [addSuccess, setAddSuccess] = useState(false);
  // Flash key — incrementing forces the CSS price animation to restart
  const [flashKey, setFlashKey] = useState(0);

  const slide = slides[cur] ?? slides[0];
  if (!slide) return null;

  // ── Derived values ──────────────────────────────────────────

  function resolvedPrice(item: BundleItemData, vi: number): number {
    return item.variants?.[vi]?.price ?? item.price;
  }

  function resolvedCompareAt(item: BundleItemData, vi: number): number | undefined {
    return item.variants?.[vi]?.compareAtPrice ?? item.compareAtPrice;
  }

  const selectedIndices = slide.items.map((_, i) => i).filter((i) => !(offItems[i] ?? false));
  const allSelected = selectedIndices.length === slide.items.length;
  const noneSelected = selectedIndices.length === 0;

  const subtotal = selectedIndices.reduce(
    (sum, i) => sum + resolvedPrice(slide.items[i], selectedVariants[i] ?? 0),
    0,
  );
  const discountedTotal =
    allSelected && slide.discount > 0
      ? Math.round(subtotal * (1 - slide.discount / 100))
      : subtotal;

  // ── Slider navigation ────────────────────────────────────────

  function goTo(n: number) {
    if (switching) return;
    setSwitching(true);
    setTimeout(() => {
      const next = ((n % total) + total) % total;
      setCur(next);
      setOffItems(Array(slides[next].items.length).fill(false));
      setSelectedVariants(Array(slides[next].items.length).fill(0));
      setAddSuccess(false);
      // Double RAF mirrors the reference HTML to let the new content paint
      // before the fade-in transition begins.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSwitching(false);
        });
      });
    }, 260);
  }

  // ── Item toggle ───────────────────────────────────────────────

  function toggleItem(i: number) {
    setOffItems((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
    setFlashKey((k) => k + 1);
  }

  // ── Variant selector ─────────────────────────────────────────

  function setVariant(itemIdx: number, variantIdx: number) {
    setSelectedVariants((prev) => {
      const next = [...prev];
      next[itemIdx] = variantIdx;
      return next;
    });
    setFlashKey((k) => k + 1);
  }

  // ── Add to cart ───────────────────────────────────────────────

  async function handleAddToCart() {
    if (noneSelected || adding) return;

    if (!slide.isShopifyMode) {
      // Custom mode: animate success without a real cart add.
      setAdding(true);
      await new Promise<void>((r) => setTimeout(r, 550));
      setAdding(false);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 1800);
      return;
    }

    // Shopify mode: build list of variant IDs to add
    const toAdd: string[] = selectedIndices
      .map((i) => {
        const item = slide.items[i];
        const vi = selectedVariants[i] ?? 0;
        return item.variants?.[vi]?.id;
      })
      .filter((id): id is string => Boolean(id));

    if (toAdd.length === 0) return;

    setAdding(true);
    try {
      // When the full bundle is selected and a discount applies, stamp each line
      // with a _bundleDiscount attribute so the cart drawer can show the savings
      // even before the Shopify discount code is verified as applicable.
      const bundleAttrs =
        allSelected && slide.discount > 0
          ? [{ key: '_bundleDiscount', value: String(slide.discount) }]
          : undefined;

      // Add items sequentially; suppress drawer open until all are done
      for (let k = 0; k < toAdd.length; k++) {
        await addItem(toAdd[k], 1, { open: false, attributes: bundleAttrs });
      }

      // Apply the bundle discount code when the full bundle is selected.
      // We merge with any discount code the shopper already has in their cart
      // so existing codes are not wiped out.
      if (allSelected && slide.discountCode) {
        const existingCodes = ($cart.get()?.discountCodes ?? [])
          .map((d) => d.code)
          .filter(Boolean);
        const merged = [...new Set([...existingCodes, slide.discountCode])];
        await applyDiscount(merged);
      }

      openCart();
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 1800);
    } finally {
      setAdding(false);
    }
  }

  // ── CTA button label ─────────────────────────────────────────

  function ctaLabel(): string {
    if (addSuccess) return 'Added to cart';
    if (noneSelected) return 'Select items';
    if (allSelected) return slide.ctaText ?? 'Add Setup to cart';
    const n = selectedIndices.length;
    return `Add ${n} item${n === 1 ? '' : 's'} to cart`;
  }

  // ── Render ───────────────────────────────────────────────────

  const ArrowIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width={14} height={14}>
      <path
        fillRule="evenodd"
        d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="m5 12 4 4L19 7" />
    </svg>
  );

  return (
    <section className="section-bundle">
      <div className="container bundle-inner">

        {/* ── Left panel: hero image ── */}
        <div className="bundle-image">
          <img
            src={slide.heroImage}
            alt={slide.label}
            className={switching ? 'switching' : undefined}
          />
        </div>

        {/* ── Right panel: content ── */}
        <div className={`bundle-content${switching ? ' switching' : ''}`}>

          <span className="label">{slide.label}</span>
          {/* Title may contain <em> markup from config — safe, not from user input */}
          <h2
            className="bundle-title"
            dangerouslySetInnerHTML={{ __html: slide.title }}
          />
          <p className="bundle-intro">{slide.intro}</p>

          {/* ── Product list ── */}
          <div className="bundle-items">
            {slide.items.map((item, i) => {
              const off = offItems[i] ?? false;
              const vi = selectedVariants[i] ?? 0;
              const price = resolvedPrice(item, vi);
              const compareAt = resolvedCompareAt(item, vi);
              const hasVariants =
                (item.variants?.length ?? 0) > 1 && !item.hasOnlyDefaultVariant;
              const imgSrc = item.variants?.[vi]?.imageUrl ?? item.image;
              const isUnavailable = item.variants?.[vi]?.availableForSale === false;

              return (
                <div
                  key={i}
                  className={`bundle-item${off ? ' off' : ''}`}
                  onClick={() => toggleItem(i)}
                >
                  {/* Check toggle */}
                  <span className="bundle-item-check">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="m3 8 3.5 3.5L13 5" />
                    </svg>
                  </span>

                  {/* Thumbnail */}
                  <div className="bundle-item-thumb">
                    <img src={imgSrc} alt={item.imageAlt ?? item.name} />
                  </div>

                  {/* Info */}
                  <div className="bundle-item-info">
                    <div className="bundle-item-name">{item.name}</div>
                    <div className="bundle-item-desc">{item.description}</div>

                    {/* Variant selector — only shown for products with real options */}
                    {hasVariants && (
                      <select
                        className="bundle-item-variant-select"
                        value={vi}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setVariant(i, Number(e.target.value));
                        }}
                      >
                        {item.variants!.map((v, idx) => (
                          <option key={idx} value={idx} disabled={!v.availableForSale}>
                            {v.title}
                            {!v.availableForSale ? ' — Sold out' : ''}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Sold out badge */}
                    {isUnavailable && (
                      <span className="bundle-item-sold-out">Sold out</span>
                    )}
                  </div>

                  {/* Price column */}
                  <div className="bundle-item-price-col">
                    {compareAt !== undefined && compareAt > price && (
                      <span className="bundle-item-compare">{formatMoney(compareAt, slide.currencyCode)}</span>
                    )}
                    <span className="bundle-item-price">{formatMoney(price, slide.currencyCode)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Bundle total ── */}
          <div className="bundle-total">
            {noneSelected ? (
              <>
                <span className="bundle-total-was" style={{ visibility: 'hidden' }}>&nbsp;</span>
                {/* key changes force the price animation to restart on each toggle */}
                <span key={flashKey} className="bundle-total-now">{formatMoney(0, slide.currencyCode)}</span>
                <span className="bundle-total-save">Select items</span>
              </>
            ) : allSelected && slide.discount > 0 ? (
              <>
                <span className="bundle-total-was">{formatMoney(subtotal, slide.currencyCode)}</span>
                <span key={flashKey} className="bundle-total-now flashing">
                  {formatMoney(discountedTotal, slide.currencyCode)}
                </span>
                <span className="bundle-total-save">Save {slide.discount}%</span>
              </>
            ) : (
              <>
                <span className="bundle-total-was" style={{ visibility: 'hidden' }}>&nbsp;</span>
                <span key={flashKey} className="bundle-total-now flashing">
                  {formatMoney(subtotal, slide.currencyCode)}
                </span>
                <span className="bundle-total-save">
                  {selectedIndices.length} of {slide.items.length} items
                </span>
              </>
            )}
          </div>

          {/* ── Nav row: CTA + slide controls ── */}
          <div className="bundle-nav-row">

            {/* Add to cart button */}
            <button
              className="btn-primary"
              disabled={noneSelected || adding}
              onClick={handleAddToCart}
              style={noneSelected ? { opacity: 0.45, pointerEvents: 'none' } : undefined}
            >
              {adding ? (
                <span style={{ letterSpacing: '0.2em', opacity: 0.7 }}>•&thinsp;•&thinsp;•</span>
              ) : addSuccess ? (
                <>
                  <CheckIcon /> Added to cart
                </>
              ) : (
                <>
                  {ctaLabel()} <ArrowIcon />
                </>
              )}
            </button>

            {/* Slide counter + next arrow (hidden when only one slide) */}
            {total > 1 && (
              <div className="bundle-nav-controls">
                <span className="bundle-nav-counter">
                  {pad(cur + 1)} — {pad(total)}
                </span>
                <button
                  className="bundle-nav-arrow"
                  aria-label="Next setup"
                  onClick={() => goTo(cur + 1)}
                  disabled={switching}
                >
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
