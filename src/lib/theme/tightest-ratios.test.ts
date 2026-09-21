import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { contrastRatio } from './contrast';

const css = readFileSync(resolve(process.cwd(), 'src/lib/theme/palette.css'), 'utf8');
const darkMarker = '@media (prefers-color-scheme: dark) {';
const at = css.indexOf(darkMarker);
const light = css.slice(0, at);
const dark = css.slice(at + darkMarker.length);

function tokens(scope: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(scope);
  if (!match) throw new Error(`selector ${selector} not found`);
  const body = match[1];
  const result: Record<string, string> = {};
  for (const decl of body.split(';')) {
    const kv = /^\s*(--[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*$/.exec(decl);
    if (kv) result[kv[1]] = kv[2].toLowerCase();
  }
  return result;
}

describe('tightest contrast margins from design.md D3', () => {
  it('dark forest muted-on-tint is between 4.5 and 5.0', () => {
    const darkRoot = tokens(dark, ':root');
    const forestDark = tokens(dark, '[data-palette="forest"]');
    const ratio = contrastRatio(darkRoot['--muted'], forestDark['--tint']);
    expect(ratio, 'dark forest muted-on-tint').toBeGreaterThanOrEqual(4.5);
    expect(ratio, 'dark forest muted-on-tint (upper)').toBeLessThan(5.0);
  });

  it('light fire deep-on-tint is between 5.0 and 6.0', () => {
    const firePalette = tokens(light, '[data-palette="fire"]');
    const ratio = contrastRatio(firePalette['--deep'], firePalette['--tint']);
    expect(ratio, 'light fire deep-on-tint').toBeGreaterThanOrEqual(5.0);
    expect(ratio, 'light fire deep-on-tint (upper)').toBeLessThan(6.0);
  });

  it('light fire tint-on-raised is between 1.2 and 1.5', () => {
    const lightRoot = tokens(light, ':root');
    const firePalette = tokens(light, '[data-palette="fire"]');
    const ratio = contrastRatio(firePalette['--tint'], lightRoot['--raised']);
    expect(ratio, 'light fire tint-on-raised').toBeGreaterThanOrEqual(1.2);
    expect(ratio, 'light fire tint-on-raised (upper)').toBeLessThan(1.5);
  });
});
