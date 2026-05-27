import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────
export interface AppSettings {
  // Appearance
  accentColor:        string;
  accentGlow:         boolean;
  accentGlowStrength: 'subtle' | 'medium' | 'strong';
  highlightColor:     string;
  codeBackground:     string;
  borderRadius:       'sharp' | 'default' | 'rounded';
  // Typography
  fontFamily:         'ibm-plex' | 'inter' | 'system';
  headingFont:        'sans' | 'serif';
  codeFontSize:       number;
  lineHeight:         number;
  paragraphSpacing:   'compact' | 'default' | 'relaxed';
  // Layout
  contentMaxWidth:    'narrow' | 'default' | 'wide' | 'full';
  sidebarWidth:       number;
  // Reading
  showWordCount:      boolean;
  showReadingTime:    boolean;
  showProgressBar:    boolean;
  tocOpenByDefault:   boolean;
  sektorBlocks:       boolean;
  // Interface
  compactHeader:      boolean;
  animationsEnabled:  boolean;
}

const DEFAULTS: AppSettings = {
  accentColor:        '#6366f1',
  accentGlow:         true,
  accentGlowStrength: 'medium',
  highlightColor:     'rgba(99,102,241,0.35)',
  codeBackground:     '#0d1117',
  borderRadius:       'default',
  fontFamily:         'ibm-plex',
  headingFont:        'sans',
  codeFontSize:       13.5,
  lineHeight:         1.75,
  paragraphSpacing:   'default',
  contentMaxWidth:    'default',
  sidebarWidth:       260,
  showWordCount:      true,
  showReadingTime:    true,
  showProgressBar:    true,
  tocOpenByDefault:   true,
  sektorBlocks:       true,
  compactHeader:      false,
  animationsEnabled:  true,
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
function lightenHex(hex: string, ratio: number): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(ratio * 255));
    const g = Math.min(255, ((n >> 8)  & 0xff) + Math.round(ratio * 255));
    const b = Math.min(255,  (n        & 0xff) + Math.round(ratio * 255));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch { return hex; }
}

function applySettingsToCss(s: AppSettings) {
  const r = document.documentElement;
  const toHex2 = (a: number) => Math.round(a * 255).toString(16).padStart(2, '0');

  // ── Accent & glow ────────────────────────────────────
  r.style.setProperty('--accent', s.accentColor);
  r.style.setProperty('--accent-soft',  s.accentColor + toHex2(0.12));
  r.style.setProperty('--accent-muted', s.accentColor + toHex2(0.30));
  r.style.setProperty('--accent-hover', lightenHex(s.accentColor, 0.15));
  const glowSizes = { subtle: '4px', medium: '8px', strong: '16px' };
  r.style.setProperty('--glow-accent', s.accentGlow
    ? `0 0 ${glowSizes[s.accentGlowStrength]} ${s.accentColor}66`
    : 'none');

  // ── Colors ───────────────────────────────────────────
  r.style.setProperty('--highlight-bg', s.highlightColor);
  r.style.setProperty('--code-bg', s.codeBackground);
  r.style.setProperty('--code-font-size', `${s.codeFontSize}px`);

  // ── Border radius ────────────────────────────────────
  const radii = {
    sharp:   { sm: '3px',  md: '5px',  lg: '8px',  xl: '12px' },
    default: { sm: '6px',  md: '10px', lg: '16px', xl: '22px' },
    rounded: { sm: '10px', md: '16px', lg: '24px', xl: '32px' },
  };
  const rad = radii[s.borderRadius];
  r.style.setProperty('--radius-sm', rad.sm);
  r.style.setProperty('--radius-md', rad.md);
  r.style.setProperty('--radius-lg', rad.lg);
  r.style.setProperty('--radius-xl', rad.xl);

  // ── Layout ───────────────────────────────────────────
  r.style.setProperty('--sidebar-width', `${s.sidebarWidth}px`);
  const widths = { narrow: '56rem', default: '64rem', wide: '80rem', full: '100%' };
  r.style.setProperty('--content-max-width', widths[s.contentMaxWidth]);

  // ── Typography ───────────────────────────────────────
  r.style.setProperty('--line-height', String(s.lineHeight));
  const pSpacing = { compact: '0.75rem', default: '1.1rem', relaxed: '1.6rem' };
  r.style.setProperty('--para-spacing', pSpacing[s.paragraphSpacing]);

  const fonts: Record<string, string> = {
    'ibm-plex': "'IBM Plex Sans', system-ui, sans-serif",
    'inter':    "'Inter', system-ui, sans-serif",
    'system':   'system-ui, -apple-system, sans-serif',
  };
  r.style.setProperty('--font-sans', fonts[s.fontFamily]);

  const headingFonts: Record<string, string> = {
    'sans':  fonts[s.fontFamily],
    'serif': "'IBM Plex Serif', Georgia, serif",
  };
  r.style.setProperty('--heading-font', headingFonts[s.headingFont]);

  // ── Misc ─────────────────────────────────────────────
  r.style.setProperty('--anim-speed', s.animationsEnabled ? '1' : '0');
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
