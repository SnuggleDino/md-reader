import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import MarkdownViewer from './components/MarkdownViewer';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import { useSettings } from './context/SettingsContext';
import {
  FileText, Menu, AlertCircle, FolderOpen, ShieldAlert,
  ArrowLeft, ArrowRight, Search, X, Clock, Type,
  ZoomIn, ZoomOut, History, Settings,
} from 'lucide-react';

// ── Wails global types ────────────────────────────────────
declare global {
  interface Window {
    go: { main: { App: {
      OpenFileDialog(): Promise<string>;
      LoadMarkdownFile(path: string): Promise<string>;
      GetStartupFile(): Promise<string>;
      GetExampleMarkdown(): Promise<string>;
      OpenExternalLink(url: string): Promise<void>;
      DownloadAndLoadMd(url: string): Promise<string>;
      LoadRelativeMdFile(currentPath: string, relativePath: string): Promise<{ content: string; path: string }>;
    }}};
    runtime: any;
  }
}

type Lang = 'de' | 'en';
const RECENT_FILES_KEY = 'md-reader-recent-files';
const MAX_RECENT = 8;

// ── i18n ──────────────────────────────────────────────────
const i18n: Record<Lang, Record<string, string>> = {
  de: {
    openFile: 'Datei öffnen', sidebarToggle: 'Seitenleiste',
    goBack: 'Zurück', goForward: 'Vor', search: 'Suchen…',
    externalLink: 'Externer Link', leavingApp: 'Du verlässt die App und öffnest diesen Link im Browser.',
    openLink: 'Im Browser öffnen', loadMarkdown: 'Markdown-Datei laden?',
    loadQuestion: 'Möchtest du diese Markdown-Datei laden?', loadFile: 'Laden',
    cancel: 'Abbrechen', loading: 'Lädt…',
    fileError: 'Fehler beim Laden der Datei: ', linkError: 'Fehler beim Laden des Links: ',
    recentFiles: 'Zuletzt geöffnet', noRecentFiles: 'Noch keine Dateien geöffnet',
    zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', zoomReset: 'Zoom zurücksetzen',
    readingTime: 'Min. Lesezeit', clearRecent: 'Verlauf löschen',
    welcomeTitle: 'Willkommen beim MD-Reader', welcomeSub: 'Dein schneller, sauberer Markdown-Viewer',
    welcomeHint: 'Öffne eine Datei über den Button, per Drag & Drop oder Doppelklick aus dem Explorer.',
    settings: 'Einstellungen',
  },
  en: {
    openFile: 'Open file', sidebarToggle: 'Sidebar',
    goBack: 'Back', goForward: 'Forward', search: 'Search…',
    externalLink: 'External link', leavingApp: 'You are leaving the app and opening this link in your browser.',
    openLink: 'Open in browser', loadMarkdown: 'Load Markdown file?',
    loadQuestion: 'Would you like to load this Markdown file?', loadFile: 'Load',
    cancel: 'Cancel', loading: 'Loading…',
    fileError: 'Error loading file: ', linkError: 'Error loading link: ',
    recentFiles: 'Recently opened', noRecentFiles: 'No files opened yet',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', zoomReset: 'Reset zoom',
    readingTime: 'min read', clearRecent: 'Clear history',
    welcomeTitle: 'Welcome to MD-Reader', welcomeSub: 'Your fast, clean Markdown viewer',
    welcomeHint: 'Open a file via the button, drag & drop, or double-click from Explorer.',
    settings: 'Settings',
  },
};

// ── Helpers ───────────────────────────────────────────────
function getWordCount(md: string): number {
  return md.replace(/```[\s\S]*?```/g,'').replace(/`[^`]+`/g,'').replace(/^#{1,6}\s+/gm,'').replace(/[*_~[\]()#>|!]/g,'').trim().split(/\s+/).filter(Boolean).length;
}
function getReadingMinutes(words: number) { return Math.max(1, Math.round(words / 200)); }
function loadRecentFiles(): string[] { try { return JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]'); } catch { return []; } }
function saveRecentFiles(files: string[]) { localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files)); }
function addRecentFile(path: string): string[] { const next = [path, ...loadRecentFiles().filter(f => f !== path)].slice(0, MAX_RECENT); saveRecentFiles(next); return next; }
const getFileName = (p: string) => p.split(/[/\\]/).pop() || p;
const getFileDir  = (p: string) => { const a = p.split(/[/\\]/); a.pop(); return a.join('/') || p; };

// ── Tab type ──────────────────────────────────────────────
interface Tab { path: string; content: string; scrollY: number; }

// ── Tab Bar ───────────────────────────────────────────────
const TabBar: React.FC<{
  tabs: Tab[];
  activeIndex: number;
  showSettings: boolean;
  onSelect: (i: number) => void;
  onClose: (i: number) => void;
  onSettingsClick: () => void;
  settingsLabel: string;
}> = React.memo(({ tabs, activeIndex, showSettings, onSelect, onClose, onSettingsClick, settingsLabel }) => {

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '0 8px 0 12px', height: '32px',
    borderRadius: '8px 8px 0 0', flexShrink: 0,
    cursor: 'pointer', userSelect: 'none',
    background: active ? 'var(--bg-surface)' : 'transparent',
    border: active ? '1px solid var(--border)' : '1px solid transparent',
    borderBottom: active ? '1px solid var(--bg-surface)' : '1px solid transparent',
    marginBottom: active ? '-1px' : '0',
    transition: 'background .12s',
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0, height: '36px',
      paddingLeft: '4px',
    }}>

      {/* ── File tabs (scrollable) ──────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        overflowX: 'auto', overflowY: 'hidden',
        flex: 1, height: '100%',
        scrollbarWidth: 'none',
      }}>
        {tabs.map((tab, i) => {
          const active = i === activeIndex && !showSettings;
          return (
            <div
              key={`${tab.path}-${i}`}
              onClick={() => onSelect(i)}
              title={tab.path}
              style={{ ...tabStyle(active), maxWidth: '210px', minWidth: '80px' }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <FileText size={12} style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0 }} />
              <span style={{
                fontSize: '12px', fontFamily: 'var(--font-mono)',
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: active ? 500 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1, minWidth: 0,
              }}>
                {getFileName(tab.path)}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onClose(i); }}
                title="Close tab"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', border: 'none', borderRadius: '4px', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'all .12s', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Separator (only when file tabs exist) ──────── */}
      {tabs.length > 0 && (
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0, alignSelf: 'center', margin: '0 2px' }} />
      )}

      {/* ── Settings tab (pinned right, same style) ─────── */}
      <div
        onClick={onSettingsClick}
        title={`${settingsLabel} (Ctrl+,)`}
        style={{ ...tabStyle(showSettings), minWidth: '100px', maxWidth: '140px', paddingRight: '14px', flexShrink: 0 }}
        onMouseEnter={e => { if (!showSettings) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={e => { if (!showSettings) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <Settings size={12} style={{ color: showSettings ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0 }} />
        <span style={{
          fontSize: '12px', fontFamily: 'var(--font-sans)',
          color: showSettings ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontWeight: showSettings ? 500 : 400,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          flex: 1, minWidth: 0,
        }}>
          {settingsLabel}
        </span>
      </div>
    </div>
  );
});

// ── Homescreen ────────────────────────────────────────────
const Homescreen: React.FC<{ t: (k: string) => string; wailsReady: boolean; onOpenFile: () => void; onLoadFile: (p: string) => void; }> = React.memo(({ t, wailsReady, onOpenFile, onLoadFile }) => {
  const [recentFiles, setRecentFiles] = useState<string[]>(loadRecentFiles);
  const clearRecent = () => { saveRecentFiles([]); setRecentFiles([]); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem 2rem', userSelect: 'none' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-accent)', marginBottom: '1.5rem', flexShrink: 0 }}>
        <FileText size={34} color="white" />
      </div>
      <h1 style={{ margin: '0 0 .4rem', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', textAlign: 'center' }}>{t('welcomeTitle')}</h1>
      <p style={{ margin: '0 0 .5rem', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>{t('welcomeSub')}</p>
      <p style={{ margin: '0 0 2.5rem', fontSize: '12.5px', color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>{t('welcomeHint')}</p>
      {wailsReady && (
        <button onClick={onOpenFile}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, fontFamily: 'var(--font-sans)', boxShadow: 'var(--glow-accent)', transition: 'opacity .15s', marginBottom: '2.5rem' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        ><FolderOpen size={15} />{t('openFile')}</button>
      )}
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <History size={13} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-sans)' }}>{t('recentFiles')}</span>
          </div>
          {recentFiles.length > 0 && (
            <button onClick={clearRecent} style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>{t('clearRecent')}</button>
          )}
        </div>
        {recentFiles.length === 0 ? (
          <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>{t('noRecentFiles')}</div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {recentFiles.map((path, i) => (
              <button key={path} onClick={() => onLoadFile(path)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', borderBottom: i < recentFiles.length - 1 ? '1px solid var(--border)' : 'none', background: 'transparent', cursor: 'pointer', transition: 'background .12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <FileText size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getFileName(path)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>{getFileDir(path)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ── Progress Bar ──────────────────────────────────────────
const ReadingProgressBar: React.FC<{ contentRef: React.RefObject<HTMLDivElement> }> = ({ contentRef }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = contentRef.current; if (!el) return;
    const onScroll = () => { const total = el.scrollHeight - el.clientHeight; setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0); };
    el.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [contentRef]);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--border)', zIndex: 30 }}>
      <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', transition: 'width .1s linear', borderRadius: '0 2px 2px 0', boxShadow: 'var(--glow-accent)' }} />
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────
const App: React.FC = () => {
  const { settings } = useSettings();
  const [tabs, setTabs]               = useState<Tab[]>([]);
  const [activeTab, setActiveTab]     = useState<number>(-1);
  const [loading, setLoading]         = useState<boolean>(true);
  const [wailsReady, setWailsReady]   = useState<boolean>(false);
  const [error, setError]             = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState<string>('');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('md-reader-lang') as Lang) || 'de');
  const [fontSize, setFontSize] = useState<number>(() => Number(localStorage.getItem('md-reader-fontsize') || '16'));
  const [recentFiles, setRecentFiles] = useState<string[]>(loadRecentFiles);
  const [modalType, setModalType]     = useState<'none' | 'external' | 'md-link'>('none');
  const [pendingUrl, setPendingUrl]   = useState<string>('');

  const contentRef  = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);
  const langRef     = useRef<Lang>(lang);
  const didInit     = useRef(false);

  // ── Debounced scroll save ─────────────────────────────
  const scrollDebounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedScrollRef = useRef<number>(-1);

  // ── Nav history refs (stale-closure safe) ────────────
  const [navHistory, setNavHistory]           = useState<number[]>([]);
  const [navHistoryIndex, setNavHistoryIndex] = useState<number>(-1);
  const navHistRef   = useRef<number[]>([]);
  const navIdxRef    = useRef<number>(-1);
  const tabsRef      = useRef<Tab[]>([]);
  const activeTabRef = useRef<number>(-1);

  useEffect(() => { navHistRef.current   = navHistory;      }, [navHistory]);
  useEffect(() => { navIdxRef.current    = navHistoryIndex; }, [navHistoryIndex]);
  useEffect(() => { tabsRef.current      = tabs;            }, [tabs]);
  useEffect(() => { activeTabRef.current = activeTab;       }, [activeTab]);
  useEffect(() => { langRef.current      = lang;            }, [lang]);

  const t = useCallback((key: string) => i18n[lang][key] ?? key, [lang]);

  const currentTab     = activeTab >= 0 && activeTab < tabs.length ? tabs[activeTab] : null;
  const markdown       = currentTab?.content ?? '';
  const filePath       = currentTab?.path ?? '';
  const wordCount      = useMemo(() => getWordCount(markdown), [markdown]);
  const readingMinutes = useMemo(() => getReadingMinutes(wordCount), [wordCount]);

  // ── Boot ──────────────────────────────────────────────
  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  useEffect(() => { localStorage.setItem('md-reader-lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('md-reader-fontsize', String(fontSize)); document.documentElement.style.fontSize = `${fontSize}px`; }, [fontSize]);

  const changeFontSize = (d: number) => setFontSize(p => Math.min(24, Math.max(12, p + d)));
  const resetFontSize  = () => setFontSize(16);

  // ── Debounced scroll (150ms, 2px threshold) ───────────
  const saveScrollForActive = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      const idx = activeTabRef.current;
      if (idx < 0 || !contentRef.current) return;
      const scrollY = contentRef.current.scrollTop;
      if (Math.abs(scrollY - lastSavedScrollRef.current) < 2) return;
      lastSavedScrollRef.current = scrollY;
      setTabs(prev => prev.map((tab, i) => i === idx ? { ...tab, scrollY } : tab));
    }, 150);
  }, []);

  useEffect(() => { lastSavedScrollRef.current = -1; }, [activeTab]);

  // ── Load file ─────────────────────────────────────────
  const loadFile = useCallback(async (path: string, addToNav = true) => {
    if (!path || !window.go?.main?.App) return;
    setShowSettings(false);
    setLoading(true); setError(null);
    try {
      const content = await window.go.main.App.LoadMarkdownFile(path);
      setTabs(prevTabs => {
        const existingIdx = prevTabs.findIndex(t => t.path === path);
        let targetIdx: number, nextTabs: Tab[];
        if (existingIdx >= 0) { nextTabs = prevTabs.map((t, i) => i === existingIdx ? { ...t, content } : t); targetIdx = existingIdx; }
        else { nextTabs = [...prevTabs, { path, content, scrollY: 0 }]; targetIdx = nextTabs.length - 1; }
        setActiveTab(targetIdx);
        if (addToNav) { const h = [...navHistRef.current.slice(0, navIdxRef.current + 1), targetIdx]; setNavHistory(h); setNavHistoryIndex(h.length - 1); }
        setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = nextTabs[targetIdx]?.scrollY || 0; }, 60);
        document.title = `MD-Reader — ${getFileName(path)}`;
        return nextTabs;
      });
      setRecentFiles(addRecentFile(path));
    } catch (err: any) { setError(i18n[langRef.current]['fileError'] + err.toString()); }
    finally { setLoading(false); }
  }, []);

  // ── Navigation ────────────────────────────────────────
  const goBack = useCallback(() => {
    const idx = navIdxRef.current, hist = navHistRef.current;
    if (idx <= 0) return;
    const prev = hist[idx - 1];
    setShowSettings(false);
    setNavHistoryIndex(idx - 1); setActiveTab(prev);
    document.title = `MD-Reader — ${getFileName(tabsRef.current[prev]?.path || '')}`;
    setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = tabsRef.current[prev]?.scrollY || 0; }, 60);
  }, []);

  const goForward = useCallback(() => {
    const idx = navIdxRef.current, hist = navHistRef.current;
    if (idx >= hist.length - 1) return;
    const next = hist[idx + 1];
    setShowSettings(false);
    setNavHistoryIndex(idx + 1); setActiveTab(next);
    document.title = `MD-Reader — ${getFileName(tabsRef.current[next]?.path || '')}`;
    setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = tabsRef.current[next]?.scrollY || 0; }, 60);
  }, []);

  const selectTab = useCallback((tabIdx: number) => {
    setShowSettings(false);
    setActiveTab(tabIdx);
    const h = [...navHistRef.current.slice(0, navIdxRef.current + 1), tabIdx];
    setNavHistory(h); setNavHistoryIndex(h.length - 1);
    document.title = `MD-Reader — ${getFileName(tabsRef.current[tabIdx]?.path || '')}`;
    setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = tabsRef.current[tabIdx]?.scrollY || 0; }, 60);
  }, []);

  const closeTab = useCallback((tabIdx: number) => {
    setTabs(prev => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, i) => i !== tabIdx);
      if (next.length === 0) { setActiveTab(-1); setNavHistory([]); setNavHistoryIndex(-1); document.title = 'MD-Reader'; return next; }
      setActiveTab(cur => cur === tabIdx ? Math.max(0, tabIdx - 1) : cur > tabIdx ? cur - 1 : cur);
      setNavHistory(h => { const r = h.map(i => i === tabIdx ? -1 : i > tabIdx ? i - 1 : i).filter(i => i >= 0); setNavHistoryIndex(ri => Math.max(-1, Math.min(ri, r.length - 1))); return r; });
      return next;
    });
  }, []);

  // ── Link handler ──────────────────────────────────────
  const handleLinkClick = useCallback((href: string) => {
    if (href.startsWith('http')) { setPendingUrl(href); setModalType(href.endsWith('.md') ? 'md-link' : 'external'); }
    else if (href.endsWith('.md')) { setPendingUrl(href); setModalType('md-link'); }
  }, []);

  const confirmExternalLink = () => { window.go.main.App.OpenExternalLink(pendingUrl); setModalType('none'); };
  const confirmMdLink = async () => {
    setModalType('none'); setLoading(true);
    try {
      if (pendingUrl.startsWith('http')) {
        const content = await window.go.main.App.DownloadAndLoadMd(pendingUrl);
        setTabs(prev => {
          const idx = prev.findIndex(t => t.path === pendingUrl);
          let next: Tab[], target: number;
          if (idx >= 0) { next = prev.map((t, i) => i === idx ? { ...t, content } : t); target = idx; }
          else { next = [...prev, { path: pendingUrl, content, scrollY: 0 }]; target = next.length - 1; }
          setActiveTab(target);
          setNavHistory(h => { const nh = [...h.slice(0, navIdxRef.current + 1), target]; setNavHistoryIndex(nh.length - 1); return nh; });
          document.title = `MD-Reader — ${getFileName(pendingUrl)}`;
          return next;
        });
        setRecentFiles(addRecentFile(pendingUrl));
      } else {
        const result = await window.go.main.App.LoadRelativeMdFile(filePath, pendingUrl);
        if (result) await loadFile(result.path, true);
      }
    } catch (err) { setError(i18n[langRef.current]['linkError'] + err); }
    finally { setLoading(false); }
  };

  const openFileDialog = async () => { if (!wailsReady) return; const p = await window.go.main.App.OpenFileDialog(); if (p) loadFile(p, true); };

  // ── Wails init ────────────────────────────────────────
  useEffect(() => {
    const check = setInterval(async () => {
      if (window.go?.main?.App && !didInit.current) {
        didInit.current = true; setWailsReady(true); clearInterval(check);
        try { const sp = await window.go.main.App.GetStartupFile(); if (sp) await loadFile(sp, true); }
        catch (e) { console.error(e); } finally { setLoading(false); }
        if (window.runtime) window.runtime.EventsOn('wails:file-drop', async (files: string[]) => { for (const f of files) await loadFile(f, true); });
      }
    }, 100);
    return () => clearInterval(check);
  }, [loadFile]);

  // ── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'f')                    { e.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); }
      if (e.key === 'Escape') {
        if (showSettings) { setShowSettings(false); return; }
        if (document.activeElement === searchRef.current) { setSearchTerm(''); searchRef.current?.blur(); }
      }
      if (ctrl && (e.key === '+' || e.key === '=')) { e.preventDefault(); changeFontSize(1); }
      if (ctrl && e.key === '-')                    { e.preventDefault(); changeFontSize(-1); }
      if (ctrl && e.key === '0')                    { e.preventDefault(); resetFontSize(); }
      if (ctrl && e.key === ',')                    { e.preventDefault(); setShowSettings(s => !s); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSettings]);

  const canGoBack    = navHistoryIndex > 0;
  const canGoForward = navHistoryIndex < navHistory.length - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', position: 'relative' }}>

      {settings.showProgressBar && markdown && !showSettings && <ReadingProgressBar contentRef={contentRef} />}

      {/* ── Modal ────────────────────────────────────────── */}
      {modalType !== 'none' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)' }}>
          <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: '18px', padding: '2rem', maxWidth: '420px', width: '100%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: modalType === 'external' ? 'rgba(245,158,11,.15)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {modalType === 'external' ? <ShieldAlert size={20} color="var(--warning)" /> : <FileText size={20} color="var(--accent)" />}
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{modalType === 'external' ? t('externalLink') : t('loadMarkdown')}</h3>
            </div>
            <p style={{ margin: '0 0 .75rem', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{modalType === 'external' ? t('leavingApp') : t('loadQuestion')}</p>
            <p style={{ margin: '0 0 1.5rem', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingUrl}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setModalType('none')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-sans)', transition: 'all .15s' }}>{t('cancel')}</button>
              <button onClick={modalType === 'external' ? confirmExternalLink : confirmMdLink} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: modalType === 'external' ? 'var(--warning)' : 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'all .15s' }}>
                {modalType === 'external' ? t('openLink') : t('loadFile')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 14px', height: '48px', flexShrink: 0, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', zIndex: 20, userSelect: 'none', marginTop: '2px' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <button onClick={() => setShowSidebar(s => !s)} title={t('sidebarToggle')}
            style={{ padding: '5px', borderRadius: '7px', border: 'none', background: showSidebar ? 'var(--accent-soft)' : 'transparent', color: showSidebar ? 'var(--accent)' : 'var(--text-tertiary)', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Menu size={17} />
          </button>

          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '2px', gap: '1px', flexShrink: 0 }}>
            {([
              { fn: goBack,    icon: <ArrowLeft size={14} />,  off: !canGoBack,    label: t('goBack')    },
              { fn: goForward, icon: <ArrowRight size={14} />, off: !canGoForward, label: t('goForward') },
            ] as any[]).map(({ fn, icon, off, label }, i) => (
              <button key={i} onClick={fn} disabled={off} title={label} style={{ padding: '4px 6px', borderRadius: '6px', border: 'none', background: 'transparent', color: off ? 'var(--text-tertiary)' : 'var(--text-secondary)', opacity: off ? .35 : 1, cursor: off ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center' }}>{icon}</button>
            ))}
          </div>

          {wailsReady && (
            <button onClick={openFileDialog}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', flexShrink: 0, fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-sans)', boxShadow: 'var(--glow-accent)', transition: 'opacity .15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><FolderOpen size={13} /><span>{t('openFile')}</span></button>
          )}
        </div>

        {/* Center: Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-tertiary)', display: 'flex' }}><Search size={13} /></div>
          <input ref={searchRef} type="text" placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '6px 28px 6px 30px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12.5px', fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color .15s, background .15s' }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--bg-hover)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-subtle)'; }}
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', padding: '2px', border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          {markdown && !showSettings && (settings.showWordCount || settings.showReadingTime) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', flexShrink: 0 }}>
              {settings.showWordCount && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Type size={11} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{wordCount.toLocaleString()}</span></div>}
              {settings.showWordCount && settings.showReadingTime && <div style={{ width: '1px', height: '10px', background: 'var(--border)' }} />}
              {settings.showReadingTime && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{readingMinutes} {t('readingTime')}</span></div>}
            </div>
          )}

          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '2px', gap: '1px', flexShrink: 0 }}>
            {([
              { fn: () => changeFontSize(-1), icon: <ZoomOut size={13} />, label: t('zoomOut') },
              { fn: resetFontSize, icon: <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fontSize}</span>, label: t('zoomReset') },
              { fn: () => changeFontSize(1),  icon: <ZoomIn size={13} />,  label: t('zoomIn') },
            ] as any[]).map(({ fn, icon, label }, i) => (
              <button key={i} onClick={fn} title={label} style={{ padding: '4px 7px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >{icon}</button>
            ))}
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '2px', gap: '1px' }}>
            {(['de', 'en'] as Lang[]).map(code => (
              <button key={code} onClick={() => setLang(code)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: lang === code ? 'var(--bg-hover)' : 'transparent', color: lang === code ? 'var(--accent)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: '11px', fontWeight: lang === code ? 700 : 400, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all .15s' }}>{code}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Tab Bar ──*/}
      <TabBar
        tabs={tabs}
        activeIndex={activeTab}
        showSettings={showSettings}
        onSelect={selectTab}
        onClose={closeTab}
        onSettingsClick={() => setShowSettings(s => !s)}
        settingsLabel={t('settings')}
      />

      {/* ── Body ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar — hidden when settings open */}
        {!showSettings && (
          <aside style={{ width: showSidebar ? `${settings.sidebarWidth}px` : '0', overflow: 'hidden', flexShrink: 0, transition: 'width .25s cubic-bezier(.4,0,.2,1)' }}>
            {showSidebar && <TableOfContents markdownContent={markdown} onToggle={() => setShowSidebar(false)} lang={lang} />}
          </aside>
        )}

        <main
          ref={contentRef}
          onScroll={saveScrollForActive}
          className="custom-scrollbar"
          style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)', padding: '0 0 4rem' }}
        >
          {/* Settings page replaces content area */}
          {showSettings ? (
            <SettingsPanel onClose={() => setShowSettings(false)} lang={lang} />
          ) : (
            <>
              {error && (
                <div style={{ margin: '1.5rem', padding: '12px 16px', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
                </div>
              )}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{t('loading')}</span>
                </div>
              ) : !markdown ? (
                <Homescreen t={t} wailsReady={wailsReady} onOpenFile={openFileDialog} onLoadFile={p => loadFile(p, true)} />
              ) : (
                <MarkdownViewer content={markdown} onLinkClick={handleLinkClick} searchTerm={searchTerm} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;