import React, { useEffect, useRef, useState } from 'react';
import { List, ChevronRight, FileText } from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
  isSector: boolean;
}

type Lang = 'de' | 'en';

interface TableOfContentsProps {
  markdownContent: string;
  onToggle: () => void;
  lang: Lang;
  scrollContainer?: React.RefObject<HTMLDivElement>;
  onActiveHeadingChange?: (title: string) => void;
}

const toc18n: Record<Lang, { title: string; empty: string; sections: (n: number) => string }> = {
  de: {
    title:    'Inhalt',
    empty:    'Keine Abschnitte gefunden',
    sections: n => `${n} Abschnitt${n !== 1 ? 'e' : ''}`,
  },
  en: {
    title:    'Contents',
    empty:    'No sections found',
    sections: n => `${n} section${n !== 1 ? 's' : ''}`,
  },
};

const TableOfContents: React.FC<TableOfContentsProps> = ({
  markdownContent, onToggle, lang, scrollContainer, onActiveHeadingChange,
}) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const manualNavRef = useRef(false);
  const tt = toc18n[lang];

  useEffect(() => {
    const stripped = markdownContent.replace(/```[\s\S]*?```/g, '');
    const headers = stripped.match(/^(#{1,4})\s+(.+?)(?=\s*$)/gm);
    if (!headers) { setTocItems([]); return; }

    // Same deduplication logic as MarkdownViewer — all h1-h4 counted, h2+ displayed
    const counter = new Map<string, number>();
    const items: TocItem[] = headers
      .map(header => {
        const level = header.match(/^#+/)?.[0].length || 1;
        const title = header.replace(/^#+\s+/, '').trim();
        const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const count = counter.get(base) || 0;
        counter.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count + 1}`;
        return { id, title, level, isSector: /^(sektor|sector)\s*:/i.test(title) };
      })
      .filter(item => item.level > 1);

    setTocItems(items);
  }, [markdownContent]);

  // Notify parent when active heading changes
  useEffect(() => {
    if (!onActiveHeadingChange || tocItems.length === 0) return;
    const item = tocItems.find(i => i.id === activeId);
    onActiveHeadingChange(item?.title ?? '');
  }, [activeId, tocItems, onActiveHeadingChange]);

  // Scroll-based active section tracking
  useEffect(() => {
    if (tocItems.length === 0) return;
    const container = scrollContainer?.current;
    if (!container) return;

    const onScroll = () => {
      if (manualNavRef.current) return;
      const scrollTop       = container.scrollTop;
      const containerHeight = container.clientHeight;
      const isNearBottom    = container.scrollHeight - (scrollTop + containerHeight) < 60;

      if (isNearBottom) {
        setActiveId(tocItems[tocItems.length - 1].id);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const threshold = 80;
      let best = '';

      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - containerRect.top <= threshold) best = item.id;
      }

      if (best) setActiveId(best);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, [tocItems, scrollContainer]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    const container = scrollContainer?.current;
    if (!el || !container) return;
    manualNavRef.current = true;
    setActiveId(id);
    // -80px: land at activation threshold, not flush at top — prevents no-op when already near top
    const target = container.scrollTop + el.getBoundingClientRect().top - container.getBoundingClientRect().top - 80;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    setTimeout(() => { manualNavRef.current = false; }, 1000);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <List size={13} color="white" />
          </div>
          <span style={{
            fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {tt.title}
          </span>
        </div>
        <button onClick={onToggle} title="Close sidebar" style={{
          padding: '5px', borderRadius: '7px', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--text-tertiary)', transition: 'all .15s', display: 'flex', alignItems: 'center',
        }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {tocItems.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            <FileText size={28} style={{ margin: '0 auto 8px', opacity: .4 }} />
            <p style={{ margin: 0 }}>{tt.empty}</p>
          </div>
        ) : (
          tocItems.map((item, index) => {
            const isActive   = activeId === item.id;
            const isChild    = item.level > 2;
            const indent     = (item.level - 2) * 14;
            // h2 → '#', h3 → '##', h4 → '###'
            const hashLabel  = '#'.repeat(item.level - 1);
            // Strip "Sektor:" prefix for cleaner display
            const displayTitle = item.isSector
              ? item.title.replace(/^(sektor|sector):?\s*/i, '').trim()
              : item.title;

            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '7px',
                  width: '100%', textAlign: 'left',
                  padding: `5px 10px 5px ${10 + indent}px`,
                  borderRadius: '8px', border: 'none',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: item.level === 2 ? '13px' : '12px',
                  fontWeight: item.level === 2 ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1.45,
                  transition: 'all .15s',
                  borderLeft: isChild
                    ? `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`
                    : `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: '1px',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'var(--bg-hover)';
                    el.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'transparent';
                    el.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {/* Level indicator: '#' / '##' / '###' */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontStyle: 'normal',
                  fontSize: item.level === 2 ? '11px' : '10px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  flexShrink: 0,
                  lineHeight: 1.2,
                  marginTop: '2px',
                  letterSpacing: '1px',
                  opacity: isActive ? 1 : item.level === 2 ? 0.65 : item.level === 3 ? 0.45 : 0.3,
                  textShadow: isActive ? '0 0 8px var(--accent)' : 'none',
                  transition: 'opacity .15s, text-shadow .15s',
                  userSelect: 'none',
                  minWidth: item.level === 2 ? '11px' : item.level === 3 ? '22px' : '33px',
                }}>
                  {hashLabel}
                </span>
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {displayTitle}
                </span>
              </button>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          {tt.sections(tocItems.length)}
        </span>
      </div>
    </div>
  );
};

export default TableOfContents;
