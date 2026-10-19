// Umbrales de contraste de la §11.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Oklch = readonly [l: number, c: number, h: number];
type Rgb = readonly [r: number, g: number, b: number];

const css = readFileSync(new URL('../../src/design/tokens.css', import.meta.url), 'utf8');

const oklch = String.raw`oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)`;
const tokenPattern = new RegExp(
  String.raw`--([\w-]+):\s*light-dark\(\s*${oklch}\s*,\s*${oklch}\s*\)`,
  'g',
);

const tokens = new Map<string, { light: Oklch; dark: Oklch }>();
for (const [, name = '', ...values] of css.matchAll(tokenPattern)) {
  // Un valor ausente da `NaN`, y la prueba de gama falla.
  const n = (i: number): number => Number(values[i]);
  tokens.set(name, {
    light: [n(0) / 100, n(1), n(2)],
    dark: [n(3) / 100, n(4), n(5)],
  });
}

const color = (name: string, theme: 'light' | 'dark'): Oklch => {
  const token = tokens.get(name);
  if (token === undefined) throw new Error(`Falta el token --${name}`);
  return token[theme];
};

// OKLCH → sRGB lineal (https://bottosson.github.io/posts/oklab/).
const toLinearSrgb = ([l, c, h]: Oklch): Rgb => {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
};

// Luminancia relativa de WCAG.
const luminance = (color: Oklch): number => {
  const [r, g, b] = toLinearSrgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: Oklch, b: Oklch): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

const pairs: readonly [foreground: string, background: string, minRatio: number][] = [
  ['color-text', 'color-bg', 4.5],
  ['color-text', 'color-surface', 4.5],
  ['color-text-muted', 'color-bg', 4.5],
  ['color-text-muted', 'color-surface', 4.5],
  ['color-accent', 'color-bg', 4.5],
  ['color-accent', 'color-surface', 4.5],
  ['color-danger', 'color-bg', 4.5],
  ['color-danger', 'color-surface', 4.5],
  ['color-border-strong', 'color-bg', 3],
  ['color-border-strong', 'color-surface', 3],
];

describe('tokens de color', () => {
  it('declara cada token de los pares como light-dark() con dos oklch()', () => {
    for (const [fg, bg] of pairs) {
      expect(tokens.has(fg), fg).toBe(true);
      expect(tokens.has(bg), bg).toBe(true);
    }
  });

  it('están dentro de la gama sRGB', () => {
    for (const [name, { light, dark }] of tokens) {
      for (const channel of [...toLinearSrgb(light), ...toLinearSrgb(dark)]) {
        expect(Number.isNaN(channel), name).toBe(false);
        expect(channel, name).toBeGreaterThanOrEqual(-0.001);
        expect(channel, name).toBeLessThanOrEqual(1.001);
      }
    }
  });

  for (const theme of ['light', 'dark'] as const) {
    it.each(pairs)(`${theme}: %s sobre %s ≥ %d:1`, (fg, bg, min) => {
      const ratio = contrast(color(fg, theme), color(bg, theme));
      expect(ratio, `${fg} sobre ${bg} (${theme}): ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        min,
      );
    });
  }
});
