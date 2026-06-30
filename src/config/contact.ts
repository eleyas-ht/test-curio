// ============================================================
//  Contact Page Configuration
//  Single source of truth for all contact page content:
//  hero copy, marquee items, form topics, channel directory,
//  opening hours, social links, map embed, and newsletter.
// ============================================================

export const CONTACT = {
  // ── Hero ────────────────────────────────────────────────
  hero: {
    /** Small label above the title row. */
    label: 'Contact · Curio',
    /** Status badge text next to the animated dot. */
    statusText: 'Replies in ~4 hours',
    /** Main h1 — HTML allowed (use <br> and <em>). */
    title: "Let's start<br>a <em>conversation</em>.",
    /** Lead paragraph below the title. */
    lead: "Tell us what you're after — a product question, an order, a return, or just a recommendation. A real human reads every word.",
  },

  // ── Marquee ─────────────────────────────────────────────
  /** Phrases that scroll across the marquee strip. */
  marquee: [
    'Say hello',
    "Let's talk",
    'Get in touch',
    'Tell us everything',
    'Ask us anything',
  ],

  // ── Conversational Form ──────────────────────────────────
  form: {
    label: 'Drop us a line',
    sectionNumber: '(01 / Write)',
    /** Opening line of the fill-in-the-blanks sentence. */
    greeting: 'Hello Curio, my name is',
    /** Dropdown options for the topic field. */
    topics: [
      'a general enquiry',
      'an order & shipping',
      'a return or warranty',
      'a recommendation',
      'press & partnerships',
    ],
    submitLabel: 'Send it',
    hintText: "Fields marked are required — we'll never share your details.",
    successMessage: "Sent — talk soon. We'll reply within one business day.",
  },

  // ── Directory ────────────────────────────────────────────
  directory: {
    label: 'Direct lines',
    /** Section heading — HTML allowed (use <em>). */
    heading: 'Other ways to <em>reach us</em>.',
    channels: [
      { no: '01', label: 'Email',            value: 'hello@example.com',         href: 'mailto:hello@example.com' },
      { no: '02', label: 'Call the concierge', value: '+1 (800) 555-0199',        href: 'tel:+18005550199' },
      { no: '03', label: 'Live chat',        value: 'Start a conversation',       href: '#' },
      { no: '04', label: 'Visit the studio', value: '221 Curate Lane, SoHo NY',  href: '#ct-map' },
    ],
    hours: {
      title: 'Opening hours',
      schedule: [
        { days: 'Mon — Fri', hours: '9:00 — 19:00', closed: false },
        { days: 'Saturday',  hours: '10:00 — 18:00', closed: false },
        { days: 'Sunday',    hours: 'Closed',         closed: true  },
      ],
    },
    socialCard: {
      title: 'Follow the edit',
      subtitle: "Editor's picks, drops & the occasional rant.",
      /** icon: 'instagram' | 'x' | 'youtube' | 'linkedin' */
      links: [
        { label: 'Instagram', href: '#', icon: 'instagram' as const },
        { label: 'X',         href: '#', icon: 'x'         as const },
        { label: 'YouTube',   href: '#', icon: 'youtube'   as const },
        { label: 'LinkedIn',  href: '#', icon: 'linkedin'  as const },
      ],
    },
  },

  // ── Map ──────────────────────────────────────────────────
  map: {
    /** Small eyebrow label on the map card. */
    label: 'Come say hi',
    /** Bold address title on the map card. */
    title: '221 Curate Lane',
    /** Body copy on the map card. */
    description: 'SoHo, New York — open six days a week. Pop in to test the edit in person, or book a one-on-one with a specialist.',
    directionsHref: '#',
    directionsLabel: 'Get directions',
    iframeSrc: 'https://www.google.com/maps?q=SoHo,New+York,NY&output=embed',
    iframeTitle: 'Curio studio location',
  },

  // ── Newsletter ───────────────────────────────────────────
  newsletter: {
    eyebrow: 'A letter, weekly',
    /** Section heading — HTML allowed (use <em>). */
    title: 'Subscribe to <em>The Edit</em>.',
    body: "One thoughtful email a week. Editor's picks, the occasional rant, and what we'd actually recommend to a friend looking for new gear. No deal-of-the-day. No drop-pop FOMO.",
    placeholder: 'your@email.com',
    submitLabel: 'Subscribe',
    /** Fine print — HTML allowed (links, etc.). */
    finePrint: 'By subscribing you agree to our <a href="#">privacy policy</a>. Unsubscribe in one click, always.',
  },
} as const;
