// ============================================================
//  bundle-render — pure HTML-string builders for the Curated
//  Bundle section, shared by BOTH the server render
//  (BundleSection.astro) and the client script. Keeping one set
//  of templates means the SSR markup and the JS-updated markup
//  can never drift apart.
//
//  Nothing here touches the DOM — it only turns (state, slides)
//  into HTML strings, mirroring what the old React island rendered.
// ============================================================
import { formatMoney } from '~/lib/utils';
import type { BundleSlideData, BundleItemData } from './bundle.types';

/** Client-side interaction state (mirrors the React island's useState set). */
export interface BundleState {
  /** Current slide index. */
  cur: number;
  /** Per-item deselected flag for the current slide (true = excluded). */
  off: boolean[];
  /** Selected variant index per item for the current slide. */
  variants: number[];
  /** Add-to-cart request in flight. */
  adding: boolean;
  /** Brief success flash after an add. */
  addSuccess: boolean;
  /** Slide transition in flight (drives the .switching classes). */
  switching: boolean;
}

/** Escape text destined for HTML text/attribute context. */
function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Inline SVGs (verbatim from the React island's icons) ──────
const CHECK_ITEM =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 8 3.5 3.5L13 5"/></svg>';
const ARROW_CTA =
  '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';
const CHECK_CTA =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 4 4L19 7"/></svg>';
const ARROW_NAV =
  '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';

// ── Pure helpers (identical math to the React component) ──────
export function pad(n: number): string {
  return String(n).padStart(2, '0');
}
export function resolvedPrice(item: BundleItemData, vi: number): number {
  return item.variants?.[vi]?.price ?? item.price;
}
export function resolvedCompareAt(item: BundleItemData, vi: number): number | undefined {
  return item.variants?.[vi]?.compareAtPrice ?? item.compareAtPrice;
}
export function selectedIndices(state: BundleState, slide: BundleSlideData): number[] {
  return slide.items.map((_, i) => i).filter((i) => !(state.off[i] ?? false));
}
export function allSelected(state: BundleState, slide: BundleSlideData): boolean {
  return selectedIndices(state, slide).length === slide.items.length;
}
export function noneSelected(state: BundleState, slide: BundleSlideData): boolean {
  return selectedIndices(state, slide).length === 0;
}
export function subtotalOf(state: BundleState, slide: BundleSlideData): number {
  return selectedIndices(state, slide).reduce(
    (sum, i) => sum + resolvedPrice(slide.items[i], state.variants[i] ?? 0),
    0,
  );
}
export function discountedTotalOf(state: BundleState, slide: BundleSlideData): number {
  const sub = subtotalOf(state, slide);
  return allSelected(state, slide) && slide.discount > 0
    ? Math.round(sub * (1 - slide.discount / 100))
    : sub;
}

// ── Markup builders ───────────────────────────────────────────

/** A single product row. `data-idx` lets the client script target it. */
export function itemHtml(state: BundleState, slide: BundleSlideData, i: number): string {
  const item = slide.items[i];
  const off = state.off[i] ?? false;
  const vi = state.variants[i] ?? 0;
  const price = resolvedPrice(item, vi);
  const compareAt = resolvedCompareAt(item, vi);
  const hasVariants = (item.variants?.length ?? 0) > 1 && !item.hasOnlyDefaultVariant;
  const imgSrc = item.variants?.[vi]?.imageUrl ?? item.image;
  const isUnavailable = item.variants?.[vi]?.availableForSale === false;
  const cur = slide.currencyCode;

  const select = hasVariants
    ? `<select class="bundle-item-variant-select">${item
        .variants!.map(
          (v, idx) =>
            `<option value="${idx}"${idx === vi ? ' selected' : ''}${
              v.availableForSale ? '' : ' disabled'
            }>${esc(v.title)}${v.availableForSale ? '' : ' — Sold out'}</option>`,
        )
        .join('')}</select>`
    : '';
  const soldOut = isUnavailable ? '<span class="bundle-item-sold-out">Sold out</span>' : '';
  const compare =
    compareAt !== undefined && compareAt > price
      ? `<span class="bundle-item-compare">${formatMoney(compareAt, cur)}</span>`
      : '';

  return (
    `<div class="bundle-item${off ? ' off' : ''}" data-idx="${i}">` +
    `<span class="bundle-item-check">${CHECK_ITEM}</span>` +
    `<div class="bundle-item-thumb"><img src="${esc(imgSrc)}" alt="${esc(
      item.imageAlt ?? item.name,
    )}"></div>` +
    `<div class="bundle-item-info">` +
    `<div class="bundle-item-name">${esc(item.name)}</div>` +
    `<div class="bundle-item-desc">${esc(item.description)}</div>` +
    `${select}${soldOut}` +
    `</div>` +
    `<div class="bundle-item-price-col">${compare}<span class="bundle-item-price">${formatMoney(
      price,
      cur,
    )}</span></div>` +
    `</div>`
  );
}

/** Inner spans of `.bundle-total` — the `flashing` class restarts the price pulse. */
export function totalInner(state: BundleState, slide: BundleSlideData): string {
  const cur = slide.currencyCode;
  if (noneSelected(state, slide)) {
    return (
      '<span class="bundle-total-was" style="visibility:hidden">&nbsp;</span>' +
      `<span class="bundle-total-now">${formatMoney(0, cur)}</span>` +
      '<span class="bundle-total-save">Select items</span>'
    );
  }
  if (allSelected(state, slide) && slide.discount > 0) {
    return (
      `<span class="bundle-total-was">${formatMoney(subtotalOf(state, slide), cur)}</span>` +
      `<span class="bundle-total-now flashing">${formatMoney(
        discountedTotalOf(state, slide),
        cur,
      )}</span>` +
      `<span class="bundle-total-save">Save ${slide.discount}%</span>`
    );
  }
  return (
    '<span class="bundle-total-was" style="visibility:hidden">&nbsp;</span>' +
    `<span class="bundle-total-now flashing">${formatMoney(subtotalOf(state, slide), cur)}</span>` +
    `<span class="bundle-total-save">${selectedIndices(state, slide).length} of ${
      slide.items.length
    } items</span>`
  );
}

export function ctaLabel(state: BundleState, slide: BundleSlideData): string {
  if (state.addSuccess) return 'Added to cart';
  if (noneSelected(state, slide)) return 'Select items';
  if (allSelected(state, slide)) return slide.ctaText ?? 'Add Setup to cart';
  const n = selectedIndices(state, slide).length;
  return `Add ${n} item${n === 1 ? '' : 's'} to cart`;
}

/** Inner content of the add-to-cart button. */
export function ctaInner(state: BundleState, slide: BundleSlideData): string {
  if (state.adding) {
    return '<span style="letter-spacing:0.2em;opacity:0.7">•&thinsp;•&thinsp;•</span>';
  }
  if (state.addSuccess) return `${CHECK_CTA} Added to cart`;
  return `${esc(ctaLabel(state, slide))} ${ARROW_CTA}`;
}

/** Slide counter + next arrow (only rendered when there is more than one slide). */
export function navControlsHtml(state: BundleState, total: number): string {
  return (
    '<div class="bundle-nav-controls">' +
    `<span class="bundle-nav-counter">${pad(state.cur + 1)} — ${pad(total)}</span>` +
    `<button class="bundle-nav-arrow" aria-label="Next setup">${ARROW_NAV}</button>` +
    '</div>'
  );
}

/** Full inner markup of `.bundle-content` for the current slide/state. */
export function contentInner(state: BundleState, slides: BundleSlideData[]): string {
  const slide = slides[state.cur];
  const total = slides.length;
  const none = noneSelected(state, slide);
  return (
    `<span class="label">${esc(slide.label)}</span>` +
    // Title is config-controlled and may contain <em> — rendered raw, like the React island.
    `<h2 class="bundle-title">${slide.title}</h2>` +
    `<p class="bundle-intro">${esc(slide.intro)}</p>` +
    `<div class="bundle-items">${slide.items.map((_, i) => itemHtml(state, slide, i)).join('')}</div>` +
    `<div class="bundle-total">${totalInner(state, slide)}</div>` +
    '<div class="bundle-nav-row">' +
    `<button class="btn-primary"${
      none ? ' disabled style="opacity:0.45;pointer-events:none"' : ''
    }>${ctaInner(state, slide)}</button>` +
    `${total > 1 ? navControlsHtml(state, total) : ''}` +
    '</div>'
  );
}
