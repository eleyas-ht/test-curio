// POST /api/account/profile — update customer name / phone
// On success redirects to /account/profile?success=updated
// On error redirects to /account/profile?error=<message>
import type { APIRoute } from 'astro';
import {
  createCustomerClient,
  CUSTOMER_UPDATE_MUTATION,
  getPublicOrigin,
  NotAuthenticatedError,
} from '~/lib/shopify/customer';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const client = createCustomerClient(cookies, getPublicOrigin(request, url));

  if (!client.isLoggedIn()) {
    return redirect('/account/login?return_to=/account/profile', 302);
  }

  let firstName: string;
  let lastName: string;
  let phone: string;

  try {
    const body = await request.formData();
    firstName = String(body.get('firstName') ?? '').trim();
    lastName = String(body.get('lastName') ?? '').trim();
    phone = String(body.get('phone') ?? '').trim();
  } catch {
    return redirect('/account/profile?error=Invalid+request', 302);
  }

  const input: Record<string, unknown> = {};
  if (firstName) input.firstName = firstName;
  if (lastName) input.lastName = lastName;
  if (phone) input.phoneNumber = { phoneNumber: phone };

  try {
    const result = await client.query<{
      customerUpdate: {
        customer: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(CUSTOMER_UPDATE_MUTATION, { input });

    const userErrors = result.customerUpdate?.userErrors ?? [];
    if (userErrors.length > 0) {
      const msg = userErrors.map((e) => e.message).join('; ');
      return redirect(`/account/profile?error=${encodeURIComponent(msg)}`, 302);
    }

    return redirect('/account/profile?success=updated', 302);
  } catch (err) {
    if (err instanceof NotAuthenticatedError) {
      return redirect('/account/login?return_to=/account/profile', 302);
    }
    const msg = (err as Error).message;
    return redirect(`/account/profile?error=${encodeURIComponent(msg)}`, 302);
  }
};
