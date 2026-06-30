// ============================================================
//  CartDrawer — slide-over cart. Mounted once, globally.
//  Reads the shared nanostore so it stays in sync with the
//  header badge and every add-to-cart button on the page.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useFocusTrap } from './useFocusTrap';
import {
  $cart,
  $cartOpen,
  $cartBusy,
  $busyLines,
  $cartError,
  closeCart,
  updateItem,
  removeItem,
  checkout,
} from '~/stores/cart';
import type { CartLine } from '~/lib/shopify/types';
import { formatMoney } from '~/lib/utils';
import { SITE } from '~/config/site';
import QuantityStepper from './QuantityStepper';
import Spinner from './Spinner';

export default function CartDrawer() {
  const cart = useStore($cart);
  const open = useStore($cartOpen);
  const busy = useStore($cartBusy);
  const error = useStore($cartError);
  // Focus trap moves focus into the panel on open and restores it on close.
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const lines = cart?.lines ?? [];
  const currency = cart?.cost?.subtotalAmount?.currencyCode ?? 'USD';
  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);

  // Sum every per-line discount so we can display total savings.
  // Priority: real discountAllocations from Shopify (when a valid discount code exists).
  // Fallback: _bundleDiscount attribute stamped on the line at add-to-cart time.
  const totalDiscount = lines.reduce((sum, line) => {
    const allocDiscount = (line.discountAllocations ?? []).reduce(
      (s, a) => s + Number(a.discountedAmount.amount),
      0,
    );
    if (allocDiscount > 0) return sum + allocDiscount;
    const attrPct = Number(
      (line.attributes ?? []).find((a) => a.key === '_bundleDiscount')?.value ?? '0',
    );
    if (attrPct > 0) {
      return sum + Math.round(Number(line.cost.totalAmount.amount) * attrPct) / 100;
    }
    return sum;
  }, 0);

  const appliedCodes = (cart?.discountCodes ?? []).filter((d) => d.applicable);

  const threshold = SITE.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col bg-snow shadow-2xl outline-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold tracking-tight">Cart</h2>
            <span className="font-mono text-xs text-mist">
              {String(cart?.totalQuantity ?? 0).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid h-10 w-10 place-items-center rounded-md text-ink transition-fluid hover:bg-ink/[0.06]"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </header>

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            {/* Free-shipping progress */}
            <div className="border-b border-line px-5 py-3">
              {remaining > 0 ? (
                <p className="text-[0.8125rem] text-graphite">
                  You're{' '}
                  <span className="font-mono font-medium text-ink tabular">
                    {formatMoney(remaining, currency)}
                  </span>{' '}
                  from free shipping.
                </p>
              ) : (
                <p className="text-[0.8125rem] font-medium text-success">
                  Free freight unlocked — nice line.
                </p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-fog">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Lines */}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <CartLineRow key={line.id} line={line} currency={currency} />
              ))}
            </ul>

            {/* Footer */}
            <footer className="border-t border-line bg-paper px-5 py-4">
              {error && (
                <p className="mb-3 rounded-md bg-accent-soft px-3 py-2 text-xs text-accent-strong" role="alert">
                  {error}
                </p>
              )}

              {/* Applied discount code badges */}
              {appliedCodes.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {appliedCodes.map((d) => (
                    <span
                      key={d.code}
                      className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-success"
                    >
                      <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5">
                        <path fillRule="evenodd" d="M10.22 3.22a.75.75 0 0 1 0 1.06L5.06 9.44a.75.75 0 0 1-1.06 0L1.28 6.72a.75.75 0 0 1 1.06-1.06L4.53 7.85l4.63-4.63a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"/>
                      </svg>
                      {d.code}
                    </span>
                  ))}
                </div>
              )}

              {/* Original subtotal */}
              <div className="mb-1 flex items-baseline justify-between">
                <span className="eyebrow text-graphite">Subtotal</span>
                <span className={`font-mono text-lg font-medium tabular ${totalDiscount > 0 ? 'text-mist line-through' : ''}`}>
                  {formatMoney(subtotal, currency)}
                </span>
              </div>

              {/* Savings row — only shown when a discount is active */}
              {totalDiscount > 0 && (
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="eyebrow text-success">You save</span>
                  <span className="font-mono text-lg font-semibold tabular text-success">
                    −{formatMoney(totalDiscount, currency)}
                  </span>
                </div>
              )}

              {/* Discounted total */}
              {totalDiscount > 0 && (
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="eyebrow text-ink">Total</span>
                  <span className="font-mono text-lg font-bold tabular text-ink">
                    {formatMoney(subtotal - totalDiscount, currency)}
                  </span>
                </div>
              )}

              <p className="mb-4 text-xs text-mist">
                Taxes and shipping calculated at checkout.
              </p>
              <button
                type="button"
                onClick={checkout}
                disabled={busy}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-cocoa text-base font-medium text-cream transition-fluid hover:bg-clay disabled:opacity-60"
              >
                {busy ? <Spinner size={20} /> : (
                  <>
                    Checkout
                    <ArrowRight size={18} strokeWidth={1.8} />
                  </>
                )}
              </button>
              <a
                href="/cart"
                onClick={closeCart}
                className="mt-2 flex h-10 w-full items-center justify-center text-sm text-graphite underline-offset-4 transition-fluid hover:text-clay hover:underline"
              >
                View full cart
              </a>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function CartLineRow({ line, currency }: { line: CartLine; currency: string }) {
  const busyLines = useStore($busyLines);
  const busy = !!busyLines[line.id];
  const m = line.merchandise;
  const image = m.image ?? m.product?.featuredImage ?? null;
  const optionText = m.selectedOptions
    .filter((o) => o.value !== 'Default Title')
    .map((o) => o.value)
    .join(' · ');

  // Per-line discount: prefer Shopify's discountAllocations (valid discount code),
  // fall back to _bundleDiscount attribute stamped at add-to-cart time.
  const originalLineTotal = Number(line.cost.totalAmount.amount);
  const allocDiscount = (line.discountAllocations ?? []).reduce(
    (s, a) => s + Number(a.discountedAmount.amount),
    0,
  );
  const attrPct = Number(
    (line.attributes ?? []).find((a) => a.key === '_bundleDiscount')?.value ?? '0',
  );
  const lineDiscount =
    allocDiscount > 0
      ? allocDiscount
      : attrPct > 0
        ? Math.round(originalLineTotal * attrPct) / 100
        : 0;
  const effectiveLineTotal = originalLineTotal - lineDiscount;

  return (
    <li className="flex gap-4 py-4">
      <a
        href={`/products/${m.product.handle}`}
        onClick={closeCart}
        className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-paper"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? m.product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-snow/60 text-ink">
            <Spinner size={18} />
          </span>
        )}
      </a>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <a
            href={`/products/${m.product.handle}`}
            onClick={closeCart}
            className="text-sm font-medium leading-snug text-ink hover:text-accent-strong"
          >
            {m.product.title}
          </a>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            disabled={busy}
            className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded text-mist transition-fluid hover:text-danger disabled:opacity-40"
            aria-label={`Remove ${m.product.title}`}
          >
            <Trash2 size={15} strokeWidth={1.6} />
          </button>
        </div>

        {optionText && <p className="mt-0.5 font-mono text-[0.7rem] text-mist">{optionText}</p>}

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => updateItem(line.id, q)}
            disabled={busy}
            size="sm"
            min={1}
            ariaLabel={`Quantity for ${m.product.title}`}
          />
          <div className="flex items-baseline gap-1.5">
            {lineDiscount > 0 && (
              <span className="font-mono text-xs tabular text-mist line-through">
                {formatMoney(originalLineTotal, currency)}
              </span>
            )}
            <span className={`font-mono text-sm font-medium tabular${lineDiscount > 0 ? ' text-success' : ''}`}>
              {formatMoney(lineDiscount > 0 ? effectiveLineTotal : originalLineTotal, currency)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-full border border-line text-mist">
        <ShoppingBag size={26} strokeWidth={1.4} />
      </span>
      <p className="text-lg font-bold tracking-tight">Your bag is empty</p>
      <p className="mt-1 text-sm text-graphite">Nothing in here yet — let's change that.</p>
      <a
        href="/products"
        onClick={closeCart}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-medium text-snow transition-fluid hover:bg-graphite"
      >
        Shop all products
        <ArrowRight size={17} strokeWidth={1.8} />
      </a>
    </div>
  );
}
