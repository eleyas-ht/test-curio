// ============================================================
//  Localization GraphQL (Storefront API) — resolve the buyer's
//  active Shopify Markets currency, driven by @inContext(country)
//  exactly like every priced query on the site.
// ============================================================
export const LOCALIZATION_QUERY = /* GraphQL */ `
  query Localization($country: CountryCode) @inContext(country: $country) {
    localization {
      country {
        currency {
          isoCode
        }
      }
    }
  }
`;
