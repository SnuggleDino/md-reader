import React, { useEffect, useState, useRef } from 'react';
import { Hash, List, ChevronRight, FileText } from 'lucide-react';

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

const TableOfContents: React.FC<TableOfContentsProps> = ({ markdownContent, onToggle, lang }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tt = toc18n[lang];

  // TOC aus Markdown parsen
  useEffect(() => {
    const headers = markdownContent.match(/^(#{1,4})\s+(.+?)(?=\s*$)/gm);
    if (!headers) { setTocItems([]); return; }

    const items: TocItem[] = headers
      .map(header => {
        const level = header.match(/^#+/)?.[0].length || 1;
        const title = header.replace(/^#+\s+/, '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return { id, title, level, isSector: title.toLowerCase().includes('sektor') };
      })
      .filter(item => item.level > 1);

    setTocItems(items);
  }, [markdownContent]);

  // Aktiven Abschnitt per IntersectionObserver tracken
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );
    tocItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [tocItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 1,
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
            fontSize: '12px', fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {tt.title}
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            padding: '5px', borderRadius: '7px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-tertiary)',
            transition: 'all .15s',
            display: 'flex', alignItems: 'center',
          }}
          title="Seitenleiste schließen"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav
        className="custom-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}
      >
        {tocItems.length === 0 ? (
          <div style={{
            padding: '2rem 1rem', textAlign: 'center',
            color: 'var(--text-tertiary)', fontSize: '13px',
          }}>
            <FileText size={28} style={{ margin: '0 auto 8px', opacity: .4 }} />
            <p style={{ margin: 0 }}>{tt.empty}</p>
          </div>
        ) : (
          tocItems.map((item, index) => {
            const isActive = activeId === item.id;
            const indent = (item.level - 2) * 12;
            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '7px',
                  width: '100%', textAlign: 'left',
                  padding: `6px 10px 6px ${10 + indent}px`,
                  borderRadius: '8px', border: 'none',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: item.level === 2 ? '13px' : '12px',
                  fontWeight: item.level === 2 ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1.45,
                  transition: 'all .15s',
                  borderLeft: isActive
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  marginBottom: '1px',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Hash
                  size={12}
                  style={{
                    flexShrink: 0, marginTop: '2px',
                    opacity: isActive ? 1 : 0.4,
                    color: isActive ? 'var(--accent)' : 'currentColor',
                  }}
                />
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {item.title}
                </span>
              </button>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '11px', color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}>
          {tt.sections(tocItems.length)}
        </span>
      </div>
    </div>
  );
};

export default TableOfContents;