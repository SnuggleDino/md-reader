import React, { useState, useEffect, useCallback, useRef } from 'react';
import MarkdownViewer from './components/MarkdownViewer';
import TableOfContents from './components/TableOfContents';
import {
  FileText, Moon, Monitor,
  Menu, AlertCircle, FolderOpen, ShieldAlert,
  ArrowLeft, ArrowRight, Search, X,
} from 'lucide-react';

declare global {
  interface Window {
    go: {
      main: {
        App: {
          OpenFileDialog(): Promise<string>;
          LoadMarkdownFile(path: string): Promise<string>;
          GetStartupFile(): Promise<string>;
          GetExampleMarkdown(): Promise<string>;
          OpenExternalLink(url: string): Promise<void>;
          DownloadAndLoadMd(url: string): Promise<string>;
          LoadRelativeMdFile(currentPath: string, relativePath: string): Promise<{ content: string; path: string }>;
        };
      };
    };
    runtime: any;
  }
}

type Theme = 'dark' | 'system';
type Lang  = 'de' | 'en';

// ── Vollständige Übersetzungen ────────────────────────────────────
const i18n: Record<Lang, Record<string, string>> = {
  de: {
    // App
    appName:          'MD-Reader',
    // Header-Buttons
    openFile:         'Datei öffnen',
    closeFile:        'Datei schließen',
    sidebarToggle:    'Seitenleiste umschalten',
    goBack:           'Zurück',
    goForward:        'Vor',
    // Suche
    search:           'Suchen…',
    // Theme
    themeDark:        'Dunkel',
    themeSystem:      'System',
    // Sprache
    langDE:           'Deutsch',
    langEN:           'English',
    // Modal — externer Link
    externalLink:     'Externer Link',
    leavingApp:       'Du verlässt die App und öffnest diesen Link im Browser.',
    openLink:         'Im Browser öffnen',
    // Modal — Markdown laden
    loadMarkdown:     'Markdown-Datei laden?',
    loadQuestion:     'Möchtest du diese Markdown-Datei laden?',
    loadFile:         'Laden',
    // Modal — allgemein
    cancel:           'Abbrechen',
    // Lade-Indikator
    loading:          'Lädt…',
    // Leerer Zustand
    noContent:        'Keine Datei geöffnet',
    dropHint:         'Datei hierher ziehen oder',
    // Fehlermeldungen
    fileError:        'Fehler beim Laden der Datei: ',
    linkError:        'Fehler beim Laden des Links: ',
  },
  en: {
    // App
    appName:          'MD-Reader',
    // Header-Buttons
    openFile:         'Open file',
    closeFile:        'Close file',
    sidebarToggle:    'Toggle sidebar',
    goBack:           'Back',
    goForward:        'Forward',
    // Suche
    search:           'Search…',
    // Theme
    themeDark:        'Dark',
    themeSystem:      'System',
    // Sprache
    langDE:           'Deutsch',
    langEN:           'English',
    // Modal — externer Link
    externalLink:     'External link',
    leavingApp:       'You are leaving the app and opening this link in your browser.',
    openLink:         'Open in browser',
    // Modal — Markdown laden
    loadMarkdown:     'Load Markdown file?',
    loadQuestion:     'Would you like to load this Markdown file?',
    loadFile:         'Load',
    // Modal — allgemein
    cancel:           'Cancel',
    // Lade-Indikator
    loading:          'Loading…',
    // Leerer Zustand
    noContent:        'No file open',
    dropHint:         'Drop a file here or',
    // Fehlermeldungen
    fileError:        'Error loading file: ',
    linkError:        'Error loading link: ',
  },
};

const App: React.FC = () => {
  const [markdown,     setMarkdown]     = useState<string>('');
  const [filePath,     setFilePath]     = useState<string>('');
  const [loading,      setLoading]      = useState<boolean>(true);
  const [wailsReady,   setWailsReady]   = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('md-reader-theme') as Theme;
    return (saved === 'dark' || saved === 'system') ? saved : 'dark';
  });

  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem('md-reader-lang') as Lang) || 'de'
  );

  const [showSidebar,  setShowSidebar]  = useState<boolean>(true);
  const [error,        setError]        = useState<string | null>(null);
  const [searchTerm,   setSearchTerm]   = useState<string>('');

  const contentRef     = useRef<HTMLDivElement>(null);
  const searchRef      = useRef<HTMLInputElement>(null);
  const langRef        = useRef<Lang>(lang); // aktueller lang-Wert für Callbacks

  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [history,      setHistory]      = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const didInit        = useRef(false);

  const [modalType,    setModalType]    = useState<'none' | 'external' | 'md-link'>('none');
  const [pendingUrl,   setPendingUrl]   = useState<string>('');

  // t() liest immer den aktuellen lang-Wert — kein Stale-Closure-Problem
  const t = useCallback((key: string) => i18n[lang][key] ?? key, [lang]);

  // langRef immer aktuell halten (für Callbacks, die lang nicht in deps haben)
  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Theme ─────────────────────────────────────────────────────
  useEffect(() => {
    // Immer dark — Light-Modus existiert nicht mehr
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('md-reader-theme', theme);
  }, [theme]);

  // ── Sprache speichern ─────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('md-reader-lang', lang);
  }, [lang]);

  // ── Scroll-Helfer ─────────────────────────────────────────────
  const saveCurrentScroll = useCallback(() => {
    if (contentRef.current && filePath)
      setScrollPositions(prev => ({ ...prev, [filePath]: contentRef.current?.scrollTop || 0 }));
  }, [filePath]);

  const restoreScroll = useCallback((path: string) => {
    setTimeout(() => {
      if (contentRef.current)
        contentRef.current.scrollTop = scrollPositions[path] || 0;
    }, 200);
  }, [scrollPositions]);

  // ── Datei laden ───────────────────────────────────────────────
  const loadFile = useCallback(async (path: string, addToHistory = true) => {
    if (!path || !window.go?.main?.App) return;
    saveCurrentScroll();
    setLoading(true);
    setError(null);
    try {
      const content = await window.go.main.App.LoadMarkdownFile(path);
      setMarkdown(content);
      setFilePath(path);
      if (addToHistory) {
        setHistory(prev => {
          const h = prev.slice(0, historyIndex + 1);
          h.push(path);
          return h;
        });
        setHistoryIndex(prev => prev + 1);
      }
      restoreScroll(path);
      document.title = `MD-Reader — ${path.split(/[/\\]/).pop()}`;
    } catch (err: any) {
      // langRef.current damit die Fehlermeldung immer in der aktuellen Sprache ist
      setError(i18n[langRef.current]['fileError'] + err.toString());
    } finally {
      setLoading(false);
    }
  }, [historyIndex, saveCurrentScroll, restoreScroll]);

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      loadFile(history[historyIndex - 1], false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      loadFile(history[historyIndex + 1], false);
    }
  };

  const closeFile = () => {
    setMarkdown('');
    setFilePath('');
    setHistory([]);
    setHistoryIndex(-1);
    document.title = 'MD-Reader';
  };

  // ── Link-Handler ──────────────────────────────────────────────
  const handleLinkClick = (href: string) => {
    if (href.startsWith('http')) {
      setPendingUrl(href);
      setModalType(href.endsWith('.md') ? 'md-link' : 'external');
    } else if (href.endsWith('.md')) {
      setPendingUrl(href);
      setModalType('md-link');
    }
  };

  const confirmExternalLink = () => {
    window.go.main.App.OpenExternalLink(pendingUrl);
    setModalType('none');
  };

  const confirmMdLink = async () => {
    setModalType('none');
    saveCurrentScroll();
    setLoading(true);
    try {
      if (pendingUrl.startsWith('http')) {
        const content = await window.go.main.App.DownloadAndLoadMd(pendingUrl);
        setMarkdown(content);
        setFilePath(pendingUrl);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), pendingUrl]);
        setHistoryIndex(prev => prev + 1);
        restoreScroll(pendingUrl);
      } else {
        const result = await window.go.main.App.LoadRelativeMdFile(filePath, pendingUrl);
        if (result) {
          setMarkdown(result.content);
          setFilePath(result.path);
          setHistory(prev => [...prev.slice(0, historyIndex + 1), result.path]);
          setHistoryIndex(prev => prev + 1);
          restoreScroll(result.path);
        }
      }
    } catch (err) {
      setError(i18n[langRef.current]['linkError'] + err);
    } finally {
      setLoading(false);
    }
  };

  // ── Wails init ────────────────────────────────────────────────
  useEffect(() => {
    const checkWails = setInterval(async () => {
      if (window.go?.main?.App && !didInit.current) {
        didInit.current = true;
        setWailsReady(true);
        clearInterval(checkWails);
        try {
          const startupPath = await window.go.main.App.GetStartupFile();
          if (startupPath) {
            const content = await window.go.main.App.LoadMarkdownFile(startupPath);
            setMarkdown(content);
            setFilePath(startupPath);
            setHistory([startupPath]);
            setHistoryIndex(0);
          } else {
            const example = await window.go.main.App.GetExampleMarkdown();
            setMarkdown(example);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }

        if (window.runtime) {
          window.runtime.EventsOn('wails:file-drop', (files: string[]) => {
            if (files?.length > 0) {
              window.go.main.App.LoadMarkdownFile(files[0]).then(c => {
                setMarkdown(c);
                setFilePath(files[0]);
              });
            }
          });
        }
      }
    }, 100);
    return () => clearInterval(checkWails);
  }, []);

  // ── Suche — Ctrl+F / Cmd+F ────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearchTerm('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {modalType !== 'none' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(0,0,0,.65)',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '18px',
            padding: '2rem',
            maxWidth: '420px', width: '100%',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }} className="animate-fade-in">

            {/* Icon + Titel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: modalType === 'external' ? 'rgba(245,158,11,.15)' : 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {modalType === 'external'
                  ? <ShieldAlert size={20} color="var(--warning)" />
                  : <FileText size={20} color="var(--accent)" />
                }
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {modalType === 'external' ? t('externalLink') : t('loadMarkdown')}
              </h3>
            </div>

            {/* Beschreibungstext */}
            <p style={{
              margin: '0 0 .75rem',
              color: 'var(--text-secondary)',
              fontSize: '14px', lineHeight: 1.6,
            }}>
              {modalType === 'external' ? t('leavingApp') : t('loadQuestion')}
            </p>

            {/* URL-Anzeige */}
            <p style={{
              margin: '0 0 1.5rem',
              padding: '8px 12px',
              background: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {pendingUrl}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setModalType('none')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '14px',
                  fontWeight: 500, fontFamily: 'var(--font-sans)',
                  transition: 'all .15s',
                }}
              >{t('cancel')}</button>
              <button
                onClick={modalType === 'external' ? confirmExternalLink : confirmMdLink}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: 'none',
                  background: modalType === 'external' ? 'var(--warning)' : 'var(--accent)',
                  color: '#fff', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all .15s',
                }}
              >
                {modalType === 'external' ? t('openLink') : t('loadFile')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header — 3-Spalten: [Links] [Mitte] [Rechts] ─────── */}
      <header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 14px',
        height: '48px',
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 20,
        userSelect: 'none',
      }}>

        {/* ── Links ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>

          {/* Sidebar-Toggle */}
          <button
            onClick={() => setShowSidebar(s => !s)}
            title={t('sidebarToggle')}
            style={{
              padding: '5px', borderRadius: '7px', border: 'none',
              background: showSidebar ? 'var(--accent-soft)' : 'transparent',
              color: showSidebar ? 'var(--accent)' : 'var(--text-tertiary)',
              cursor: 'pointer', transition: 'all .15s',
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            <Menu size={17} />
          </button>

          {/* Zurück / Vor */}
          <div style={{
            display: 'flex', background: 'var(--bg-subtle)',
            borderRadius: '8px', padding: '2px', gap: '1px', flexShrink: 0,
          }}>
            {([
              { fn: goBack,    icon: <ArrowLeft size={14} />,  off: historyIndex <= 0,                    label: t('goBack') },
              { fn: goForward, icon: <ArrowRight size={14} />, off: historyIndex >= history.length - 1,   label: t('goForward') },
            ] as any[]).map(({ fn, icon, off, label }, i) => (
              <button key={i} onClick={fn} disabled={off} title={label} style={{
                padding: '4px 6px', borderRadius: '6px', border: 'none',
                background: 'transparent',
                color: off ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                opacity: off ? .35 : 1,
                cursor: off ? 'not-allowed' : 'pointer',
                transition: 'all .15s',
                display: 'flex', alignItems: 'center',
              }}>{icon}</button>
            ))}
          </div>

          {/* Datei öffnen */}
          {wailsReady && (
            <button
              onClick={async () => {
                const p = await window.go.main.App.OpenFileDialog();
                if (p) loadFile(p);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 11px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: '#fff',
                cursor: 'pointer', flexShrink: 0,
                fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                boxShadow: '0 1px 6px var(--accent)55',
                transition: 'opacity .15s',
              }}
            >
              <FolderOpen size={13} />
              <span>{t('openFile')}</span>
            </button>
          )}

          {/* Dateiname-Pill */}
          {filePath && (
            <>
              <div style={{
                width: '1px', height: '18px',
                background: 'var(--border)', flexShrink: 0,
              }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 4px 4px 9px',
                background: 'var(--file-pill-bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                minWidth: 0, overflow: 'hidden', flexShrink: 1,
              }}>
                <FileText size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--file-pill-text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  letterSpacing: '0.01em',
                }}>
                  {filePath.split(/[/\\]/).pop()}
                </span>
                <button
                  onClick={closeFile}
                  title={t('closeFile')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '3px', marginLeft: '2px',
                    border: 'none', borderRadius: '5px',
                    background: 'transparent',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.15)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Mitte: Suchfeld ─────────────────────────────────── */}
        <div style={{ position: 'relative', width: '260px' }}>
          <div style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-tertiary)',
            display: 'flex',
          }}>
            <Search size={13} />
          </div>
          <input
            ref={searchRef}
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 28px 6px 30px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color .15s, background .15s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.background = 'var(--bg-hover)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.background = 'var(--bg-subtle)';
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute', right: '7px', top: '50%',
                transform: 'translateY(-50%)',
                padding: '2px', border: 'none', background: 'transparent',
                color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* ── Rechts: Sprache + Theme ──────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          justifyContent: 'flex-end',
        }}>

          {/* Sprach-Switcher */}
          <div style={{
            display: 'flex', background: 'var(--bg-subtle)',
            borderRadius: '8px', padding: '2px', gap: '1px',
          }}>
            {([
              { code: 'de' as Lang, label: 'DE', title: i18n.de.langDE },
              { code: 'en' as Lang, label: 'EN', title: i18n.de.langEN },
            ]).map(({ code, label, title }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                title={title}
                style={{
                  padding: '4px 8px', borderRadius: '6px', border: 'none',
                  background: lang === code ? 'var(--bg-hover)' : 'transparent',
                  color: lang === code ? 'var(--accent)' : 'var(--text-tertiary)',
                  cursor: 'pointer', fontSize: '11px',
                  fontWeight: lang === code ? 700 : 400,
                  fontFamily: 'var(--font-mono)',
                  boxShadow: lang === code ? 'var(--shadow-sm)' : 'none',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  transition: 'all .15s',
                }}
              >{label}</button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', background: 'var(--border)' }} />

          {/* Theme-Switcher */}
          <div style={{
            display: 'flex', background: 'var(--bg-subtle)',
            borderRadius: '8px', padding: '2px', gap: '1px',
          }}>
            {([
              { key: 'dark'   as Theme, icon: <Moon size={13} />,    label: t('themeDark') },
              { key: 'system' as Theme, icon: <Monitor size={13} />, label: t('themeSystem') },
            ]).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                title={label}
                style={{
                  padding: '4px 6px', borderRadius: '6px', border: 'none',
                  background: theme === key ? 'var(--bg-hover)' : 'transparent',
                  color: theme === key ? 'var(--accent)' : 'var(--text-tertiary)',
                  cursor: 'pointer', transition: 'all .15s',
                  boxShadow: theme === key ? 'var(--shadow-sm)' : 'none',
                  display: 'flex', alignItems: 'center',
                }}
              >{icon}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{
          width: showSidebar ? '260px' : '0',
          overflow: 'hidden', flexShrink: 0,
          transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        }}>
          {showSidebar && (
            <TableOfContents
              markdownContent={markdown}
              onToggle={() => setShowSidebar(false)}
              lang={lang}
            />
          )}
        </aside>

        {/* Content */}
        <main
          ref={contentRef}
          onScroll={saveCurrentScroll}
          className="custom-scrollbar"
          style={{
            flex: 1, overflowY: 'auto',
            background: 'var(--bg-base)',
            padding: '0 0 4rem',
          }}
        >
          {/* Fehlermeldung — dunkelmodusfähig */}
          {error && (
            <div style={{
              margin: '1.5rem', padding: '12px 16px',
              background: 'rgba(239,68,68,.12)',
              border: '1px solid rgba(239,68,68,.3)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
            </div>
          )}

          {/* Lade-Spinner */}
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '60vh', gap: '16px',
            }}>
              <div style={{
                width: '32px', height: '32px',
                border: '2.5px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
              }} className="animate-spin" />
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {t('loading')}
              </span>
            </div>

          /* Leerer Zustand */
          ) : !markdown ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '70vh', gap: '12px',
              userSelect: 'none',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '4px',
              }}>
                <FileText size={24} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('noContent')}
              </p>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
                {t('dropHint')}{' '}
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                  onClick={async () => {
                    if (wailsReady) {
                      const p = await window.go.main.App.OpenFileDialog();
                      if (p) loadFile(p);
                    }
                  }}
                >
                  {t('openFile')}
                </span>
              </p>
            </div>

          /* Markdown-Inhalt */
          ) : (
            <MarkdownViewer content={markdown} onLinkClick={handleLinkClick} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;