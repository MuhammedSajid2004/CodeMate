// ─────────────────────────────────────────────────────────────────────────────
// themes.ts  ·  CodeMate – theme preset definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface Theme {
  name: string;
  /** Fill colour for the iris/pupil of each eye */
  eyeColor: string;
  /** Stroke colour for the mouth path */
  mouthColor: string;
  /** Fill colour for the sclera (white part) */
  scleraColor: string;
  /** Stroke colour for the eye outline */
  eyeOutlineColor: string;
  /** Optional glow filter (CSS box-shadow / SVG filter) */
  glow?: string;
  /** Background of the widget container */
  backgroundColor: string;
  /** Whether to use blocky/pixel shapes */
  pixelStyle?: boolean;
  /** Stroke width multiplier (1 = default) */
  strokeWidth?: number;
}

export const themes: Record<string, Theme> = {
  Classic: {
    name: 'Classic',
    eyeColor: '#222222',
    scleraColor: '#ffffff',
    eyeOutlineColor: 'transparent',
    mouthColor: '#222222',
    backgroundColor: 'transparent',
    strokeWidth: 2,
  },

  Neon: {
    name: 'Neon',
    eyeColor: '#00f5ff',
    scleraColor: '#0a0a1a',
    eyeOutlineColor: 'transparent',
    mouthColor: '#ff00e5',
    backgroundColor: 'transparent',
    glow: '0 0 8px #00f5ff, 0 0 16px #00f5ff',
    strokeWidth: 2.5,
  },

  Pastel: {
    name: 'Pastel',
    eyeColor: '#a78bfa',
    scleraColor: '#fdf4ff',
    eyeOutlineColor: 'transparent',
    mouthColor: '#f9a8d4',
    backgroundColor: 'transparent',
    strokeWidth: 2,
  },

  'Retro Pixel': {
    name: 'Retro Pixel',
    eyeColor: '#00ff00',
    scleraColor: '#000000',
    eyeOutlineColor: 'transparent',
    mouthColor: '#00ff00',
    backgroundColor: 'transparent',
    pixelStyle: true,
    strokeWidth: 3,
  },

  'Minimal Mono': {
    name: 'Minimal Mono',
    // These will be overridden at runtime with the VS Code theme foreground colour
    eyeColor: 'var(--vscode-foreground, #cccccc)',
    scleraColor: 'transparent',
    eyeOutlineColor: 'transparent',
    mouthColor: 'var(--vscode-foreground, #cccccc)',
    backgroundColor: 'transparent',
    strokeWidth: 1.5,
  },
};

export function getTheme(name: string): Theme {
  return themes[name] ?? themes['Classic'];
}
