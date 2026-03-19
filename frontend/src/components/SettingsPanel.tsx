import React, { useState } from 'react';
import { RotateCcw, Palette, Layout, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { useSettings, AppSettings } from '../context/SettingsContext';

type Lang = 'de' | 'en';
interface SettingsPanelProps { onClose: () => void; lang: Lang; }

// ── Labels ────────────────────────────────────────────────
const L: Record<Lang, Record<string, string>> = {
  de: {
    title: 'Einstellungen', back: '← Zurück', reset: 'Alles zurücksetzen',
    appearance: 'Erscheinungsbild', layout: 'Layout & Typografie', display: 'Anzeige',
    accentColor: 'Akzentfarbe', currentAccent: 'Aktuell',
    accentGlow: 'Akzent-Glow', glowStrength: 'Glow-Stärke',
    subtle: 'Subtil', medium: 'Mittel', strong: 'Stark',
    highlightColor: 'Suchmarkierung', codeBackground: 'Code-Hintergrund',
    contentWidth: 'Inhaltsbreite', narrow: 'Schmal', default: 'Standard', wide: 'Breit', full: 'Voll',
    sidebarWidth: 'Sidebar-Breite', fontFamily: 'Schriftart',
    lineHeight: 'Zeilenhöhe', tight: 'Eng', airy: 'Luftig',
    paragraphSpacing: 'Absatzabstand', compact: 'Kompakt', relaxed: 'Locker',
    showWordCount: 'Wörter anzeigen', showReadingTime: 'Lesezeit anzeigen',
    showProgressBar: 'Fortschrittsbalken', animations: 'Animationen',
    previewSentence: 'Der schnelle braune Fuchs springt über den faulen Hund.',
    on: 'An', off: 'Aus',
  },
  en: {
    title: 'Settings', back: '← Back', reset: 'Reset all',
    appearance: 'Appearance', layout: 'Layout & Typography', display: 'Display',
    accentColor: 'Accent color', currentAccent: 'Current',
    accentGlow: 'Accent glow', glowStrength: 'Glow strength',
    subtle: 'Subtle', medium: 'Medium', strong: 'Strong',
    highlightColor: 'Search highlight', codeBackground: 'Code background',
    contentWidth: 'Content width', narrow: 'Narrow', default: 'Default', wide: 'Wide', full: 'Full',
    sidebarWidth: 'Sidebar width', fontFamily: 'Font family',
    lineHeight: 'Line height', tight: 'Tight', airy: 'Airy',
    paragraphSpacing: 'Paragraph spacing', compact: 'Compact', relaxed: 'Relaxed',
    showWordCount: 'Show word count', showReadingTime: 'Show reading time',
    showProgressBar: 'Progress bar', animations: 'Animations',
    previewSentence: 'The quick brown fox jumps over the lazy dog.',
    on: 'On', off: 'Off',
  },
};

const ACCENT_PRESETS = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e',
  '#f59e0b','#10b981','#06b6d4','#3b82f6','#64748b',
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
  { color: '#0d1117', label: 'GitHub'  },
  { color: '#0a0a0a', label: 'Noir'    },
  { color: '#1a1a2e', label: 'Midnight'},
  { color: '#111827', label: 'Slate'   },
  { color: '#1e1e1e', label: 'VS Code' },
  { color: '#0d0d0d', label: 'Black'   },
];

// ── Atoms ─────────────────────────────────────────────────
const Seg: React.FC<{ options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '10px', padding: '3px', gap: '2px', border: '1px solid var(--border)' }}>
    {options.map(o => (
      <button key={o.v} onClick={() => onChange(o.v)} style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: 'none', background: value === o.v ? 'var(--bg-hover)' : 'transparent', color: value === o.v ? 'var(--accent)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12.5px', fontFamily: 'var(--font-sans)', fontWeight: value === o.v ? 600 : 400, transition: 'all .12s', boxShadow: value === o.v ? 'var(--shadow-sm)' : 'none', whiteSpace: 'nowrap' }}>
        {o.l}
      </button>
    ))}
  </div>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({ value, onChange, label, desc }) => (
  <div onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
  >
    <div>
      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{desc}</div>}
    </div>
    <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? 'var(--accent)' : 'var(--border-strong)', flexShrink: 0, position: 'relative', transition: 'background .2s', boxShadow: value ? 'var(--glow-accent)' : 'none' }}>
      <div style={{ position: 'absolute', top: '4px', left: value ? '24px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
    </div>
  </div>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{label}</span>
      {hint && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const SectionHead: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-sans)', marginBottom: '16px', marginTop: '8px' }}>{label}</div>
);

const Divider = () => <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0' }} />;

type TabKey = 'appearance' | 'layout' | 'display';

// ── Settings Panel ────────────────────────────────────────
const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, lang }) => {
  const { settings, set, reset } = useSettings();
  const lx = L[lang];
  const [tab, setTab] = useState<TabKey>('appearance');

  const navItems: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: 'appearance', icon: <Palette size={16} />, label: lx.appearance },
    { key: 'layout',     icon: <Layout size={16} />,  label: lx.layout     },
    { key: 'display',    icon: <Eye size={16} />,     label: lx.display    },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Left nav ─────────────────────────────────────── */}
      <div style={{ width: '220px', flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', height: '100%' }}>

        {/* Title */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={15} color="var(--accent)" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{lx.title}</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '10px', border: 'none', textAlign: 'left', cursor: 'pointer', background: tab === item.key ? 'var(--accent-soft)' : 'transparent', color: tab === item.key ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: tab === item.key ? 600 : 400, fontSize: '13.5px', fontFamily: 'var(--font-sans)', transition: 'all .12s', marginBottom: '2px' }}
              onMouseEnter={e => { if (tab !== item.key) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (tab !== item.key) e.currentTarget.style.background = 'transparent'; }}
            >
              {item.icon}
              {item.label}
              {tab === item.key && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 12px 0', borderTop: '1px solid var(--border)' }}>
          <button onClick={reset}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12.5px', fontFamily: 'var(--font-sans)', transition: 'all .15s', marginBottom: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <RotateCcw size={13} />{lx.reset}
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>

        {/* ── Appearance ─────────────────────────────────── */}
        {tab === 'appearance' && (
          <>
            <h2 style={{ margin: '0 0 32px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{lx.appearance}</h2>

            <SectionHead label={lx.accentColor} />
            <Field label={lx.accentColor} hint={settings.accentColor}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {ACCENT_PRESETS.map(c => (
                  <button key={c} onClick={() => set('accentColor', c)} title={c}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: c, cursor: 'pointer', flexShrink: 0, outline: settings.accentColor === c ? `3px solid ${c}` : '3px solid transparent', outlineOffset: '2px', transition: 'outline .12s', boxShadow: settings.accentColor === c ? `0 0 10px ${c}88` : 'inset 0 0 0 1px rgba(255,255,255,.1)' }}
                  />
                ))}
                <input type="color" value={settings.accentColor} onChange={e => set('accentColor', e.target.value)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px dashed var(--border-strong)', cursor: 'pointer', background: 'var(--bg-hover)', padding: '2px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: settings.accentColor, boxShadow: `0 0 16px ${settings.accentColor}66`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: settings.accentColor, fontFamily: 'var(--font-mono)' }}>{settings.accentColor}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{lx.currentAccent}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <div style={{ padding: '6px 14px', borderRadius: '8px', background: settings.accentColor, color: '#fff', fontSize: '12px', fontWeight: 600, boxShadow: `0 0 8px ${settings.accentColor}66` }}>Button</div>
                  <div style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${settings.accentColor}`, color: settings.accentColor, fontSize: '12px', fontWeight: 600 }}>Outline</div>
                </div>
              </div>
            </Field>

            <Divider />
            <SectionHead label={lx.accentGlow} />
            <Toggle value={settings.accentGlow} onChange={v => set('accentGlow', v)} label={lx.accentGlow} desc={settings.accentGlow ? lx.on : lx.off} />
            {settings.accentGlow && (
              <Field label={lx.glowStrength}>
                <Seg value={settings.accentGlowStrength} onChange={v => set('accentGlowStrength', v as AppSettings['accentGlowStrength'])}
                  options={[{ v: 'subtle', l: lx.subtle }, { v: 'medium', l: lx.medium }, { v: 'strong', l: lx.strong }]}
                />
              </Field>
            )}

            <Divider />
            <SectionHead label={lx.highlightColor} />
            <Field label={lx.highlightColor}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {HIGHLIGHT_PRESETS.map(p => (
                  <button key={p.color} onClick={() => set('highlightColor', p.color)} title={p.name}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: p.color.replace(/[\d.]+\)$/, '0.85)'), cursor: 'pointer', flexShrink: 0, outline: settings.highlightColor === p.color ? '3px solid var(--accent)' : '3px solid transparent', outlineOffset: '2px', transition: 'outline .12s' }}
                  />
                ))}
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {lx.previewSentence.split(' ').map((word, i) =>
                  i === 1 || i === 4
                    ? <mark key={i} style={{ background: settings.highlightColor, color: 'var(--text-primary)', borderRadius: '3px', padding: '0 2px' }}>{word} </mark>
                    : `${word} `
                )}
              </div>
            </Field>

            <Divider />
            <SectionHead label={lx.codeBackground} />
            <Field label={lx.codeBackground} hint={settings.codeBackground}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {CODE_BG_PRESETS.map(p => (
                  <button key={p.color} onClick={() => set('codeBackground', p.color)} title={`${p.label} ${p.color}`}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <div style={{ width: '44px', height: '32px', borderRadius: '8px', background: p.color, outline: settings.codeBackground === p.color ? '3px solid var(--accent)' : '3px solid transparent', outlineOffset: '2px', transition: 'outline .12s', border: '1px solid var(--border)' }} />
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{p.label}</span>
                  </button>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <input type="color" value={settings.codeBackground} onChange={e => set('codeBackground', e.target.value)}
                    style={{ width: '44px', height: '32px', borderRadius: '8px', border: '1px dashed var(--border-strong)', cursor: 'pointer', background: 'var(--bg-hover)', padding: '2px' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Custom</span>
                </div>
              </div>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ background: '#161b22', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #30363d' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>typescript</span>
                  <span style={{ fontSize: '10px', color: '#7d8590', fontFamily: 'var(--font-mono)' }}>{settings.codeBackground}</span>
                </div>
                <div style={{ background: settings.codeBackground, padding: '16px 18px', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, transition: 'background .2s' }}>
                  <div><span style={{ color: '#79c0ff' }}>const </span><span style={{ color: '#e3b341' }}>reader</span><span style={{ color: '#f0f6fc' }}> = </span><span style={{ color: '#79c0ff' }}>new </span><span style={{ color: '#7ee787' }}>MDReader</span><span style={{ color: '#f0f6fc' }}>();</span></div>
                  <div><span style={{ color: '#e3b341' }}>reader</span><span style={{ color: '#f0f6fc' }}>.</span><span style={{ color: '#79c0ff' }}>open</span><span style={{ color: '#f0f6fc' }}>(</span><span style={{ color: '#a5d6ff' }}>"README.md"</span><span style={{ color: '#f0f6fc' }}>);</span></div>
                  <div><span style={{ color: '#8b949e' }}>// Fast. Clean. Markdown.</span></div>
                </div>
              </div>
            </Field>
          </>
        )}

        {/* ── Layout ─────────────────────────────────────── */}
        {tab === 'layout' && (
          <>
            <h2 style={{ margin: '0 0 32px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{lx.layout}</h2>

            <SectionHead label={lx.contentWidth} />
            <Field label={lx.contentWidth} hint={{ narrow: '56rem', default: '64rem', wide: '80rem', full: '100%' }[settings.contentMaxWidth]}>
              <Seg value={settings.contentMaxWidth} onChange={v => set('contentMaxWidth', v as AppSettings['contentMaxWidth'])}
                options={[{ v: 'narrow', l: lx.narrow }, { v: 'default', l: lx.default }, { v: 'wide', l: lx.wide }, { v: 'full', l: lx.full }]}
              />
              <div style={{ marginTop: '10px', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '3px', background: 'var(--accent)', transition: 'width .3s ease', width: { narrow: '35%', default: '55%', wide: '75%', full: '100%' }[settings.contentMaxWidth] }} />
              </div>
            </Field>

            <Divider />
            <SectionHead label={lx.sidebarWidth} />
            <Field label={lx.sidebarWidth} hint={`${settings.sidebarWidth}px`}>
              <input type="range" min={180} max={400} step={10} value={settings.sidebarWidth} onChange={e => set('sidebarWidth', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>180px</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>400px</span>
              </div>
            </Field>

            <Divider />
            <SectionHead label={lx.fontFamily} />
            <Field label={lx.fontFamily}>
              <Seg value={settings.fontFamily} onChange={v => set('fontFamily', v as AppSettings['fontFamily'])}
                options={[{ v: 'ibm-plex', l: 'IBM Plex' }, { v: 'inter', l: 'Inter' }, { v: 'system', l: 'System' }]}
              />
              <div style={{ marginTop: '10px', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>
                {lx.previewSentence}
              </div>
            </Field>

            <Divider />
            <Field label={lx.lineHeight} hint={settings.lineHeight.toFixed(2)}>
              <input type="range" min={1.4} max={2.2} step={0.05} value={settings.lineHeight} onChange={e => set('lineHeight', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>1.40 ({lx.tight})</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>2.20 ({lx.airy})</span>
              </div>
            </Field>

            <Field label={lx.paragraphSpacing}>
              <Seg value={settings.paragraphSpacing} onChange={v => set('paragraphSpacing', v as AppSettings['paragraphSpacing'])}
                options={[{ v: 'compact', l: lx.compact }, { v: 'default', l: lx.default }, { v: 'relaxed', l: lx.relaxed }]}
              />
            </Field>
          </>
        )}

        {/* ── Display ────────────────────────────────────── */}
        {tab === 'display' && (
          <>
            <h2 style={{ margin: '0 0 32px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{lx.display}</h2>

            <SectionHead label="Header" />
            <Toggle value={settings.showWordCount}    onChange={v => set('showWordCount', v)}    label={lx.showWordCount} />
            <Toggle value={settings.showReadingTime}  onChange={v => set('showReadingTime', v)}  label={lx.showReadingTime} />

            <Divider />
            <SectionHead label="Content" />
            <Toggle value={settings.showProgressBar}  onChange={v => set('showProgressBar', v)}  label={lx.showProgressBar} />

            <Divider />
            <SectionHead label="Misc" />
            <Toggle value={settings.animationsEnabled} onChange={v => set('animationsEnabled', v)} label={lx.animations} />
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;