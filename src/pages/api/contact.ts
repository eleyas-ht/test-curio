// ============================================================
//  POST /api/contact — { name, email, topic, message }
//  STUB: validates and returns ok. The Storefront API has no
//  contact endpoint — wire this to your helpdesk / email / CRM.
//  See CONVERSION-PLAN.md §4.1.
// ============================================================
import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;
    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim();
    const message = String(body?.message ?? '').trim();
    const topic = String(body?.topic ?? 'general').trim();

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'Please tell us your name.';
    if (!EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
    if (message.length < 5) errors.message = 'Add a little more detail.';

    if (Object.keys(errors).length) {
      return json({ ok: false, errors }, 400);
    }

    // TODO: forward to your helpdesk / email service / CRM here.
    console.info('[contact] message (stub):', { name, email, topic, length: message.length });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
};
