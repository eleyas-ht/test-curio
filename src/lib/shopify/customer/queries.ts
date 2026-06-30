// ============================================================
//  Customer Account API — GraphQL operations & result types
// ============================================================
// Scoped to what the Customer Account API 2025-01 actually supports.
// The Customer Account API is a DIFFERENT schema from the Storefront
// API — many Storefront fields (subtotalPrice, billingAddress,
// fulfillments, etc.) do NOT exist here.

// ── Overview (dashboard) ────────────────────────────────────

/** Customer name + email + recent orders — minimal stable subset. */
export const CUSTOMER_OVERVIEW_QUERY = /* GraphQL */ `
  query CustomerOverview($first: Int!) {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 4) {
            nodes {
              title
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

/** Phone number + default address — fetched separately so the overview
 *  degrades gracefully if the store's Customer Account plan lacks these fields. */
export const CUSTOMER_PROFILE_QUERY = /* GraphQL */ `
  query CustomerProfile {
    customer {
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        country
        zip
      }
    }
  }
`;

// ── Order list (full) ───────────────────────────────────────

export const CUSTOMER_ORDERS_QUERY = /* GraphQL */ `
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 50) {
            nodes {
              image {
                url
                altText
              }
              title
            }
          }
        }
      }
    }
  }
`;

// ── Order detail ────────────────────────────────────────────
// NOTE: The Customer Account API does NOT expose subtotalPrice,
// totalShippingPrice, totalTax, billingAddress, or fulfillments.
// Only totalPrice and shippingAddress are available at this level.

export const CUSTOMER_ORDER_QUERY = /* GraphQL */ `
  query CustomerOrder($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        country
        zip
      }
      lineItems(first: 50) {
        nodes {
          id
          title
          quantity
          totalPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
          variantTitle
        }
      }
    }
  }
`;

// ── Addresses ───────────────────────────────────────────────

export const CUSTOMER_ADDRESSES_QUERY = /* GraphQL */ `
  query CustomerAddresses($first: Int!) {
    customer {
      defaultAddress {
        id
      }
      addresses(first: $first) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          zoneCode
          territoryCode
        }
      }
    }
  }
`;

// ── Address mutations ───────────────────────────────────────

export const ADDRESS_CREATE_MUTATION = /* GraphQL */ `
  mutation customerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation customerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      addressId: $addressId
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADDRESS_DELETE_MUTATION = /* GraphQL */ `
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

export const DEFAULT_ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation customerDefaultAddressUpdate($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ── Profile mutation ────────────────────────────────────────

export const CUSTOMER_UPDATE_MUTATION = /* GraphQL */ `
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ── TypeScript types ────────────────────────────────────────

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface MailingAddress {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  zip?: string | null;
}

export interface CustomerOrder {
  id: string;
  name: string;
  processedAt: string;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  totalPrice: MoneyV2 | null;
  lineItems?: {
    nodes: Array<{ image: { url: string; altText?: string | null } | null; title: string }>;
  };
}

// Fields limited to what Customer Account API 2025-01 actually returns.
export interface CustomerOrderDetail extends CustomerOrder {
  shippingAddress: MailingAddress | null;
  lineItems: {
    nodes: Array<{
      id: string;
      title: string;
      quantity: number;
      totalPrice: MoneyV2 | null;
      image: { url: string; altText?: string | null } | null;
      variantTitle?: string | null;
    }>;
  };
}

export interface CustomerAddress {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  zip?: string | null;
  zoneCode?: string | null;
  territoryCode?: string | null;
}

export interface CustomerOverview {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      nodes: CustomerOrder[];
    };
  } | null;
}

export interface CustomerProfile {
  customer: {
    phoneNumber?: { phoneNumber: string } | null;
    defaultAddress?: CustomerAddress | null;
  } | null;
}

export interface CustomerAddressesResult {
  customer: {
    defaultAddress: { id: string } | null;
    addresses: { nodes: CustomerAddress[] };
  } | null;
}

export interface CustomerOrderResult {
  order: CustomerOrderDetail | null;
}
