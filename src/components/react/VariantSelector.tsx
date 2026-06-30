// ============================================================
//  VariantSelector — the PDP buy box. Option selection, quantity,
//  Add to cart (ink / primary) and Buy now (accent / express).
//  One island so option + qty state stays consistent.
// ============================================================
import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { ProductOption, ProductVariant } from '~/lib/shopify/types';
import { formatMoney, isOnSale, discountPercent } from '~/lib/utils';
import { addItem, buyNow } from '~/stores/cart';
import QuantityStepper from './QuantityStepper';
import Spinner from './Spinner';

interface Props {
  options: ProductOption[];
  variants: ProductVariant[];
  currencyCode: string;
}

const isDefaultOnly = (options: ProductOption[]) =>
  options.length === 1 &&
  options[0].name === 'Title' &&
  options[0].optionValues.every((v) => v.name === 'Default Title');

function findVariant(variants: ProductVariant[], selected: Record<string, string>) {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value),
  );
}

export default function VariantSelector({ options, variants, currencyCode }: Props) {
  const singleVariant = isDefaultOnly(options) || options.length === 0;

  // Default to the first available variant's options (or the first variant).
  const initial = useMemo(() => {
    const base = variants.find((v) => v.availableForSale) ?? variants[0];
    const map: Record<string, string> = {};
    base?.selectedOptions.forEach((o) => (map[o.name] = o.value));
    return map;
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(initial);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  // No fallback to variants[0]: an unmatched option combo must read
  // as unavailable, never silently add a different variant/price.
  const variant = findVariant(variants, selected);
  const available = variant?.availableForSale ?? false;
  const onSale = isOnSale(variant?.price, variant?.compareAtPrice);
  const off = discountPercent(variant?.price, variant?.compareAtPrice);
  // Real inventory (§4.1) — drives the "Only X left" urgency line.
  const stockLeft = variant?.quantityAvailable ?? null;
  const lowStock = available && stockLeft != null && stockLeft > 0 && stockLeft <= 10;

  // Which option values lead to at least one purchasable variant.
  const valueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.some((o) => o.name === optionName && o.value === value),
    );

  const pick = (name: string, value: string) =>
    setSelected((prev) => ({ ...prev, [name]: value }));

  const handleAdd = async () => {
    if (!variant || !available) return;
    setAdding(true);
    await addItem(variant.id, quantity);
    setAdding(false);
  };

  const handleBuy = async () => {
    if (!variant || !available) return;
    setBuying(true);
    await buyNow(variant.id, quantity);
    // buyNow redirects; if it fails, clear the spinner.
    setBuying(false);
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="font-sans text-3xl font-semibold tabular text-ink">
          {variant ? formatMoney(variant.price.amount, currencyCode) : '—'}
        </span>
        {onSale && variant?.compareAtPrice && (
          <>
            <s className="text-base text-muted-light tabular">
              {formatMoney(variant.compareAtPrice.amount, currencyCode)}
            </s>
            {off != null && (
              <span className="eyebrow rounded-sm bg-clay px-2 py-1 leading-none text-warm-white">
                Save {off}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Real-stock urgency (quantityAvailable) */}
      {lowStock && (
        <p className="-mt-3 flex items-center gap-2 text-sm text-clay-deep">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-clay" />
          Only {stockLeft} left — selling fast
        </p>
      )}

      {/* Options */}
      {!singleVariant &&
        options.map((option) => (
          <fieldset key={option.id} className="border-0 p-0">
            <legend className="eyebrow mb-3 flex w-full items-center justify-between text-graphite">
              <span>{option.name}</span>
              <span className="text-mist normal-case tracking-normal">
                {selected[option.name]}
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((ov) => {
                const active = selected[option.name] === ov.name;
                const possible = valueAvailable(option.name, ov.name);
                return (
                  <button
                    key={ov.id}
                    type="button"
                    onClick={() => pick(option.name, ov.name)}
                    aria-pressed={active}
                    aria-label={!possible && !active ? `${ov.name} (unavailable)` : ov.name}
                    className={[
                      'inline-flex h-11 items-center gap-1.5 rounded-md border px-4 text-sm transition-fluid',
                      active
                        ? 'border-cocoa bg-cocoa text-cream'
                        : 'border-sand-deep bg-warm-white text-ink hover:border-clay',
                      !possible && !active ? 'text-muted-light line-through decoration-1' : '',
                    ].join(' ')}
                  >
                    {active && <Check size={15} strokeWidth={2} />}
                    {ov.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

      {/* Quantity + availability */}
      <div className="flex items-center justify-between">
        <span className="eyebrow text-graphite">Quantity</span>
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={20} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!available || adding || buying}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-cocoa text-base font-medium text-cream transition-fluid hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? <Spinner size={20} /> : available ? `Add to cart${variant ? ` — ${formatMoney(variant.price.amount, currencyCode)}` : ''}` : 'Sold out'}
        </button>
        <button
          type="button"
          onClick={handleBuy}
          disabled={!available || adding || buying}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-md border border-clay bg-clay text-base font-medium text-warm-white transition-fluid hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buying ? <Spinner size={20} /> : 'Buy it now'}
        </button>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <span
          className={`inline-block h-2 w-2 rounded-full ${available ? 'bg-success' : 'bg-muted-light'}`}
        />
        {available ? 'In stock — ships within 48 hours' : 'Currently out of stock'}
      </p>
    </div>
  );
}
