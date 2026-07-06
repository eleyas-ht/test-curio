// ============================================================
//  Shopify Storefront API client (server-side, private token)
// ============================================================
// All Shopify traffic flows through here. It is imported only by
// server code (Astro frontmatter + /api routes), so the private
// token never reaches the browser.

/** Read an env var from build-time inline (dev) or runtime process.env (prod node). */
function env(key: string): string | undefined {
  const meta = (import.meta.env as Record<string, string | undefined>)[key];
  if (meta) return meta;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

const DOMAIN = env('SHOPIFY_SHOP_DOMAIN');
const VERSION = env('SHOPIFY_API_VERSION') ?? '2026-04';
const TOKEN = env('SHOPIFY_STOREFRONT_PRIVATE_TOKEN');

const ENDPOINT = `https://${DOMAIN}/api/${VERSION}/graphql.json`;

export class ShopifyError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ShopifyError';
    this.status = status;
    this.details = details;
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface ShopifyFetchOptions {
  /** Real buyer IP — forwarded so Shopify's bot rate-limiting attributes correctly. */
  buyerIp?: string;
  /**
   * ISO 3166-1 alpha-2 country code, merged into the request's GraphQL
   * variables as `$country`. Queries/mutations that declare `$country`
   * and apply `@inContext(country: $country)` resolve Shopify Markets
   * pricing/currency for that country; operations that don't declare
   * the variable simply ignore the extra key.
   */
  country?: string;
}

/** Per-attempt request timeout + transient-failure retry policy. */
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Execute a Storefront GraphQL operation. Resilient to transient
 * failures: retries (with backoff) on network errors, request
 * timeouts, HTTP 429, and HTTP 5xx. Throws ShopifyError on
 * non-transient transport errors, GraphQL errors, or after the
 * retries are exhausted; otherwise returns the typed `data`.
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: ShopifyFetchOptions = {},
): Promise<T> {
  if (!DOMAIN || !TOKEN) {
    throw new ShopifyError(
      'Missing Shopify config. Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN in .env',
    );
  }

  let lastError: ShopifyError | null = null;
  const requestVariables = options.country ? { ...variables, country: options.country } : variables;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Per-attempt timeout so a hung connection doesn't block the page.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Shopify-Storefront-Private-Token': TOKEN,
          ...(options.buyerIp ? { 'Shopify-Storefront-Buyer-IP': options.buyerIp } : {}),
        },
        body: JSON.stringify({ query, variables: requestVariables }),
        signal: controller.signal,
      });
    } catch (cause) {
      // Network failure or timeout (AbortError) — transient, so retry.
      clearTimeout(timer);
      const aborted = (cause as { name?: string })?.name === 'AbortError';
      lastError = new ShopifyError(
        aborted ? 'Shopify request timed out' : 'Network error talking to Shopify',
        undefined,
        cause,
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(250 * attempt + Math.floor(Math.random() * 150));
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
    }

    // Retry throttling (429) and server errors (5xx); fail fast on 4xx.
    if (res.status === 429 || res.status >= 500) {
      lastError = new ShopifyError(`Shopify HTTP ${res.status} ${res.statusText}`, res.status);
      if (attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(res.headers.get('retry-after')) * 1000;
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 350 * attempt);
        continue;
      }
      throw lastError;
    }

    let json: GraphQLResponse<T>;
    try {
      json = (await res.json()) as GraphQLResponse<T>;
    } catch (cause) {
      throw new ShopifyError(`Invalid JSON from Shopify (HTTP ${res.status})`, res.status, cause);
    }

    if (!res.ok) {
      throw new ShopifyError(`Shopify HTTP ${res.status} ${res.statusText}`, res.status, json);
    }
    if (json.errors?.length) {
      throw new ShopifyError(json.errors.map((e) => e.message).join('; '), res.status, json.errors);
    }
    if (!json.data) {
      throw new ShopifyError('Empty response from Shopify', res.status);
    }
    return json.data;
  }

  // Unreachable in practice (loop either returns or throws), but satisfies the type checker.
  throw lastError ?? new ShopifyError('Shopify request failed');
}

export const shopifyConfig = { DOMAIN, VERSION, ENDPOINT };
