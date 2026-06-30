// ============================================================
//  PredictiveSearch — full-screen dark overlay matching the
//  editorial HTML mockup design. Large serif input, warm-white
//  on dark, hint pills, live results in the same dark chrome.
// ============================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileText, BookOpen } from 'lucide-react';
import { formatMoney } from '~/lib/utils';
import { useFocusTrap } from './useFocusTrap';

interface PredictProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}
interface PredictCollection { id: string; title: string; handle: string }
interface PredictPage    { id: string; title: string; handle: string }
interface PredictArticle {
  id: string;
  title: string;
  handle: string;
  blog: { handle: string };
  image?: { url: string; altText?: string | null } | null;
  excerpt?: string | null;
}
interface PredictQuery { text: string; styledText: string }

interface Results {
  queries: PredictQuery[];
  products: PredictProduct[];
  collections: PredictCollection[];
  pages: PredictPage[];
  articles: PredictArticle[];
}

const EMPTY: Results = { queries: [], products: [], collections: [], pages: [], articles: [] };

interface NavItem { url: string }

function buildNavItems(r: Results): NavItem[] {
  const out: NavItem[] = [];
  r.queries.forEach((q) => out.push({ url: `/search?q=${encodeURIComponent(q.text)}` }));
  r.products.forEach((p) => out.push({ url: `/products/${p.handle}` }));
  r.collections.forEach((c) => out.push({ url: `/collections/${c.handle}` }));
  r.pages.forEach((p) => out.push({ url: `/pages/${p.handle}` }));
  r.articles.forEach((a) => out.push({ url: `/blogs/${a.blog.handle}/${a.handle}` }));
  return out;
}

// ── Colour tokens (dark overlay palette) ───────────────────
const C = {
  overlay:    'rgba(17,17,17,0.92)',
  warmWhite:  'var(--warm-white)',
  clay:       'var(--clay)',
  label:      'rgba(255,252,247,0.38)',
  divider:    'rgba(255,252,247,0.16)',
  iconMuted:  'rgba(255,252,247,0.45)',
  hintBg:     'rgba(255,252,247,0.07)',
  hintBorder: 'rgba(255,252,247,0.12)',
  hintText:   'rgba(255,252,247,0.55)',
  hintHover:  'rgba(255,252,247,0.15)',
  itemHover:  'rgba(255,252,247,0.07)',
  closeBg:    'rgba(255,252,247,0.10)',
  closeHover: 'rgba(255,252,247,0.20)',
  sectionLabel: 'rgba(255,252,247,0.38)',
} as const;

const HINTS = [
  'Wireless headphones',
  'Best smartwatches',
  'Laptops under $1500',
  'Buying guide: audio',
  'The Sound Setup',
  "Editor's picks",
];

export default function PredictiveSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoverHint, setHoverHint] = useState<string | null>(null);
  const [hoverClose, setHoverClose] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  const navItems = useMemo(() => buildNavItems(results), [results]);
  const trimmed = query.trim();
  const showResults = trimmed.length >= 2;
  const hasResults =
    results.queries.length + results.products.length + results.collections.length +
    results.pages.length + results.articles.length > 0;

  useEffect(() => setActiveIndex(-1), [results]);

  // Debounced fetch.
  useEffect(() => {
    if (!open || !showResults) {
      setResults(EMPTY);
      setError(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('search failed');
        const data = (await res.json()) as Results;
        setResults({
          queries:     data.queries     ?? [],
          products:    data.products    ?? [],
          collections: data.collections ?? [],
          pages:       data.pages       ?? [],
          articles:    data.articles    ?? [],
        });
        setError(false);
      } catch {
        setResults(EMPTY);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [trimmed, open]);

  // Body scroll lock + Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus input when dialog opens.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const close = () => { setOpen(false); setQuery(''); setResults(EMPTY); setError(false); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && navItems[activeIndex]) {
      window.location.href = navItems[activeIndex].url;
      return;
    }
    if (trimmed) window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasResults) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, navItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    }
  };

  // Flat index counter — reset on each render.
  let _idx = 0;
  const isActive = () => _idx++ === activeIndex;

  return (
    <>
      {/* Trigger — matches header-icon class used by other header buttons */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="header-icon"
        aria-label="Search"
        aria-haspopup="dialog"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        /* Full-screen dark overlay */
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          style={{
            position: 'fixed',
            inset: 0,
            background: C.overlay,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 230,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '100px',
            overflowY: 'auto',
          }}
        >
          {/* Close button — fixed top-right */}
          <button
            type="button"
            onClick={close}
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => setHoverClose(false)}
            aria-label="Close search"
            style={{
              position: 'fixed',
              top: 26,
              right: 28,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: hoverClose ? C.closeHover : C.closeBg,
              color: C.warmWhite,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 200ms',
              border: 'none',
              flexShrink: 0,
            }}
          >
            ✕
          </button>

          {/* Search box */}
          <div style={{ maxWidth: 700, width: '100%', padding: '0 30px', paddingBottom: 60 }}>

            {/* Label */}
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: C.label,
              marginBottom: 22,
              display: 'block',
            }}>
              What are you looking for?
            </span>

            {/* Search row */}
            <form onSubmit={submit}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderBottom: `2px solid ${C.divider}`,
                paddingBottom: 18,
                marginBottom: 34,
              }}>
                {/* Search icon */}
                <svg
                  viewBox="0 0 24 24"
                  style={{ width: 22, height: 22, color: C.iconMuted, stroke: 'currentColor', fill: 'none', flexShrink: 0 }}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>

                {/* Input */}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  type="search"
                  placeholder="Search products, guides, journal…"
                  autoComplete="off"
                  aria-label="Search"
                  aria-autocomplete="list"
                  aria-controls="search-results"
                  aria-activedescendant={activeIndex >= 0 ? `sr-item-${activeIndex}` : undefined}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 34,
                    fontWeight: 400,
                    color: C.warmWhite,
                    caretColor: C.clay,
                    outline: 'none',
                    lineHeight: 1,
                  }}
                />

                {/* Submit button */}
                <button
                  type="submit"
                  aria-label="Search"
                  style={{
                    background: 'transparent',
                    color: C.iconMuted,
                    padding: 8,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.clay)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.iconMuted)}
                >
                  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: 'currentColor', fill: 'none', strokeWidth: 1.8 }}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Live region */}
            <p className="sr-only" role="status" aria-live="polite">
              {!showResults ? '' : loading ? 'Searching' : error ? 'Search failed' : !hasResults ? `No results for ${trimmed}` : `${results.products.length} products found`}
            </p>

            {/* ── Results area (replaces hints when typing) ── */}
            <div id="search-results" role="listbox">

              {!showResults ? (
                /* Hint pills — shown when no query */
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {HINTS.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => {
                        setQuery(hint);
                        window.location.href = `/search?q=${encodeURIComponent(hint)}`;
                      }}
                      onMouseEnter={() => setHoverHint(hint)}
                      onMouseLeave={() => setHoverHint(null)}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: hoverHint === hint ? C.warmWhite : C.hintText,
                        background: hoverHint === hint ? C.hintHover : C.hintBg,
                        border: `1px solid ${C.hintBorder}`,
                        borderRadius: 'var(--r-pill)',
                        padding: '7px 16px',
                        cursor: 'pointer',
                        transition: 'background 200ms, color 200ms',
                      }}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              ) : loading && !hasResults ? (
                <p style={{ color: C.label, fontSize: 14, letterSpacing: '0.05em' }}>Searching…</p>
              ) : error ? (
                <p style={{ color: C.label, fontSize: 14 }}>
                  Something went wrong.{' '}
                  <a href={`/search?q=${encodeURIComponent(trimmed)}`} style={{ color: C.warmWhite, textDecoration: 'underline' }}>
                    View full results
                  </a>
                </p>
              ) : !hasResults ? (
                <p style={{ color: C.label, fontSize: 14 }}>No matches for "{trimmed}".</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* Query suggestions — pill style */}
                  {results.queries.length > 0 && (
                    <section>
                      <SectionLabel>Suggestions</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {results.queries.map((q) => {
                          const active = isActive(); const idx = _idx - 1;
                          return (
                            <ResultPill key={q.text} id={`sr-item-${idx}`} href={`/search?q=${encodeURIComponent(q.text)}`} active={active}>
                              {q.text}
                            </ResultPill>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Collections — pill style */}
                  {results.collections.length > 0 && (
                    <section>
                      <SectionLabel>Collections</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {results.collections.map((c) => {
                          const active = isActive(); const idx = _idx - 1;
                          return (
                            <ResultPill key={c.id} id={`sr-item-${idx}`} href={`/collections/${c.handle}`} active={active}>
                              {c.title}
                            </ResultPill>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Products */}
                  {results.products.length > 0 && (
                    <section>
                      <SectionLabel>Products</SectionLabel>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
                        {results.products.map((p) => {
                          const active = isActive(); const idx = _idx - 1;
                          return (
                            <li key={p.id}>
                              <ResultRow id={`sr-item-${idx}`} href={`/products/${p.handle}`} active={active}>
                                <span style={{
                                  width: 48, height: 48, flexShrink: 0,
                                  borderRadius: 4, overflow: 'hidden',
                                  background: 'rgba(255,252,247,0.08)',
                                  border: '1px solid rgba(255,252,247,0.12)',
                                }}>
                                  {p.featuredImage && (
                                    <img src={p.featuredImage.url} alt={p.featuredImage.altText ?? p.title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      loading="lazy" />
                                  )}
                                </span>
                                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.warmWhite, fontSize: 14 }}>
                                  {p.title}
                                </span>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: C.label, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                                  {formatMoney(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
                                </span>
                              </ResultRow>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {/* Pages */}
                  {results.pages.length > 0 && (
                    <section>
                      <SectionLabel>Pages</SectionLabel>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
                        {results.pages.map((p) => {
                          const active = isActive(); const idx = _idx - 1;
                          return (
                            <li key={p.id}>
                              <ResultRow id={`sr-item-${idx}`} href={`/pages/${p.handle}`} active={active}>
                                <span style={{
                                  width: 48, height: 48, flexShrink: 0,
                                  borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'rgba(255,252,247,0.08)',
                                  border: '1px solid rgba(255,252,247,0.12)',
                                  color: C.label,
                                }}>
                                  <FileText size={16} strokeWidth={1.4} />
                                </span>
                                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.warmWhite, fontSize: 14 }}>
                                  {p.title}
                                </span>
                                <ArrowRight size={14} strokeWidth={1.6} style={{ color: C.label, flexShrink: 0 }} />
                              </ResultRow>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {/* Articles */}
                  {results.articles.length > 0 && (
                    <section>
                      <SectionLabel>Articles</SectionLabel>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
                        {results.articles.map((a) => {
                          const active = isActive(); const idx = _idx - 1;
                          return (
                            <li key={a.id}>
                              <ResultRow id={`sr-item-${idx}`} href={`/blogs/${a.blog.handle}/${a.handle}`} active={active}>
                                <span style={{
                                  width: 48, height: 48, flexShrink: 0,
                                  borderRadius: 4, overflow: 'hidden',
                                  background: 'rgba(255,252,247,0.08)',
                                  border: '1px solid rgba(255,252,247,0.12)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: C.label,
                                }}>
                                  {a.image ? (
                                    <img src={a.image.url} alt={a.image.altText ?? a.title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      loading="lazy" />
                                  ) : (
                                    <BookOpen size={16} strokeWidth={1.4} />
                                  )}
                                </span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.warmWhite, fontSize: 14 }}>
                                    {a.title}
                                  </span>
                                  {a.excerpt && (
                                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.label, fontSize: 12, marginTop: 2 }}>
                                      {a.excerpt}
                                    </span>
                                  )}
                                </span>
                                <ArrowRight size={14} strokeWidth={1.6} style={{ color: C.label, flexShrink: 0 }} />
                              </ResultRow>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {/* View all */}
                  <a
                    href={`/search?q=${encodeURIComponent(trimmed)}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontSize: 12.5, fontWeight: 600, letterSpacing: '0.06em',
                      color: C.hintText, textDecoration: 'none',
                      borderTop: `1px solid ${C.divider}`, paddingTop: 16,
                      transition: 'color 200ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.warmWhite)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.hintText)}
                  >
                    View all results for "{trimmed}"
                    <ArrowRight size={13} strokeWidth={1.8} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Small shared sub-components ────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'rgba(255,252,247,0.38)',
      marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

function ResultPill({
  id, href, active, children,
}: { id: string; href: string; active: boolean; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  const on = active || hover;
  return (
    <a
      id={id}
      role="option"
      aria-selected={active}
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12.5,
        fontWeight: 600,
        color: on ? 'var(--warm-white)' : 'rgba(255,252,247,0.55)',
        background: on ? 'rgba(255,252,247,0.15)' : 'rgba(255,252,247,0.07)',
        border: `1px solid ${on ? 'rgba(255,252,247,0.28)' : 'rgba(255,252,247,0.12)'}`,
        borderRadius: 'var(--r-pill)',
        padding: '6px 14px',
        textDecoration: 'none',
        transition: 'background 200ms, color 200ms, border-color 200ms',
        display: 'inline-block',
      }}
    >
      {children}
    </a>
  );
}

function ResultRow({
  id, href, active, children,
}: { id: string; href: string; active: boolean; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      id={id}
      role="option"
      aria-selected={active}
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '9px 10px',
        borderRadius: 6,
        background: (active || hover) ? 'rgba(255,252,247,0.07)' : 'transparent',
        textDecoration: 'none',
        transition: 'background 160ms',
      }}
    >
      {children}
    </a>
  );
}
