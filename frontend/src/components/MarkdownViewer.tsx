import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ImageOff, X, Link2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface MarkdownViewerProps {
  content: string;
  onLinkClick: (href: string) => void;
  searchTerm?: string;
}

// ── Copy Button ───────────────────────────────────────────
const CopyButton: React.FC<{ code: string }> = React.memo(({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '6px', border: 'none',
        background: copied ? '#22c55e22' : '#ffffff14',
        color: copied ? '#4ade80' : '#8b949e',
        cursor: 'pointer', fontSize: '11px',
        fontFamily: 'var(--font-mono)', fontWeight: 500,
        transition: 'all .15s', letterSpacing: '0.03em',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
});

// ── Safe Image ────────────────────────────────────────────
// FIX: broken state keyed to src string, never resets on parent re-render
// FIX: no useEffect that depends on src — avoids the reset-on-scroll loop
const SafeImage: React.FC<{ src?: string; alt?: string }> = React.memo(({ src, alt }) => {
  // Track broken state per src so switching back to a good image works
  const [brokenSrcs, setBrokenSrcs] = useState<Set<string>>(new Set());

  const isBroken = !src || brokenSrcs.has(src);

  const handleError = useCallback(() => {
    if (!src) return;
    setBrokenSrcs(prev => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, [src]);

  if (isBroken) {
    return (
      <span style={{
        display: 'inline-flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
        width: '100%', minHeight: '100px',
        background: 'var(--bg-subtle)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-tertiary)',
        padding: '1.5rem',
      }}>
        <ImageOff size={24} style={{ opacity: 0.4 }} />
        <span style={{
          fontSize: '11px', fontFamily: 'var(--font-mono)',
          maxWidth: '100%', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {alt || src || 'Image unavailable'}
        </span>
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      style={{
        maxWidth: '100%', height: 'auto',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        display: 'inline-block',
      }}
    />
  );
});

// ── Highlight Text ────────────────────────────────────────
const HighlightText: React.FC<{ text: string; term: string }> = React.memo(({ text, term }) => {
  if (!term.trim()) return <>{text}</>;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase()
          ? <mark key={i}>{part}</mark>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
});

function highlightChildren(children: React.ReactNode, term: string): React.ReactNode {
  if (!term) return children;
  return React.Children.map(children, child =>
    typeof child === 'string' ? <HighlightText text={child} term={term} /> : child
  );
}

// ── Anchor Heading ────────────────────────────────────────
const AnchorHeading: React.FC<{
  tag: 'h1' | 'h2' | 'h3' | 'h4';
  id: string;
  className?: string;
  children: React.ReactNode;
}> = ({ tag: Tag, id, className, children }) => {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`#${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [id]);

  return (
    <Tag
      id={id}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span>{children}</span>
        <button
          onClick={handleCopy}
          title={`Copy #${id}`}
          style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center',
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: '2px 4px',
            color: copied ? 'var(--success)' : 'var(--text-tertiary)',
            opacity: hover ? 1 : 0,
            transition: 'opacity .12s, color .15s',
            borderRadius: '4px',
          }}
        >
          {copied ? <Check size={12} /> : <Link2 size={12} />}
        </button>
      </span>
    </Tag>
  );
};

// ── Heading text helper (used only for sector detection) ──
function extractHeadingText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return (children as React.ReactNode[]).map(extractHeadingText).join('');
  if (React.isValidElement(children)) return extractHeadingText((children.props as any).children);
  return '';
}

// ── Main Viewer ───────────────────────────────────────────
const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, onLinkClick, searchTerm = '' }) => {
  const { settings } = useSettings();

  // Derived from settings — memoized so they don't recreate components object
  const codeBg       = settings.codeBackground;
  const codeFontSize = settings.codeFontSize;
  const sektorBlocks = settings.sektorBlocks;
  const maxWidthMap = { narrow: '56rem', default: '64rem', wide: '80rem', full: '100%' } as const;
  const maxWidth = maxWidthMap[settings.contentMaxWidth] ?? '64rem';

  // Map source line number → heading ID. Built from raw markdown (tracking code-fence state so
  // headings inside code blocks are excluded). React-markdown passes node.position.start.line,
  // so lookups are idempotent — no shared mutable counter during render (avoids Strict Mode issues).
  const headingIdsByLine = useMemo(() => {
    const result = new Map<number, string>();
    const counter = new Map<string, number>();
    const lines = content.split('\n');
    let inCodeBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith('```')) { inCodeBlock = !inCodeBlock; continue; }
      if (inCodeBlock) continue;
      const m = line.match(/^(#{1,4})\s+(.+)$/);
      if (!m) continue;
      const title = m[2].trim();
      const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const count = counter.get(base) || 0;
      counter.set(base, count + 1);
      result.set(i + 1, count === 0 ? base : `${base}-${count + 1}`);
    }
    return result;
  }, [content]);

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  // Scroll to first search match
  useEffect(() => {
    if (!searchTerm) return;
    const timer = setTimeout(() => {
      const mark = document.querySelector('mark');
      if (mark) mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => clearTimeout(timer);
  }, [searchTerm, content]);

  // FIX: memoize hl so it doesn't cause ReactMarkdown's components to be a new object every scroll
  const hl = useCallback(
    (children: React.ReactNode) => highlightChildren(children, searchTerm),
    [searchTerm]
  );

  // FIX: memoize the entire components object keyed to things that actually change it.
  // Previously this was recreated on every render (including every scroll tick),
  // which caused react-markdown to unmount/remount all children including <img> → flicker.
  const components = useMemo(() => ({

    // ── Paragraphs ────────────────────────────────────
    p: ({ children }: any) => (
      <p style={{ marginBottom: 'var(--para-spacing)', lineHeight: 'var(--line-height)' }}>
        {hl(children)}
      </p>
    ),

    // ── Headings ──────────────────────────────────────
    h1: ({ node, children }: any) => <AnchorHeading tag="h1" id={headingIdsByLine.get(node?.position?.start?.line) ?? ''} className="md-prose">{hl(children)}</AnchorHeading>,
    h2: ({ node, children }: any) => <AnchorHeading tag="h2" id={headingIdsByLine.get(node?.position?.start?.line) ?? ''} className="md-prose">{hl(children)}</AnchorHeading>,
    h3: ({ node, children }: any) => {
      const id = headingIdsByLine.get(node?.position?.start?.line) ?? '';
      const rawText = extractHeadingText(children);
      if (sektorBlocks && /^(sektor|sector)\s*:/i.test(rawText)) {
        return (
          <div id={id} className="md-sektor-block">
            <h3>{rawText.replace(/^(sektor|sector):?\s*/i, '')}</h3>
          </div>
        );
      }
      return <AnchorHeading tag="h3" id={id} className="md-prose">{hl(children)}</AnchorHeading>;
    },
    h4: ({ node, children }: any) => <AnchorHeading tag="h4" id={headingIdsByLine.get(node?.position?.start?.line) ?? ''} className="md-prose">{hl(children)}</AnchorHeading>,

    // ── Lists ─────────────────────────────────────────
    ul: ({ children }: any) => <ul className="md-prose">{children}</ul>,
    ol: ({ children }: any) => <ol className="md-prose">{children}</ol>,
    li: ({ children }: any) => <li>{hl(children)}</li>,

    // ── Code ──────────────────────────────────────────
    code({ node, inline, className, children }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      const isInline = inline !== false && !codeString.includes('\n');

      if (!isInline) {
        const lang = match?.[1] || 'text';
        return (
          <div className="md-prose-code-block">
            <div className="md-prose-code-block-header">
              <span className="md-prose-code-block-lang">{lang}</span>
              <CopyButton code={codeString} />
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={lang}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1.25rem', background: codeBg, fontSize: `${codeFontSize}px`, lineHeight: '1.65' }}
              codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <code className="md-prose-code-inline">{children}</code>;
    },

    // ── Links ─────────────────────────────────────────
    a: ({ children, href }: any) => (
      <a
        href={href}
        style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid var(--accent-muted)', transition: 'color .15s', cursor: 'pointer' }}
        onClick={e => { e.preventDefault(); if (href) onLinkClick(href); }}
      >
        {children}
      </a>
    ),

    // ── Blockquote ────────────────────────────────────
    blockquote: ({ children }: any) => <blockquote className="md-prose">{children}</blockquote>,

    // ── Tables ────────────────────────────────────────
    table: ({ children }: any) => (
      <div className="md-prose-table-wrap"><table className="md-prose">{children}</table></div>
    ),
    th: ({ children }: any) => <th className="md-prose">{hl(children)}</th>,
    td: ({ children }: any) => <td className="md-prose">{hl(children)}</td>,

    // ── HR ────────────────────────────────────────────
    hr: () => <hr className="md-prose" />,

    // ── Images ────────────────────────────────────────
    img: ({ src, alt }: any) => (
      <span style={{ display: 'block', margin: '2rem 0', textAlign: 'center' }}>
        <span
          onClick={() => src && setLightbox({ src, alt: alt || '' })}
          title={src ? 'Click to enlarge' : undefined}
          style={{ display: 'inline-block', cursor: src ? 'zoom-in' : 'default', position: 'relative' }}
        >
          <SafeImage src={src} alt={alt} />
        </span>
        {alt && (
          <span style={{ display: 'block', marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            {alt}
          </span>
        )}
      </span>
    ),

    // ── Strong / Em ───────────────────────────────────
    strong: ({ children }: any) => <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hl(children)}</strong>,
    em:     ({ children }: any) => <em style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{children}</em>,

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [hl, codeBg, codeFontSize, sektorBlocks, onLinkClick, headingIdsByLine]);

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(10px)',
            cursor: 'zoom-out', padding: '2rem',
          }}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,.2)',
              background: 'rgba(255,255,255,.1)',
              color: '#fff', cursor: 'pointer', zIndex: 201,
            }}
          >
            <X size={16} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 30px 80px rgba(0,0,0,.7)',
              cursor: 'default',
            }}
          />
          {lightbox.alt && (
            <span style={{
              position: 'absolute', bottom: '1.5rem',
              left: '50%', transform: 'translateX(-50%)',
              fontSize: '13px', color: 'rgba(255,255,255,.65)',
              fontStyle: 'italic', whiteSpace: 'nowrap',
              maxWidth: '80vw', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {lightbox.alt}
            </span>
          )}
        </div>
      )}

      <div
        className="md-prose animate-fade-in"
        style={{ maxWidth, margin: '0 auto', padding: '2rem 1.5rem 4rem', transition: 'max-width .3s ease' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default MarkdownViewer;