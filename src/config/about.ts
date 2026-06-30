// ============================================================
//  About Page Configuration
//
//  All content for the /about page lives here.
//  Sections: Hero, Manifesto, Story, Values, Journey,
//            Video, Founder Note, Team, FAQs.
//
//  Team members also power /team/[slug] detail pages.
// ============================================================

// ——— HERO ————————————————————————————————————————————————

export const ABOUT_HERO = {
  watermark: 'Curio',
  eyebrow: 'About Curio · Est. 2016',
  /** innerHTML — wrap italic words in <em> */
  title: 'We sell <em>fewer</em> things,<br>chosen with <em>far</em> more care.',
  lead:
    "Curio is an editorial electronics store. We don't carry everything — we carry the things we'd actually recommend to a friend. Curated by humans, tested in real life, written about honestly.",
  cta: { label: 'Explore the edit', href: '/products' },
  storyLink: 'Read our story',
  chip: {
    num: '9 yrs',
    /** innerHTML — supports <br> */
    label: 'of curating tech<br>worth keeping',
  },
  tagline: 'All latest brand product',
  tagsub:
    "From flagship audio to everyday carry — every piece is hand-picked and tested in real life. Only what we'd keep on our own desks makes the edit.",
  slides: [
    { src: '/images/about-hero-showcase.jpg', alt: 'Curated tech — headphones, phone & watch' },
    { src: '/images/showcase-image-02.jpg', alt: 'Curated audio & wearables' },
    { src: '/images/showcase-image-03.jpg', alt: 'The latest in the edit' },
  ],
  stats: [
    { num: '9', sup: '', label: 'Years\ncurating' },
    { num: '600', sup: '+', label: 'Products in\nthe edit' },
    { num: '120', sup: 'k', label: 'Happy\ncustomers' },
    { num: '4.9', sup: '★', label: 'Average\nrating' },
  ],
} as const;

// ——— MANIFESTO ————————————————————————————————————————————

export const ABOUT_MANIFESTO = {
  eyebrow: 'What we believe',
  /** innerHTML — supports em/strong */
  text: "The world doesn't need another store with ten thousand gadgets and a search bar. It needs an <em>editor</em> — someone who tries the things, sweats the details, and tells you the truth. That's the whole idea behind <strong>Curio</strong>: <em>tech, curated.</em>",
} as const;

// ——— STORY ————————————————————————————————————————————————

export const ABOUT_STORY = {
  eyebrow: 'How it started',
  /** innerHTML */
  h2: 'A workbench, a notebook, <em>and a lot of opinions.</em>',
  lead: "In 2016 we were three friends who couldn't stop arguing about gear — which headphones actually sounded good, which \"flagship\" phone was just marketing, which gadgets were worth the money. So we started writing it down.",
  paragraphs: [
    "The reviews turned into a following. The following asked where to buy. And the store grew out of a simple promise: we'd only sell the things we'd recommend to people we like.",
    "Nine years later that promise hasn't moved. We're bigger, but the filter is the same — if it's not good enough for our own desks, it doesn't make the edit.",
  ],
  estYear: '2016',
  img1: { src: '/images/editorial-gallery-02.jpg', alt: 'The Curio workbench' },
  img2: { src: '/images/editorial-gallery-01.jpg', alt: 'The early Curio days' },
} as const;

// ——— CORE VALUES ——————————————————————————————————————————

export type CoreValue = {
  num: string;
  /** Inner SVG elements as raw HTML (rendered with set:html on the svg) */
  iconHtml: string;
  title: string;
  body: string;
  tag: string;
};

export const ABOUT_VALUES: CoreValue[] = [
  {
    num: '01',
    iconHtml:
      '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke-linejoin="round" /><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />',
    title: 'Curation over clutter',
    body: "We say no to most things so you don't have to wade through them. Every product on the edit earned its place against everything else we tested.",
    tag: '≈ 9 in 10 products we test never make it',
  },
  {
    num: '02',
    iconHtml:
      '<circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7M12 17h.01" stroke-linecap="round" />',
    title: 'Honesty, always',
    body: "No paid placements dressed up as picks. If something has a flaw, we'll tell you — even when we're the ones selling it.",
    tag: 'Zero sponsored rankings · ever',
  },
  {
    num: '03',
    iconHtml:
      '<path d="M3 12a9 9 0 1 1 9 9" stroke-linecap="round" /><path d="M3 12v5h5" stroke-linecap="round" stroke-linejoin="round" />',
    title: 'Built to last',
    body: 'We favour gear that ages well and brands that stand behind it. Repairable, durable, worth keeping — not landfill in a year.',
    tag: 'Repairable-first · 2-year warranty on everything',
  },
  {
    num: '04',
    iconHtml:
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" stroke-linejoin="round" />',
    title: 'People before metrics',
    body: "Real humans answer your emails, write our guides, and pack your orders. Service you'd recommend, not merely survive.",
    tag: 'Avg. human reply in under 4 hours',
  },
];

// ——— JOURNEY / TIMELINE ———————————————————————————————————

export type JourneyMilestone = {
  year: string;
  label: string;
  stamp: string;
  img: { src: string; alt: string };
  chapter: string;
  /** innerHTML — plain text is fine; no HTML needed */
  title: string;
  text: string;
  meta: string;
};

export const ABOUT_JOURNEY: JourneyMilestone[] = [
  {
    year: '2016',
    label: 'The spark',
    stamp: "'16",
    img: { src: '/images/history-2016.jpg', alt: 'The idea sparked — 2016' },
    chapter: 'Chapter 01',
    title: 'The idea sparked',
    text: "Three friends, one notebook, and endless arguments about gear. We started writing honest reviews — which headphones actually sounded good, which \"flagship\" was just marketing — and people started listening.",
    meta: 'Began with a single curated catalogue',
  },
  {
    year: '2019',
    label: 'The leap',
    stamp: "'19",
    img: { src: '/images/history-2019.jpg', alt: 'The store opened — 2019' },
    chapter: 'Chapter 02',
    title: 'Launching the Online Platform',
    text: "Readers kept asking where to buy. So we opened the shop with a single rule: only sell what we'd recommend to people we like. Detailed guides and honest support came built in from day one.",
    meta: 'Online & shipping worldwide',
  },
  {
    year: '2022',
    label: 'The space',
    stamp: "'22",
    img: { src: '/images/history-2022.jpg', alt: 'First flagship space — 2022' },
    chapter: 'Chapter 03',
    title: 'First flagship space',
    text: 'Our first physical showroom — part store, part studio, where we test everything before it makes the edit. A place to see, hold, and hear the collection, with real specialists on hand.',
    meta: 'Showroom + in-house test studio',
  },
  {
    year: '2024',
    label: 'The expansion',
    stamp: "'24",
    img: { src: '/images/history-2023.jpg', alt: 'Expansion across the country — 2024' },
    chapter: 'Chapter 04',
    title: 'Expansion across the country',
    text: 'Demand grew, and so did we. New stores and faster delivery brought Curio to cities across the country, while our concierge team scaled to keep every single experience personal.',
    meta: 'New cities · faster delivery',
  },
  {
    year: '2025',
    label: 'Today',
    stamp: "'25",
    img: { src: '/images/journey-2025.jpg', alt: '120k customers — 2025' },
    chapter: 'Chapter 05',
    title: 'Still Growing, Still Grounded',
    text: "Bigger team, wider edit, worldwide shipping — but the filter hasn't moved an inch. If it's not good enough for our own desks, it doesn't make the edit. That's still the only rule that matters.",
    meta: '120k+ customers · same single rule',
  },
];

// ——— VIDEO ————————————————————————————————————————————————

export const ABOUT_VIDEO = {
  src: '/video/video-section-01.mp4',
  poster: '/images/creator-studio.jpg',
  eyebrow: 'Behind the edit',
  /** innerHTML */
  title: 'Every product earns its <em>place</em>.',
  sub: "We don't list specs and walk away. We live with the gear, push it, and only then decide whether it deserves your attention.",
} as const;

// ——— FOUNDER NOTE ————————————————————————————————————————

export const ABOUT_NOTE = {
  eyebrow: "A note from the founder",
  /** innerHTML */
  quote:
    "The best store isn't the one with the most products. It's the one that tells you the <em>truth</em> about the few it carries — and means it.",
  body:
    "That belief has shaped every decision since 2016: what we stock, what we turn away, and how we talk to you when something isn't right for you. We'd rather sell you nothing than sell you the wrong thing — and nine years in, that's still the only rule that matters.",
  founder: {
    name: 'Amara Akhon',
    role: 'Founder & Editor-in-Chief · Curio',
    avatar: '/images/editorial-team-01.jpg',
  },
} as const;

// ——— TEAM ————————————————————————————————————————————————

export type TeamMember = {
  /** URL slug — used for /team/[slug] route */
  slug: string;
  name: string;
  role: string;
  /** Specialty tag shown on hover card */
  tag: string;
  /** Short bio shown on hover overlay */
  bio: string;
  /** Longer bio for the individual team page */
  fullBio: string[];
  image: string;
  social: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
};

export const ABOUT_TEAM: TeamMember[] = [
  {
    slug: 'amara-akhon',
    name: 'Amara Akhon',
    role: 'Founder & Editor-in-Chief',
    tag: 'Audio obsessive',
    bio: 'Started the whole thing with a notebook and a hi-fi obsession. Still tests every audio product personally.',
    fullBio: [
      "Amara started Curio in 2016 from a simple frustration: too many stores, not enough honesty. Armed with a notebook, a pair of aging headphones, and strong opinions about both, she began writing the reviews she wished existed.",
      "Nine years on, she still personally signs off on every audio product that makes the edit. If the soundstage isn't right, it doesn't ship. If the build feels cheap, it doesn't ship. She's the reason Curio's catalogue is smaller than the competition — and why it's trusted more.",
      "Outside the office she's a passionate live-music attendee, an amateur recording engineer, and the only person in the building who still owns a turntable she bought new.",
    ],
    image: '/images/editorial-team-01.jpg',
    social: { twitter: '#', linkedin: '#', email: 'amara@curio.com' },
  },
  {
    slug: 'marcus-lin',
    name: 'Marcus Lin',
    role: 'Head of Curation',
    tag: 'Chief skeptic',
    bio: 'The reason most products get rejected. If it makes the edit, it survived Marcus.',
    fullBio: [
      "Marcus joined Curio in 2018 as the first dedicated curation hire, and his job has always been the same: say no. Of the hundreds of products that cross his desk each quarter, fewer than one in ten make it to the edit.",
      "His process is methodical and merciless. Every product is tested against its closest competitors, its stated specifications are verified, and its long-term durability is assessed before he writes a single word of the report.",
      "His background is in consumer electronics journalism, where he spent six years writing teardowns and long-term reviews. He brought that scepticism to Curio and never let it go. Off the clock, he builds mechanical keyboards and has very strong opinions about switches.",
    ],
    image: '/images/editorial-team-02.jpg',
    social: { twitter: '#', linkedin: '#', email: 'marcus@curio.com' },
  },
  {
    slug: 'sofia-reyes',
    name: 'Sofia Reyes',
    role: 'Lead Writer',
    tag: 'Word nerd',
    bio: 'Turns spec sheets into stories. Writes the guides you actually finish reading.',
    fullBio: [
      "Sofia's job is translation: she takes the dense technical output from curation and turns it into prose that a curious non-expert can act on. The best buying guide, in her view, is the one that answers every question before you think to ask it.",
      "She joined in 2020 after five years writing long-form features for a technology magazine. She brought a journalist's rigour and a novelist's ear — the guides she writes are genuinely enjoyable to read, which is harder than it sounds.",
      "Her specialities are cameras, laptops, and anything you'd put on a desk. She also runs the monthly Editor's Letter, the most-forwarded email Curio sends.",
    ],
    image: '/images/editorial-team-03.jpg',
    social: { twitter: '#', linkedin: '#', email: 'sofia@curio.com' },
  },
  {
    slug: 'daniel-osei',
    name: 'Daniel Osei',
    role: 'Customer Experience',
    tag: 'Inbox hero',
    bio: "The voice on the other end of your email. Knows the catalogue better than the catalogue does.",
    fullBio: [
      "Daniel is the person most Curio customers have actually spoken to, even if they don't know his name. He leads the concierge team and sets the standard for every reply that goes out under the Curio banner — no scripts, no templates, just genuine help.",
      "He joined in 2021 from a luxury retail background where he learned that real service isn't about policies, it's about listening. At Curio, that philosophy means customers get honest answers, including 'that product isn't right for you — here's why.'",
      "He knows the catalogue in depth because he tests everything himself before recommending it. If you've ever received a suspiciously useful reply to a complicated product question, there's a good chance Daniel wrote it.",
    ],
    image: '/images/editorial-team-04.jpg',
    social: { twitter: '#', linkedin: '#', email: 'daniel@curio.com' },
  },
];

// ——— ABOUT PAGE FAQs ——————————————————————————————————————

export type AboutFaq = {
  num: string;
  q: string;
  a: string;
  /** Start in open state */
  open?: boolean;
};

export const ABOUT_FAQS: AboutFaq[] = [
  {
    num: 'i.',
    q: 'What makes Curio different from a normal store?',
    a: "We don't carry everything — we carry the things our editors would buy themselves. Every product is tested in real life and earns its place. It's a curated edit, not an endless catalogue with a search bar.",
    open: true,
  },
  {
    num: 'ii.',
    q: 'How do you decide what makes the edit?',
    a: "We buy it, live with it, and push it. If it has a flaw we'll say so — and if it doesn't beat what's already in the edit, it doesn't get in. Most products we test never make the cut.",
  },
  {
    num: 'iii.',
    q: 'Are your reviews and picks sponsored?',
    a: "Never. No paid placements dressed up as picks. Brands can't buy their way onto the edit — and we tell you about the flaws even on products we sell.",
  },
  {
    num: 'iv.',
    q: 'Where do you ship, and how fast?',
    a: "Worldwide. Most US orders arrive in 2–4 business days, international in 5–10. Free express shipping over $75, and what you see at checkout is what we send out — no surprise handling fees.",
  },
  {
    num: 'v.',
    q: 'Do real humans actually answer support?',
    a: "Yes — the same team that writes our guides answers your emails. No bots pretending to be people, no scripts. Just folks who know the catalogue better than the catalogue does.",
  },
];
