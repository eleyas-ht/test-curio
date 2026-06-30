// ============================================================
//  Footer Configuration
//
//  FOOTER_SOURCE controls where the footer menu columns come from:
//
//    'shopify'  — fetch the "footer" menu from Shopify Admin →
//                 Online Store → Navigation.
//                 Structure: top-level items become column headings;
//                 their child items become the links in that column.
//                 Example Shopify menu structure:
//                   Shop
//                     ├── All products   → /products
//                     ├── New arrivals   → /products?sort=newest
//                     └── Sale           → /collections/sale
//                   Help
//                     ├── Shipping       → /pages/shipping
//                     └── Returns        → /pages/returns
//                 Falls back to CUSTOM_FOOTER_COLUMNS on API error.
//
//    'custom'   — always use CUSTOM_FOOTER_COLUMNS below, even
//                 when Shopify is configured. Edit items here.
//
//  Change this one value to switch between sources:
// ============================================================

export type FooterSource = 'shopify' | 'custom';

export const FOOTER_SOURCE: FooterSource = 'custom';

// ============================================================
//  FooterColumn — one column of links in the footer grid.
// ============================================================

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// ============================================================
//  CUSTOM_FOOTER_COLUMNS
//
//  Managed here when FOOTER_SOURCE = 'custom', or used as the
//  fallback when the Shopify "footer" menu cannot be fetched.
//
//  Edit titles and links freely. Supported href types:
//    /products               → all products
//    /products?sort=newest   → filtered product list
//    /collections/handle     → a collection
//    /pages/handle           → a CMS page
//    /blogs/journal          → a blog index
//    https://example.com     → external link (opens normally)
// ============================================================

export const CUSTOM_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/products' },
      { label: 'New arrivals', href: '/products?sort=newest' },
      { label: "Editor's picks", href: '/collections' },
      { label: 'Bundles', href: '/products' },
      { label: 'Sale', href: '/collections/sale' },
    ],
  },
  {
    title: 'Read',
    links: [
      { label: 'The Edit', href: '/pages/the-edit' },
      { label: 'Buying guides', href: '/pages/buying-guides' },
      { label: 'Journal', href: '/blogs/news/' },
      { label: 'Lookbook', href: '/pages/lookbook' },
      { label: "Editor's Letter", href: '/pages/editors-letter' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping', href: '/pages/shipping' },
      { label: 'Returns', href: '/pages/returns' },
      { label: 'Warranty', href: '/pages/warranty' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our editors', href: '/about' },
      { label: 'Sustainability', href: '/pages/sustainability' },
      { label: 'Press', href: '/pages/press' },
      { label: 'Careers', href: '/pages/careers' },
    ],
  },
];
