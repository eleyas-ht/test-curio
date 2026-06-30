// ============================================================
//  FAQ Section Configuration
//
//  Questions and answers shown in the FAQ accordion.
//  Add, remove, or reorder items to control what appears.
//  Each `q` is the question, `a` is the answer.
// ============================================================

export const FAQS = [
  {
    q: 'How do you choose what to sell?',       // accordion question (always visible)
    a: 'Every product is tested by our editors before it earns a place. We sell fewer things, chosen with far more care — no pay-to-play, no filler.', // answer (shown on expand)
  },
  {
    q: 'What does shipping cost?',
    a: 'Complimentary express shipping on every order over $75. Below that, a flat $6 applies. Most orders ship the same business day.',
  },
  {
    q: 'What\'s your return policy?',
    a: '30 days, no questions asked. If it\'s not right, send it back for a full refund — we even cover return shipping.',
  },
  {
    q: 'Do products come with a warranty?',
    a: 'Yes — a 2-year Curio warranty on top of any manufacturer cover. If it fails, we repair or replace it.',
  },
  {
    q: 'Can I talk to a real person?',
    a: 'Always. Our concierge is staffed 24/7 by humans who actually use this gear. Reach us by chat, email or phone.',
  },
  {
    q: 'Do you price match?',
    a: 'If you find an authorised retailer selling for less within 14 days of purchase, we\'ll refund the difference.',
  },
] as const;
