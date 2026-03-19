import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────
export interface AppSettings {
  accentColor:      string;
  accentGlow:       boolean;
  accentGlowStrength: 'subtle' | 'medium' | 'strong';
  highlightColor:   string;
  codeBackground:   string;
  sidebarWidth:     number;
  contentMaxWidth:  'narrow' | 'default' | 'wide' | 'full';
  lineHeight:       number;
  paragraphSpacing: 'compact' | 'default' | 'relaxed';
  fontFamily:       'ibm-plex' | 'inter' | 'system';
  showWordCount:    boolean;
  showReadingTime:  boolean;
  showProgressBar:  boolean;
  animationsEnabled: boolean;
}

const DEFAULTS: AppSettings = {
  accentColor:       '#6366f1',
  accentGlow:        true,
  accentGlowStrength: 'medium',
  highlightColor:    'rgba(99,102,241,0.35)',
  codeBackground:    '#0d1117',
  sidebarWidth:      260,
  contentMaxWidth:   'default',
  lineHeight:        1.75,
  paragraphSpacing:  'default',
  fontFamily:        'ibm-plex',
  showWordCount:     true,
  showReadingTime:   true,
  showProgressBar:   true,
  animationsEnabled: true,
};

const STORAGE_KEY = 'md-reader-settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// ── Context ───────────────────────────────────────────────
interface SettingsCtx {
  settings: AppSettings;
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  reset: () => void;
}

const Ctx = createContext<SettingsCtx>({
  settings: DEFAULTS,
  set: () => {},
  reset: () => {},
});

export const useSettings = () => useContext(Ctx);

// ── CSS variable injection ────────────────────────────────
function applySettingsToCss(s: AppSettings) {
  const r = document.documentElement;

  // accent & glow
  r.style.setProperty('--accent', s.accentColor);

  const hex = s.accentColor;
  const alpha = (a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');
  r.style.setProperty('--accent-soft',  alpha(0.12));
  r.style.setProperty('--accent-muted', alpha(0.30));
  r.style.setProperty('--accent-hover', lightenHex(hex, 0.15));

  const glowSizes = { subtle: '4px', medium: '8px', strong: '16px' };
  const glowSize  = glowSizes[s.accentGlowStrength];
  r.style.setProperty('--glow-accent', s.accentGlow
    ? `0 0 ${glowSize} ${s.accentColor}66`
    : 'none');

  // highlight (search mark)
  r.style.setProperty('--highlight-bg', s.highlightColor);

  // code bg
  r.style.setProperty('--code-bg', s.codeBackground);

  // sidebar width
  r.style.setProperty('--sidebar-width', `${s.sidebarWidth}px`);

  // content max-width
  const widths = { narrow: '56rem', default: '64rem', wide: '80rem', full: '100%' };
  r.style.setProperty('--content-max-width', widths[s.contentMaxWidth]);

  // line height
  r.style.setProperty('--line-height', String(s.lineHeight));

  // paragraph spacing
  const pSpacing = { compact: '0.75rem', default: '1.1rem', relaxed: '1.6rem' };
  r.style.setProperty('--para-spacing', pSpacing[s.paragraphSpacing]);

  // font family
  const fonts: Record<string, string> = {
    'ibm-plex': "'IBM Plex Sans', system-ui, sans-serif",
    'inter':    "'Inter', system-ui, sans-serif",
    'system':   'system-ui, -apple-system, sans-serif',
  };
  r.style.setProperty('--font-sans', fonts[s.fontFamily]);

  // animations
  r.style.setProperty('--anim-speed', s.animationsEnabled ? '1' : '0');
}

// lighten a hex color by ratio (naive HSL approach)
function lightenHex(hex: string, ratio: number): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(ratio * 255));
    const g = Math.min(255, ((n >> 8)  & 0xff) + Math.round(ratio * 255));
    const b = Math.min(255,  (n        & 0xff) + Math.round(ratio * 255));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch { return hex; }
}

// ── Provider ──────────────────────────────────────────────
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    applySettingsToCss(settings);
    saveSettings(settings);
  }, [settings]);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const reset = () => setSettings(DEFAULTS);

  return <Ctx.Provider value={{ settings, set, reset }}>{children}</Ctx.Provider>;
};