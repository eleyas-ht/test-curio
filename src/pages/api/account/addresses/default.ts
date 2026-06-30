// POST /api/account/addresses/default — set a customer's default address
// Expects hidden field `addressId` (Shopify GID) in the form body
import type { APIRoute } from 'astro';
import {
  createCustomerClient,
  DEFAULT_ADDRESS_UPDATE_MUTATION,
  getPublicOrigin,
  NotAuthenticatedError,
} from '~/lib/shopify/customer';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const client = createCustomerClient(cookies, getPublicOrigin(request, url));

  if (!client.isLoggedIn()) {
    return redirect('/account/login?return_to=/account/addresses', 302);
  }

  let addressId: string;
  try {
    const body = await request.formData();
    addressId = String(body.get('addressId') ?? '').trim();
  } catch {
    return redirect('/account/addresses', 302);
  }

  if (!addressId.startsWith('gid://shopify/')) {
    return redirect('/account/addresses', 302);
  }

  try {
    const result = await client.query<{
      customerDefaultAddressUpdate: {
        customer: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(DEFAULT_ADDRESS_UPDATE_MUTATION, { addressId });

    const userErrors = result.customerDefaultAddressUpdate?.userErrors ?? [];
    if (userErrors.length > 0) {
      const msg = userErrors.map((e) => e.message).join('; ');
      return redirect(`/account/addresses?error=${encodeURIComponent(msg)}`, 302);
    }

    return redirect('/account/addresses?success=default', 302);
  } catch (err) {
    if (err instanceof NotAuthenticatedError) {
      return redirect('/account/login?return_to=/account/addresses', 302);
    }
    const msg = (err as Error).message;
    return redirect(`/account/addresses?error=${encodeURIComponent(msg)}`, 302);
  }
};
