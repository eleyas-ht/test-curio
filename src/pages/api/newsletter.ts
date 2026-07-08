// ============================================================
//  POST /api/newsletter — { email }
//  Provider is selected in src/config/newsletter.ts.
//  Supported: 'shopify' | 'klaviyo' | 'mailchimp' | 'webhook'
// ============================================================
import type { APIRoute } from 'astro';
import { NEWSLETTER } from '~/config/newsletter';

export const prerender = false;

// ── Helpers ───────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function env(key: string): string | undefined {
  const meta = (import.meta.env as Record<string, string | undefined>)[key];
  if (meta) return meta;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

// ── Provider: Shopify Admin API ───────────────────────────────
//
// Creates a Customer with email marketing consent via the Admin
// API GraphQL endpoint. If the email already belongs to an
// existing customer, their marketing consent is updated instead.
//
// Required env var: SHOPIFY_ADMIN_API_TOKEN
//   Shopify Admin → Settings → Apps → Develop apps → Create app
//   → Admin API scopes: write_customers, read_customers → Install

interface AdminGqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface UserError {
  field: string[] | null;
  message: string;
}

async function adminGql<T>(
  domain: string,
  version: string,
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Shopify Admin API ${res.status}: ${text}`);
  }

  const body = (await res.json()) as AdminGqlResponse<T>;
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '));
  if (!body.data) throw new Error('Empty response from Shopify Admin API');
  return body.data;
}

const MARKETING_CONSENT = {
  marketingState: 'SUBSCRIBED',
  marketingOptInLevel: 'SINGLE_OPT_IN',
} as const;

async function subscribeViaShopify(email: string): Promise<void> {
  const token = env('SHOPIFY_ADMIN_API_TOKEN');
  const domain = env('SHOPIFY_SHOP_DOMAIN');
  const version = env('SHOPIFY_API_VERSION') ?? '2026-04';

  if (!token || !domain) {
    throw new Error(
      'Shopify provider requires SHOPIFY_ADMIN_API_TOKEN in .env. ' +
      'See src/config/newsletter.ts for setup instructions.',
    );
  }

  // ── Step 1: create new customer with marketing consent ────────
  // NOTE: customerCreate returns UserError (not CustomerUserError), which
  // exposes only `field` and `message` — there is no `code` field. Selecting
  // `code` here makes Shopify reject the whole query, so duplicate emails are
  // detected from the message text below instead.
  const CREATE_MUTATION = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer { id }
        userErrors { field message }
      }
    }
  `;

  interface CreateResult {
    customerCreate: { customer: { id: string } | null; userErrors: UserError[] };
  }

  const createData = await adminGql<CreateResult>(domain, version, token, CREATE_MUTATION, {
    input: { email, emailMarketingConsent: MARKETING_CONSENT },
  });

  const { customer, userErrors } = createData.customerCreate;

  // Success — new customer created.
  if (customer) return;

  // Check whether the email is already taken by an existing customer.
  // customerCreate's UserError has no `code`, so match on field + message
  // (e.g. "Email has already been taken").
  const emailTaken = userErrors.some(
    (e) => e.field?.includes('email') && /taken|exist/i.test(e.message),
  );

  if (!emailTaken) {
    // A real validation error (not a duplicate) — surface it.
    throw new Error(userErrors[0]?.message ?? 'Customer creation failed.');
  }

  // ── Step 2: find the existing customer by email ───────────────
  const SEARCH_QUERY = `
    query findCustomer($q: String!) {
      customers(first: 1, query: $q) {
        edges { node { id } }
      }
    }
  `;

  interface SearchResult {
    customers: { edges: Array<{ node: { id: string } }> };
  }

  const searchData = await adminGql<SearchResult>(domain, version, token, SEARCH_QUERY, {
    q: `email:${email}`,
  });

  const existingId = searchData.customers.edges[0]?.node?.id;

  // Email exists but we can't find the customer — still treat as success.
  if (!existingId) return;

  // ── Step 3: update their marketing consent ────────────────────
  const UPDATE_MUTATION = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        userErrors { field message }
      }
    }
  `;

  interface UpdateResult {
    customerUpdate: { userErrors: UserError[] };
  }

  const updateData = await adminGql<UpdateResult>(domain, version, token, UPDATE_MUTATION, {
    input: { id: existingId, emailMarketingConsent: MARKETING_CONSENT },
  });

  const updateErrors = updateData.customerUpdate.userErrors;
  if (updateErrors.length > 0) {
    throw new Error(updateErrors[0].message);
  }
}

// ── Provider: Klaviyo ─────────────────────────────────────────
// Requires: KLAVIYO_API_KEY, KLAVIYO_LIST_ID

async function subscribeViaKlaviyo(email: string): Promise<void> {
  const apiKey = env('KLAVIYO_API_KEY');
  const listId = env('KLAVIYO_LIST_ID');
  if (!apiKey || !listId) throw new Error('Klaviyo is not configured (missing KLAVIYO_API_KEY or KLAVIYO_LIST_ID).');

  const headers = {
    accept: 'application/json',
    revision: '2024-02-15',
    'content-type': 'application/json',
    Authorization: `Klaviyo-API-Key ${apiKey}`,
  };

  // Step 1 — create / update the profile.
  const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email,
          subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
        },
      },
    }),
  });

  if (!profileRes.ok && profileRes.status !== 409) {
    const text = await profileRes.text().catch(() => '');
    throw new Error(`Klaviyo profile error ${profileRes.status}: ${text}`);
  }

  let profileId: string | undefined;
  if (profileRes.status === 201) {
    const body = (await profileRes.json()) as { data?: { id?: string } };
    profileId = body.data?.id;
  } else {
    const body = (await profileRes.json()) as {
      errors?: Array<{ meta?: { duplicate_profile_id?: string } }>;
    };
    profileId = body.errors?.[0]?.meta?.duplicate_profile_id;
  }

  if (!profileId) throw new Error('Could not resolve Klaviyo profile id.');

  // Step 2 — add the profile to the list.
  const listRes = await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: [{ type: 'profile', id: profileId }] }),
  });

  if (!listRes.ok && listRes.status !== 204 && listRes.status !== 200) {
    const text = await listRes.text().catch(() => '');
    throw new Error(`Klaviyo list error ${listRes.status}: ${text}`);
  }
}

// ── Provider: Mailchimp ───────────────────────────────────────
// Requires: MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_DC

async function subscribeViaMailchimp(email: string): Promise<void> {
  const apiKey    = env('MAILCHIMP_API_KEY');
  const audienceId = env('MAILCHIMP_AUDIENCE_ID');
  const dc        = env('MAILCHIMP_DC');
  if (!apiKey || !audienceId || !dc) throw new Error('Mailchimp is not configured (missing env vars).');

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    },
    body: JSON.stringify({ email_address: email, status: 'subscribed' }),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { title?: string; detail?: string };
    if (body.title === 'Member Exists') return;
    throw new Error(body.detail ?? body.title ?? 'Mailchimp error.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mailchimp error ${res.status}: ${text}`);
  }
}

// ── Provider: Webhook ─────────────────────────────────────────
// Requires: NEWSLETTER_WEBHOOK_URL
// Optional: NEWSLETTER_WEBHOOK_SECRET (sent as Authorization: Bearer <secret>)

async function subscribeViaWebhook(email: string): Promise<void> {
  const url = env('NEWSLETTER_WEBHOOK_URL');
  if (!url) throw new Error('Webhook provider is not configured (missing NEWSLETTER_WEBHOOK_URL).');

  const secret = env('NEWSLETTER_WEBHOOK_SECRET');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Webhook error ${res.status}: ${text}`);
  }
}

// ── Main handler ──────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String((body as { email?: string })?.email ?? '').trim();

    if (!EMAIL_RE.test(email)) {
      return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
    }

    switch (NEWSLETTER.provider) {
      case 'shopify':
        await subscribeViaShopify(email);
        console.info('[newsletter] shopify customer subscribed:', email);
        break;
      case 'klaviyo':
        await subscribeViaKlaviyo(email);
        console.info('[newsletter] klaviyo subscribed:', email);
        break;
      case 'mailchimp':
        await subscribeViaMailchimp(email);
        console.info('[newsletter] mailchimp subscribed:', email);
        break;
      case 'webhook':
        await subscribeViaWebhook(email);
        console.info('[newsletter] webhook subscribed:', email);
        break;
      default: {
        const _: never = NEWSLETTER.provider;
        return json({ ok: false, error: 'Unknown newsletter provider.' }, 500);
      }
    }

    return json({ ok: true });
  } catch (err) {
    console.error('[newsletter] error:', err);
    return json({ ok: false, error: 'Something went wrong. Please try again.' }, 500);
  }
};
