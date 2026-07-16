// ============================================================
//  Localization service — the buyer's active currency code
// ============================================================
import { shopifyFetch, type ShopifyFetchOptions } from '../client';
import { LOCALIZATION_QUERY } from '../graphql/localization';

interface LocalizationResult {
  localization: { country: { currency: { isoCode: string } | null } | null } | null;
}

/**
 * Resolve the ISO currency code Shopify Markets uses for the buyer's country
 * (e.g. 'USD', 'EUR', 'BDT'). Lets sections that make no product fetch of their
 * own — such as the Showcase in `custom` mode — still price in the visitor's
 * live currency. Returns null when localization can't be resolved so callers
 * can fall back to a sensible default (usually 'USD').
 */
export async function getBuyerCurrency(
  opts: ShopifyFetchOptions = {},
): Promise<string | null> {
  const data = await shopifyFetch<LocalizationResult>(LOCALIZATION_QUERY, {}, opts);
  return data.localization?.country?.currency?.isoCode ?? null;
}
