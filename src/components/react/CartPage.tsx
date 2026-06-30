// ============================================================
//  CartPage — full editorial cart, bound to the shared nanostore
//  ($cart). Free-shipping progress, line items with qty/remove,
//  order summary, and checkout handoff to Shopify's hosted page.
//  Stays in sync with the header badge + drawer (same store).
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Minus, Plus, X, Lock, ArrowRight } from 'lucide-react';
import { $cart, $busyLines, initCart, updateItem, removeItem, checkout } from '~/stores/cart';
import { formatMoney } from '~/lib/utils';
import { SITE } from '~/config/site';

export default function CartPage() {
  const cart = useStore($cart);
  const busyLines = useStore($busyLines);

  useEffect(() => {
    void initCart();
  }, []);

  const lines = cart?.lines ?? [];
  const currency = cart?.cost?.subtotalAmount?.currencyCode ?? 'USD';
  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);
  const total = Number(cart?.cost?.totalAmount?.amount ?? subtotal);

  // Free-shipping progress.
  const threshold = SITE.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, threshold > 0 ? (subtotal / threshold) * 100 : 100);

  // Empty cart.
  if (cart && lines.length === 0) {
    return (
      <div className="wrap flex flex-col items-center py-28 text-center">
        <p className="ed-label is-center justify-center text-clay">Your cart</p>
        <h1 className="masthead mt-4 text-[clamp(2rem,4vw,3rem)]">Nothing here yet.</h1>
        <p className="mt-3 max-w-sm text-muted">
          Your cart is empty. Explore the edit and find something worth keeping.
        </p>
        <a
          href="/products"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-cocoa px-7 text-sm font-medium text-cream transition-fluid hover:bg-clay"
        >
          Browse the catalogue
          <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  // Loading skeleton (cart not yet hydrated).
  if (!cart) {
    return (
      <div className="wrap py-20">
        <div className="h-8 w-40 animate-pulse rounded bg-sand" />
        <div className="mt-8 grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-md bg-sand/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wrap py-10 md:py-14">
      <div className="flex items-end justify-between gap-6">
        <div>
          <span className="ed-label text-clay">Your cart</span>
          <h1 className="masthead mt-4 text-[clamp(2rem,4vw,3rem)]">
            The bag <em>({cart.totalQuantity})</em>.
          </h1>
        </div>
        <a href="/products" className="hidden text-sm text-muted transition-fluid hover:text-clay sm:inline">
          ← Continue shopping
        </a>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Lines */}
        <div>
          {/* Free shipping progress */}
          <div className="rounded-md border border-sand-deep bg-warm-white p-5">
            <p className="text-sm text-ink">
              {remaining > 0 ? (
                <>
                  Add <strong className="font-semibold">{formatMoney(remaining, currency)}</strong> more for{' '}
                  <strong className="font-semibold">free express shipping</strong>.
                </>
              ) : (
                <strong className="font-semibold text-clay-deep">You've unlocked free express shipping ✓</strong>
              )}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-clay transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* List head */}
          <div className="mt-8 hidden grid-cols-[1fr_auto_auto] gap-6 border-b border-sand-deep pb-3 sm:grid">
            <span className="ed-label !gap-2 before:w-3">Product</span>
            <span className="ed-label !gap-2 before:hidden">Quantity</span>
            <span className="ed-label !gap-2 before:hidden text-right">Total</span>
          </div>

          <ul>
            {lines.map((line) => {
              const busy = busyLines[line.id];
              const img = line.merchandise.image ?? line.merchandise.product.featuredImage;
              const optionLabel = line.merchandise.selectedOptions
                .filter((o) => o.value !== 'Default Title')
                .map((o) => o.value)
                .join(' · ');
              return (
                <li
                  key={line.id}
                  className={`grid grid-cols-[auto_1fr] items-center gap-5 border-b border-sand-deep/60 py-6 sm:grid-cols-[auto_1fr_auto_auto] ${busy ? 'opacity-60' : ''}`}
                >
                  <a href={`/products/${line.merchandise.product.handle}`} className="block h-24 w-20 shrink-0 overflow-hidden rounded-md border border-sand-deep bg-warm-white">
                    {img && <img src={img.url} alt={img.altText ?? line.merchandise.product.title} className="h-full w-full object-cover" />}
                  </a>

                  <div className="min-w-0">
                    <a href={`/products/${line.merchandise.product.handle}`} className="font-serif text-lg text-ink transition-fluid hover:text-clay">
                      {line.merchandise.product.title}
                    </a>
                    {optionLabel && <p className="mt-0.5 text-xs text-muted">{optionLabel}</p>}
                    <p className="mt-1 text-sm text-muted-light">{formatMoney(line.merchandise.price.amount, currency)} each</p>
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted underline-offset-4 transition-fluid hover:text-danger hover:underline sm:hidden"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>

                  {/* Quantity */}
                  <div className="col-start-2 row-start-2 flex items-center rounded-md border border-sand-deep sm:col-auto sm:row-auto">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={busy}
                      onClick={() => updateItem(line.id, line.quantity - 1)}
                      className="grid h-10 w-10 place-items-center text-ink transition-fluid hover:text-clay disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center text-sm tabular">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={busy}
                      onClick={() => updateItem(line.id, line.quantity + 1)}
                      className="grid h-10 w-10 place-items-center text-ink transition-fluid hover:text-clay disabled:opacity-40"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Line total + remove (desktop) */}
                  <div className="col-start-2 row-start-2 flex items-center justify-end gap-4 sm:col-auto sm:row-auto">
                    <span className="text-sm font-semibold tabular text-ink">
                      {formatMoney(line.cost.totalAmount.amount, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      aria-label="Remove item"
                      className="hidden text-muted-light transition-fluid hover:text-danger sm:inline-flex"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-md border border-sand-deep bg-warm-white p-6">
            <h2 className="font-serif text-xl text-ink">Order summary</h2>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular text-ink">{formatMoney(subtotal, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-muted-light">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between border-t border-sand-deep pt-3">
                <dt className="font-serif text-lg text-ink">Total</dt>
                <dd className="font-serif text-lg tabular text-ink">{formatMoney(total, currency)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={checkout}
              className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-md bg-cocoa text-sm font-medium text-cream transition-fluid hover:bg-clay"
            >
              <Lock size={15} />
              Checkout securely
            </button>
            <p className="mt-3 text-center text-xs text-muted-light">
              Taxes & shipping calculated at checkout · Secure, encrypted payment
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
