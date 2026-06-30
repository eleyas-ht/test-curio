// POST /api/account/addresses/add — create a new customer address
// Redirects to /account/addresses?success=added on success
import type { APIRoute } from 'astro';
import {
  createCustomerClient,
  ADDRESS_CREATE_MUTATION,
  getPublicOrigin,
  NotAuthenticatedError,
} from '~/lib/shopify/customer';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const client = createCustomerClient(cookies, getPublicOrigin(request, url));

  if (!client.isLoggedIn()) {
    return redirect('/account/login?return_to=/account/addresses', 302);
  }

  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return redirect('/account/addresses/new?error=Invalid+request', 302);
  }

  // CustomerAddressInput (Customer Account API) uses countryCode (CountryCode enum),
  // zoneCode, and phoneNumber — NOT country/province/phone.
  const address = {
    firstName: String(body.get('firstName') ?? '').trim() || undefined,
    lastName: String(body.get('lastName') ?? '').trim() || undefined,
    company: String(body.get('company') ?? '').trim() || undefined,
    address1: String(body.get('address1') ?? '').trim() || undefined,
    address2: String(body.get('address2') ?? '').trim() || undefined,
    city: String(body.get('city') ?? '').trim() || undefined,
    zoneCode: String(body.get('zoneCode') ?? '').trim() || undefined,
    countryCode: String(body.get('countryCode') ?? '').trim() || undefined,
    zip: String(body.get('zip') ?? '').trim() || undefined,
    phoneNumber: String(body.get('phoneNumber') ?? '').trim() || undefined,
  };

  const defaultAddress = body.get('defaultAddress') === 'true';

  if (!address.address1 || !address.city || !address.countryCode || !address.zip) {
    return redirect('/account/addresses/new?error=Please+fill+in+all+required+fields', 302);
  }

  try {
    const result = await client.query<{
      customerAddressCreate: {
        customerAddress: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(ADDRESS_CREATE_MUTATION, { address, defaultAddress });

    const userErrors = result.customerAddressCreate?.userErrors ?? [];
    if (userErrors.length > 0) {
      const msg = userErrors.map((e) => e.message).join('; ');
      return redirect(`/account/addresses/new?error=${encodeURIComponent(msg)}`, 302);
    }

    return redirect('/account/addresses?success=added', 302);
  } catch (err) {
    if (err instanceof NotAuthenticatedError) {
      return redirect('/account/login?return_to=/account/addresses', 302);
    }
    const msg = (err as Error).message;
    return redirect(`/account/addresses/new?error=${encodeURIComponent(msg)}`, 302);
  }
};
