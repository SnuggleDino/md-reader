import React, { useState } from 'react';
import {
  Palette, Type, Layout, BookOpen, Monitor, Keyboard, Info,
  RotateCcw, Sparkles, ExternalLink, ChevronRight,
} from 'lucide-react';
import { useSettings, AppSettings } from '../context/SettingsContext';

type Lang = 'de' | 'en';
type TabKey = 'appearance' | 'typography' | 'layout' | 'reading' | 'interface' | 'shortcuts' | 'about';
interface SettingsPanelProps { onClose: () => void; lang: Lang; }

// ── i18n ──────────────────────────────────────────────────
const L: Record<Lang, Record<string, string>> = {
  de: {
    title: 'Einstellungen',
    reset: 'Zurücksetzen',

    appearance: 'Erscheinungsbild',
    appearanceDesc: 'Farben, Leuchteffekte und Eckenradius der Oberfläche.',
    typography: 'Typografie',
    typografieDesc: 'Schriftarten, Zeilenhöhe und Code-Darstellung.',
    layout: 'Layout',
    layoutDesc: 'Inhaltsbreite und Sidebar-Größe.',
    reading: 'Lesemodus',
    readingDesc: 'Anzeige-Elemente und Lese-Features.',
    interface: 'Oberfläche',
    interfaceDesc: 'Header, Animationen und weitere UI-Einstellungen.',
    shortcuts: 'Tastenkürzel',
    shortcutsDesc: 'Alle Tastaturkürzel auf einen Blick.',
    about: 'Info',
    aboutDesc: 'Version, Tech-Stack und Lizenz.',

    accentColor: 'Akzentfarbe',
    accentColorDesc: 'Hauptfarbe für Buttons, Links und Highlights.',
    accentGlow: 'Akzent-Glow',
    accentGlowDesc: 'Leuchthalo um akzentuierte Elemente.',
    glowStrength: 'Glow-Stärke',
    highlightColor: 'Suchmarkierung',
    highlightColorDesc: 'Farbe der Treffer beim Suchen.',
    codeBackground: 'Code-Hintergrund',
    codeBackgroundDesc: 'Hintergrundfarbe für Code-Blöcke.',
    borderRadius: 'Eckenradius',
    borderRadiusDesc: 'Rundung von UI-Elementen.',
    sharp: 'Eckig', default: 'Standard', rounded: 'Rund',

    fontFamily: 'Schriftart',
    fontFamilyDesc: 'Schrift für Text und UI.',
    headingFont: 'Überschriften-Schrift',
    headingFontDesc: 'Schrift speziell für h1–h4 Überschriften.',
    fontSans: 'Sans-Serif', fontSerif: 'Serif',
    codeFontSize: 'Code-Schriftgröße',
    codeFontSizeDesc: 'Schriftgröße in Code-Blöcken.',
    lineHeight: 'Zeilenhöhe',
    lineHeightDesc: 'Abstand zwischen Textzeilen.',
    paragraphSpacing: 'Absatzabstand',
    compact: 'Kompakt', relaxed: 'Locker',

    contentWidth: 'Inhaltsbreite',
    contentWidthDesc: 'Maximale Breite des Textinhalts.',
    narrow: 'Schmal', wide: 'Breit', full: 'Voll',
    sidebarWidth: 'Sidebar-Breite',
    sidebarWidthDesc: 'Breite der Inhaltsverzeichnis-Sidebar.',

    showWordCount: 'Wörteranzahl anzeigen',
    showWordCountDesc: 'Zeigt die Wortanzahl im Header.',
    showReadingTime: 'Lesezeit anzeigen',
    showReadingTimeDesc: 'Geschätzte Minuten im Header.',
    showProgressBar: 'Fortschrittsbalken',
    showProgressBarDesc: '2px-Balken oben zeigt Scroll-Fortschritt.',
    tocOpenByDefault: 'TOC standardmäßig offen',
    tocOpenByDefaultDesc: 'Sidebar beim Start automatisch einblenden.',
    sektorBlocks: 'Sektor-Blöcke',
    sektorBlocksDesc: 'Überschriften mit "Sektor:" oder "Sector:" als Karten rendern.',

    compactHeader: 'Kompakter Header',
    compactHeaderDesc: 'Reduziert die Header-Höhe auf 36px.',
    animations: 'Animationen',
    animationsDesc: 'Sanfte Übergänge und Einblend-Effekte.',
    autoReload: 'Auto-Reload',
    autoReloadDesc: 'Datei automatisch neu laden, wenn sie extern geändert wird.',

    subtle: 'Subtil', medium: 'Mittel', strong: 'Stark',
    on: 'An', off: 'Aus',

    previewHeading: 'Markdown ist fantastisch',
    previewBody: 'Der schnelle Fuchs springt über den faulen Hund. Einfach und wirkungsvoll.',

    shortcutSearch: 'Suchleiste fokussieren',
    shortcutSettings: 'Einstellungen öffnen/schließen',
    shortcutZoomIn: 'Schrift vergrößern',
    shortcutZoomOut: 'Schrift verkleinern',
    shortcutZoomReset: 'Zoom zurücksetzen',
    shortcutEscape: 'Schließen / Suche leeren',
    shortcutOpenFile: 'Datei-Dialog öffnen',
    shortcutFocus: 'Fokus-Modus ein/aus',
    shortcutHome: 'Startseite anzeigen',
    shortcutScrollTop: 'Zum Seitenanfang',
    shortcutJump: 'Quick-Jump öffnen',
    shortcutNextTab: 'Nächster Tab',
    shortcutPrevTab: 'Vorheriger Tab',

    aboutVersion: 'Version',
    aboutBuiltWith: 'Entwickelt mit',
    aboutLicense: 'Lizenz',
    aboutMIT: 'MIT License',
    aboutGithub: 'GitHub Repository',
    aboutDescription: 'Ein schneller, sauberer Desktop-Markdown-Viewer für Entwickler und Autoren.',
  },
  en: {
    title: 'Settings',
    reset: 'Reset all',

    appearance: 'Appearance',
    appearanceDesc: 'Colors, glow effects and border radius of the UI.',
    typography: 'Typography',
    typografieDesc: 'Fonts, line height and code display.',
    layout: 'Layout',
    layoutDesc: 'Content width and sidebar size.',
    reading: 'Reading',
    readingDesc: 'Display elements and reading features.',
    interface: 'Interface',
    interfaceDesc: 'Header, animations and other UI settings.',
    shortcuts: 'Shortcuts',
    shortcutsDesc: 'All keyboard shortcuts at a glance.',
    about: 'About',
    aboutDesc: 'Version, tech stack and license.',

    accentColor: 'Accent color',
    accentColorDesc: 'Main color for buttons, links and highlights.',
    accentGlow: 'Accent glow',
    accentGlowDesc: 'Glow halo around accented elements.',
    glowStrength: 'Glow strength',
    highlightColor: 'Search highlight',
    highlightColorDesc: 'Color of search matches.',
    codeBackground: 'Code background',
    codeBackgroundDesc: 'Background color for code blocks.',
    borderRadius: 'Border radius',
    borderRadiusDesc: 'Roundness of UI elements.',
    sharp: 'Sharp', default: 'Default', rounded: 'Rounded',

    fontFamily: 'Font family',
    fontFamilyDesc: 'Font used for text and UI.',
    headingFont: 'Heading font',
    headingFontDesc: 'Font specifically for h1–h4 headings.',
    fontSans: 'Sans-Serif', fontSerif: 'Serif',
    codeFontSize: 'Code font size',
    codeFontSizeDesc: 'Font size inside code blocks.',
    lineHeight: 'Line height',
    lineHeightDesc: 'Spacing between lines of text.',
    paragraphSpacing: 'Paragraph spacing',
    compact: 'Compact', relaxed: 'Relaxed',

    contentWidth: 'Content width',
    contentWidthDesc: 'Maximum width of the text content.',
    narrow: 'Narrow', wide: 'Wide', full: 'Full',
    sidebarWidth: 'Sidebar width',
    sidebarWidthDesc: 'Width of the table of contents sidebar.',

    showWordCount: 'Show word count',
    showWordCountDesc: 'Displays word count in the header.',
    showReadingTime: 'Show reading time',
    showReadingTimeDesc: 'Estimated minutes in the header.',
    showProgressBar: 'Progress bar',
    showProgressBarDesc: '2px bar at top shows scroll progress.',
    tocOpenByDefault: 'TOC open by default',
    tocOpenByDefaultDesc: 'Auto-show sidebar on launch.',
    sektorBlocks: 'Sector blocks',
    sektorBlocksDesc: 'Render headings with "Sector:" or "Sektor:" as cards.',

    compactHeader: 'Compact header',
    compactHeaderDesc: 'Reduces the header height to 36px.',
    animations: 'Animations',
    animationsDesc: 'Smooth transitions and fade effects.',
    autoReload: 'Auto-reload',
    autoReloadDesc: 'Automatically reload the file when it is changed externally.',

    subtle: 'Subtle', medium: 'Medium', strong: 'Strong',
    on: 'On', off: 'Off',

    previewHeading: 'Markdown is fantastic',
    previewBody: 'The quick brown fox jumps over the lazy dog. Simple and effective.',

    shortcutSearch: 'Focus search bar',
    shortcutSettings: 'Open / close settings',
    shortcutZoomIn: 'Increase font size',
    shortcutZoomOut: 'Decrease font size',
    shortcutZoomReset: 'Reset zoom',
    shortcutEscape: 'Close / clear search',
    shortcutOpenFile: 'Open file dialog',
    shortcutFocus: 'Toggle focus mode',
    shortcutHome: 'Go to home screen',
    shortcutScrollTop: 'Scroll to top',
    shortcutJump: 'Open quick jump',
    shortcutNextTab: 'Next tab',
    shortcutPrevTab: 'Previous tab',

    aboutVersion: 'Version',
    aboutBuiltWith: 'Built with',
    aboutLicense: 'License',
    aboutMIT: 'MIT License',
    aboutGithub: 'GitHub Repository',
    aboutDescription: 'A fast, clean desktop Markdown viewer for developers and writers.',
  },
};

// ── Color presets ─────────────────────────────────────────
const ACCENT_PRESETS = [
  { color: '#6366f1', name: 'Indigo'  },
  { color: '#8b5cf6', name: 'Violet'  },
  { color: '#a855f7', name: 'Purple'  },
  { color: '#ec4899', name: 'Pink'    },
  { color: '#f43f5e', name: 'Rose'    },
  { color: '#f59e0b', name: 'Amber'   },
  { color: '#10b981', name: 'Emerald' },
  { color: '#06b6d4', name: 'Cyan'    },
  { color: '#3b82f6', name: 'Blue'    },
  { color: '#64748b', name: 'Slate'   },
];

const HIGHLIGHT_PRESETS = [
  { color: 'rgba(99,102,241,0.40)',  name: 'Indigo' },
  { color: 'rgba(139,92,246,0.40)',  name: 'Violet' },
  { color: 'rgba(245,158,11,0.45)',  name: 'Amber'  },
  { color: 'rgba(16,185,129,0.40)',  name: 'Green'  },
  { color: 'rgba(239,68,68,0.40)',   name: 'Red'    },
  { color: 'rgba(6,182,212,0.40)',   name: 'Cyan'   },
  { color: 'rgba(255,255,255,0.18)', name: 'White'  },
];

const CODE_BG_PRESETS = [
  { color: '#0d1117', label: 'GitHub'   },
  { color: '#0a0a0a', label: 'Noir'     },
  { color: '#1a1a2e', label: 'Midnight' },
  { color: '#111827', label: 'Slate'    },
  { color: '#1e1e1e', label: 'VS Code'  },
  { color: '#0d0d0d', label: 'Black'    },
];

// ── Atoms ─────────────────────────────────────────────────
const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: value ? 'var(--accent)' : 'var(--border-strong)',
      flexShrink: 0, position: 'relative', transition: 'background .2s',
      boxShadow: value ? 'var(--glow-accent)' : 'none',
      cursor: 'pointer',
    }}
  >
    <div style={{
      position: 'absolute', top: '4px',
      left: value ? '24px' : '4px',
      width: '16px', height: '16px', borderRadius: '50%',
      background: '#fff', transition: 'left .18s',
      boxShadow: '0 1px 3px rgba(0,0,0,.3)',
    }} />
  </div>
);

const Seg: React.FC<{
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
  small?: boolean;
}> = ({ options, value, onChange, small }) => (
  <div style={{
    display: 'flex', background: 'var(--bg-base)',
    borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px',
    border: '1px solid var(--border)',
  }}>
    {options.map(o => (
      <button key={o.v} onClick={() => onChange(o.v)} style={{
        flex: 1, padding: small ? '5px 8px' : '7px 12px',
        borderRadius: 'var(--radius-sm)', border: 'none',
        background: value === o.v ? 'var(--bg-hover)' : 'transparent',
        color: value === o.v ? 'var(--accent)' : 'var(--text-tertiary)',
        cursor: 'pointer', fontSize: small ? '12px' : '12.5px',
        fontFamily: 'var(--font-sans)',
        fontWeight: value === o.v ? 600 : 400,
        transition: 'all .12s', whiteSpace: 'nowrap',
        boxShadow: value === o.v ? 'var(--shadow-sm)' : 'none',
      }}>
        {o.l}
      </button>
    ))}
  </div>
);

const SettingRow: React.FC<{
  label: string;
  desc?: string;
  children: React.ReactNode;
  last?: boolean;
}> = ({ label, desc, children, last }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: last ? 'none' : '1px solid var(--border)',
  }}>
    <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{label}</div>
      {desc && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px', lineHeight: 1.45 }}>{desc}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const SliderRow: React.FC<{
  label: string;
  desc?: string;
  value: number;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
  hint: string;
  leftLabel?: string; rightLabel?: string;
  last?: boolean;
}> = ({ label, desc, value, min, max, step, onChange, hint, leftLabel, rightLabel, last }) => (
  <div style={{ padding: '14px 20px', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: desc ? '4px' : '10px' }}>
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{label}</span>
      <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{hint}</span>
    </div>
    {desc && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px', lineHeight: 1.45 }}>{desc}</div>}
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
    />
    {(leftLabel || rightLabel) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{leftLabel}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{rightLabel}</span>
      </div>
    )}
  </div>
);

const ColorRow: React.FC<{ label: string; desc?: string; children: React.ReactNode; last?: boolean }> = ({ label, desc, children, last }) => (
  <div style={{ padding: '16px 20px', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: desc ? '3px' : '12px' }}>{label}</div>
    {desc && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px', lineHeight: 1.45 }}>{desc}</div>}
    {children}
  </div>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '8px',
  }}>
    {children}
  </div>
);

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontFamily: 'var(--font-sans)', marginBottom: '8px', marginTop: '28px',
    paddingLeft: '2px',
  }}>
    {label}
  </div>
);

const PageHeader: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
    <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{title}</h2>
    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '3px 8px', borderRadius: '6px',
    border: '1px solid var(--border-strong)',
    background: 'var(--bg-subtle)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500,
    boxShadow: '0 1px 0 var(--border-strong)',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </kbd>
);

const TechBadge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{
    padding: '5px 14px', borderRadius: '999px',
    background: color + '18', border: `1px solid ${color}44`,
    color, fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-mono)',
  }}>
    {label}
  </div>
);

// ── Settings Panel ────────────────────────────────────────
const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, lang }) => {
  const { settings, set, reset } = useSettings();
  const lx = L[lang];
  const [tab, setTab] = useState<TabKey>('appearance');

  const navItems: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: 'appearance', icon: <Palette size={15} />,    label: lx.appearance },
    { key: 'typography', icon: <Type size={15} />,       label: lx.typography },
    { key: 'layout',     icon: <Layout size={15} />,     label: lx.layout     },
    { key: 'reading',    icon: <BookOpen size={15} />,   label: lx.reading    },
    { key: 'interface',  icon: <Monitor size={15} />,    label: lx.interface  },
    { key: 'shortcuts',  icon: <Keyboard size={15} />,   label: lx.shortcuts  },
    { key: 'about',      icon: <Info size={15} />,       label: lx.about      },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <div style={{
        width: '210px', flexShrink: 0,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 16px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 80%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--glow-accent)', flexShrink: 0,
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lx.title}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                width: '100%', padding: '9px 12px',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: tab === item.key ? 'var(--accent-soft)' : 'transparent',
                color: tab === item.key ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: tab === item.key ? 600 : 400,
                fontSize: '13.5px', fontFamily: 'var(--font-sans)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all .12s', marginBottom: '1px',
              }}
              onMouseEnter={e => { if (tab !== item.key) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (tab !== item.key) e.currentTarget.style.background = 'transparent'; }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {tab === item.key && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-tertiary)',
              cursor: 'pointer', fontSize: '12.5px', fontFamily: 'var(--font-sans)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <RotateCcw size={13} />{lx.reset}
          </button>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────── */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

        {/* ── APPEARANCE ─────────────────────────────────── */}
        {tab === 'appearance' && (
          <>
            <PageHeader title={lx.appearance} desc={lx.appearanceDesc} />

            <SectionLabel label={lx.accentColor} />
            <Card>
              <ColorRow label={lx.accentColor} desc={lx.accentColorDesc} last>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
                  {ACCENT_PRESETS.map(p => (
                    <button key={p.color} onClick={() => set('accentColor', p.color)} title={p.name}
                      style={{
                        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                        border: 'none', background: p.color, cursor: 'pointer', flexShrink: 0,
                        outline: settings.accentColor === p.color ? `3px solid ${p.color}` : '3px solid transparent',
                        outlineOffset: '2px', transition: 'outline .12s',
                        boxShadow: settings.accentColor === p.color ? `0 0 10px ${p.color}88` : 'inset 0 0 0 1px rgba(255,255,255,.1)',
                      }}
                    />
                  ))}
                  <input type="color" value={settings.accentColor}
                    onChange={e => set('accentColor', e.target.value)}
                    title="Custom"
                    style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', cursor: 'pointer', background: 'var(--bg-hover)', padding: '2px' }}
                  />
                </div>
                {/* Accent preview */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: settings.accentColor, boxShadow: `0 0 14px ${settings.accentColor}66`, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: settings.accentColor, fontFamily: 'var(--font-mono)', flex: 1 }}>{settings.accentColor}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: settings.accentColor, color: '#fff', fontSize: '12px', fontWeight: 600, boxShadow: `0 0 8px ${settings.accentColor}55` }}>Button</div>
                    <div style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${settings.accentColor}`, color: settings.accentColor, fontSize: '12px', fontWeight: 600 }}>Outline</div>
                  </div>
                </div>
              </ColorRow>
            </Card>

            <SectionLabel label={lx.accentGlow} />
            <Card>
              <SettingRow label={lx.accentGlow} desc={lx.accentGlowDesc}>
                <Toggle value={settings.accentGlow} onChange={v => set('accentGlow', v)} />
              </SettingRow>
              {settings.accentGlow && (
                <SettingRow label={lx.glowStrength} last>
                  <Seg small value={settings.accentGlowStrength}
                    onChange={v => set('accentGlowStrength', v as AppSettings['accentGlowStrength'])}
                    options={[{ v: 'subtle', l: lx.subtle }, { v: 'medium', l: lx.medium }, { v: 'strong', l: lx.strong }]}
                  />
                </SettingRow>
              )}
              {!settings.accentGlow && <div style={{ height: '1px' }} />}
            </Card>

            <SectionLabel label={lx.highlightColor} />
            <Card>
              <ColorRow label={lx.highlightColor} desc={lx.highlightColorDesc}>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {HIGHLIGHT_PRESETS.map(p => (
                    <button key={p.color} onClick={() => set('highlightColor', p.color)} title={p.name}
                      style={{
                        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', border: 'none',
                        background: p.color.replace(/[\d.]+\)$/, '0.85)'), cursor: 'pointer',
                        outline: settings.highlightColor === p.color ? '3px solid var(--accent)' : '3px solid transparent',
                        outlineOffset: '2px', transition: 'outline .12s',
                      }}
                    />
                  ))}
                </div>
                <div style={{ padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  The <mark style={{ background: settings.highlightColor, borderRadius: '3px', padding: '0 2px', color: 'var(--text-primary)' }}>quick</mark> brown fox jumps over the <mark style={{ background: settings.highlightColor, borderRadius: '3px', padding: '0 2px', color: 'var(--text-primary)' }}>lazy</mark> dog.
                </div>
              </ColorRow>
              <ColorRow label={lx.codeBackground} desc={lx.codeBackgroundDesc} last>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '14px' }}>
                  {CODE_BG_PRESETS.map(p => (
                    <button key={p.color} onClick={() => set('codeBackground', p.color)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      <div style={{ width: '38px', height: '26px', borderRadius: 'var(--radius-sm)', background: p.color, border: '1px solid var(--border)', outline: settings.codeBackground === p.color ? '3px solid var(--accent)' : '3px solid transparent', outlineOffset: '2px', transition: 'outline .12s' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{p.label}</span>
                    </button>
                  ))}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <input type="color" value={settings.codeBackground} onChange={e => set('codeBackground', e.target.value)}
                      style={{ width: '38px', height: '26px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-strong)', cursor: 'pointer', background: 'var(--bg-hover)', padding: '2px' }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Custom</span>
                  </div>
                </div>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ background: '#161b22', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #30363d' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>typescript</span>
                    <span style={{ fontSize: '10px', color: '#7d8590', fontFamily: 'var(--font-mono)' }}>{settings.codeBackground}</span>
                  </div>
                  <div style={{ background: settings.codeBackground, padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: 'var(--code-font-size)', lineHeight: 1.65, transition: 'background .2s' }}>
                    <div><span style={{ color: '#79c0ff' }}>const </span><span style={{ color: '#e3b341' }}>reader</span><span style={{ color: '#f0f6fc' }}> = </span><span style={{ color: '#79c0ff' }}>new </span><span style={{ color: '#7ee787' }}>MDReader</span><span style={{ color: '#f0f6fc' }}>();</span></div>
                    <div><span style={{ color: '#8b949e' }}>// Fast. Clean. Markdown.</span></div>
                  </div>
                </div>
              </ColorRow>
            </Card>

            <SectionLabel label={lx.borderRadius} />
            <Card>
              <SettingRow label={lx.borderRadius} desc={lx.borderRadiusDesc} last>
                <Seg value={settings.borderRadius}
                  onChange={v => set('borderRadius', v as AppSettings['borderRadius'])}
                  options={[{ v: 'sharp', l: lx.sharp }, { v: 'default', l: lx.default }, { v: 'rounded', l: lx.rounded }]}
                />
              </SettingRow>
            </Card>
          </>
        )}

        {/* ── TYPOGRAPHY ─────────────────────────────────── */}
        {tab === 'typography' && (
          <>
            <PageHeader title={lx.typography} desc={lx.typografieDesc} />

            <SectionLabel label={lx.fontFamily} />
            <Card>
              <SettingRow label={lx.fontFamily} desc={lx.fontFamilyDesc} last>
                <Seg value={settings.fontFamily}
                  onChange={v => set('fontFamily', v as AppSettings['fontFamily'])}
                  options={[{ v: 'ibm-plex', l: 'IBM Plex' }, { v: 'inter', l: 'Inter' }, { v: 'system', l: 'System' }]}
                />
              </SettingRow>
            </Card>

            <SectionLabel label={lx.headingFont} />
            <Card>
              <SettingRow label={lx.headingFont} desc={lx.headingFontDesc} last>
                <Seg value={settings.headingFont}
                  onChange={v => set('headingFont', v as AppSettings['headingFont'])}
                  options={[{ v: 'sans', l: lx.fontSans }, { v: 'serif', l: lx.fontSerif }]}
                />
              </SettingRow>
            </Card>

            <SectionLabel label="Spacing" />
            <Card>
              <SliderRow
                label={lx.lineHeight} desc={lx.lineHeightDesc}
                value={settings.lineHeight} min={1.4} max={2.2} step={0.05}
                onChange={v => set('lineHeight', v)}
                hint={settings.lineHeight.toFixed(2)}
                leftLabel="1.40 (tight)" rightLabel="2.20 (airy)"
              />
              <SettingRow label={lx.paragraphSpacing} last>
                <Seg value={settings.paragraphSpacing}
                  onChange={v => set('paragraphSpacing', v as AppSettings['paragraphSpacing'])}
                  options={[{ v: 'compact', l: lx.compact }, { v: 'default', l: lx.default }, { v: 'relaxed', l: lx.relaxed }]}
                />
              </SettingRow>
            </Card>

            <SectionLabel label="Code" />
            <Card>
              <SliderRow
                label={lx.codeFontSize} desc={lx.codeFontSizeDesc}
                value={settings.codeFontSize} min={11} max={18} step={0.5}
                onChange={v => set('codeFontSize', v)}
                hint={`${settings.codeFontSize}px`}
                leftLabel="11px" rightLabel="18px"
                last
              />
            </Card>

            {/* Live preview */}
            <SectionLabel label="Preview" />
            <div style={{
              padding: '20px 24px', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontFamily: 'var(--heading-font)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.3 }}>
                {lx.previewHeading}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)', marginBottom: '12px' }}>
                {lx.previewBody}
              </div>
              <code style={{
                display: 'inline-block', fontFamily: 'var(--font-mono)',
                fontSize: `${settings.codeFontSize}px`,
                background: settings.codeBackground, border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '3px 10px',
                color: '#7ee787', transition: 'font-size .2s',
              }}>
                const reader = new MDReader();
              </code>
            </div>
          </>
        )}

        {/* ── LAYOUT ─────────────────────────────────────── */}
        {tab === 'layout' && (
          <>
            <PageHeader title={lx.layout} desc={lx.layoutDesc} />

            <SectionLabel label={lx.contentWidth} />
            <Card>
              <SettingRow label={lx.contentWidth} desc={lx.contentWidthDesc}>
                <Seg value={settings.contentMaxWidth}
                  onChange={v => set('contentMaxWidth', v as AppSettings['contentMaxWidth'])}
                  options={[{ v: 'narrow', l: lx.narrow }, { v: 'default', l: lx.default }, { v: 'wide', l: lx.wide }, { v: 'full', l: lx.full }]}
                />
              </SettingRow>
              <div style={{ padding: '0 20px 16px' }}>
                <div style={{ height: '6px', background: 'var(--bg-base)', borderRadius: '3px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px', background: 'var(--accent)',
                    transition: 'width .3s ease',
                    width: { narrow: '35%', default: '55%', wide: '75%', full: '100%' }[settings.contentMaxWidth],
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {{ narrow: '56rem', default: '64rem', wide: '80rem', full: '100%' }[settings.contentMaxWidth]}
                  </span>
                </div>
              </div>
            </Card>

            <SectionLabel label={lx.sidebarWidth} />
            <Card>
              <SliderRow
                label={lx.sidebarWidth} desc={lx.sidebarWidthDesc}
                value={settings.sidebarWidth} min={180} max={420} step={10}
                onChange={v => set('sidebarWidth', v)}
                hint={`${settings.sidebarWidth}px`}
                leftLabel="180px" rightLabel="420px"
                last
              />
            </Card>
          </>
        )}

        {/* ── READING ────────────────────────────────────── */}
        {tab === 'reading' && (
          <>
            <PageHeader title={lx.reading} desc={lx.readingDesc} />

            <SectionLabel label="Header" />
            <Card>
              <SettingRow label={lx.showWordCount} desc={lx.showWordCountDesc}>
                <Toggle value={settings.showWordCount} onChange={v => set('showWordCount', v)} />
              </SettingRow>
              <SettingRow label={lx.showReadingTime} desc={lx.showReadingTimeDesc} last>
                <Toggle value={settings.showReadingTime} onChange={v => set('showReadingTime', v)} />
              </SettingRow>
            </Card>

            <SectionLabel label="Content" />
            <Card>
              <SettingRow label={lx.showProgressBar} desc={lx.showProgressBarDesc}>
                <Toggle value={settings.showProgressBar} onChange={v => set('showProgressBar', v)} />
              </SettingRow>
              <SettingRow label={lx.sektorBlocks} desc={lx.sektorBlocksDesc} last>
                <Toggle value={settings.sektorBlocks} onChange={v => set('sektorBlocks', v)} />
              </SettingRow>
            </Card>

            <SectionLabel label="Startup" />
            <Card>
              <SettingRow label={lx.tocOpenByDefault} desc={lx.tocOpenByDefaultDesc} last>
                <Toggle value={settings.tocOpenByDefault} onChange={v => set('tocOpenByDefault', v)} />
              </SettingRow>
            </Card>
          </>
        )}

        {/* ── INTERFACE ──────────────────────────────────── */}
        {tab === 'interface' && (
          <>
            <PageHeader title={lx.interface} desc={lx.interfaceDesc} />

            <SectionLabel label="Header" />
            <Card>
              <SettingRow label={lx.compactHeader} desc={lx.compactHeaderDesc} last>
                <Toggle value={settings.compactHeader} onChange={v => set('compactHeader', v)} />
              </SettingRow>
            </Card>

            <SectionLabel label="Motion" />
            <Card>
              <SettingRow label={lx.animations} desc={lx.animationsDesc} last>
                <Toggle value={settings.animationsEnabled} onChange={v => set('animationsEnabled', v)} />
              </SettingRow>
            </Card>

            <SectionLabel label="Files" />
            <Card>
              <SettingRow label={lx.autoReload} desc={lx.autoReloadDesc} last>
                <Toggle value={settings.autoReload} onChange={v => set('autoReload', v)} />
              </SettingRow>
            </Card>
          </>
        )}

        {/* ── SHORTCUTS ──────────────────────────────────── */}
        {tab === 'shortcuts' && (
          <>
            <PageHeader title={lx.shortcuts} desc={lx.shortcutsDesc} />

            <Card>
              {([
                { keys: ['Ctrl', 'F'],         desc: lx.shortcutSearch     },
                { keys: ['Ctrl', ','],          desc: lx.shortcutSettings   },
                { keys: ['Ctrl', '+'],          desc: lx.shortcutZoomIn     },
                { keys: ['Ctrl', '-'],          desc: lx.shortcutZoomOut    },
                { keys: ['Ctrl', '0'],          desc: lx.shortcutZoomReset  },
                { keys: ['Escape'],             desc: lx.shortcutEscape     },
                { keys: ['Ctrl', 'O'],              desc: lx.shortcutOpenFile  },
                { keys: ['Ctrl', 'K'],              desc: lx.shortcutJump      },
                { keys: ['Ctrl', 'Tab'],            desc: lx.shortcutNextTab   },
                { keys: ['Ctrl', 'Shift', 'Tab'],   desc: lx.shortcutPrevTab   },
                { keys: ['F11'],                    desc: lx.shortcutFocus     },
                { keys: ['Alt', 'Home'],            desc: lx.shortcutHome      },
                { keys: ['Alt', '↑'],               desc: lx.shortcutScrollTop },
              ] as { keys: string[]; desc: string }[]).map(({ keys, desc }, i, arr) => (
                <div key={desc} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{desc}</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {keys.map((k, ki) => (
                      <React.Fragment key={k}>
                        <Kbd>{k}</Kbd>
                        {ki < keys.length - 1 && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </Card>

            <div style={{ marginTop: '16px', padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: 'var(--glow-accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                {lang === 'de'
                  ? 'Tastenkürzel gelten immer — außer wenn ein Textfeld aktiv ist.'
                  : 'Shortcuts always apply — except when a text field is active.'}
              </span>
            </div>
          </>
        )}

        {/* ── ABOUT ──────────────────────────────────────── */}
        {tab === 'about' && (
          <>
            <PageHeader title={lx.about} desc={lx.aboutDesc} />

            {/* App card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '18px',
              padding: '20px 24px', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--glow-accent)', flexShrink: 0,
              }}>
                <span style={{ fontSize: '26px' }}>📄</span>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>MD-Reader</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{lx.aboutVersion} 4.0 · Commit #4</div>
              </div>
            </div>

            <Card>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{lx.aboutBuiltWith}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  <TechBadge label="Go 1.21" color="#00acd7" />
                  <TechBadge label="Wails v2" color="#d22128" />
                  <TechBadge label="React 18" color="#61dafb" />
                  <TechBadge label="TypeScript" color="#3178c6" />
                  <TechBadge label="Tailwind CSS" color="#38bdf8" />
                  <TechBadge label="Vite" color="#a855f7" />
                </div>
              </div>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{lx.aboutLicense}</span>
                  <span style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{lx.aboutMIT}</span>
                </div>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <a
                  href="https://github.com/Refreryo/md-reader"
                  onClick={e => { e.preventDefault(); window.go?.main?.App?.OpenExternalLink('https://github.com/Refreryo/md-reader'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}
                >
                  <ExternalLink size={14} />
                  {lx.aboutGithub}
                </a>
              </div>
            </Card>

            <div style={{ marginTop: '8px', padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.65, fontStyle: 'italic' }}>
                "{lx.aboutDescription}"
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default SettingsPanel;
