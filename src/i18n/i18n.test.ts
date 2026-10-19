import { describe, expect, it } from 'vitest';
import { compareKeys } from './dict.ts';
import {
  alternatesFor,
  defineToolTexts,
  isLocale,
  locales,
  messages,
  pathFor,
  type Route,
} from './index.ts';

describe('pathFor', () => {
  it('localiza los segmentos y termina en barra', () => {
    const cases: [Route, string, string][] = [
      [{ kind: 'home' }, '/es/', '/en/'],
      [{ kind: 'about' }, '/es/sobre-mi/', '/en/about/'],
      [{ kind: 'tools' }, '/es/herramientas/', '/en/tools/'],
      [{ kind: 'tool', slug: 'markdown' }, '/es/herramientas/markdown/', '/en/tools/markdown/'],
    ];
    for (const [route, es, en] of cases) {
      expect(pathFor('es', route)).toBe(es);
      expect(pathFor('en', route)).toBe(en);
      expect(alternatesFor(route)).toEqual({ es, en });
    }
  });
});

describe('isLocale', () => {
  it('acepta solo los idiomas del sitio', () => {
    expect(locales.every(isLocale)).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});

describe('compareKeys', () => {
  it('no informa nada si las claves coinciden', () => {
    expect(compareKeys({ a: 'x', b: { c: 'y' } }, { a: '1', b: { c: '2' } })).toEqual({
      missing: [],
      extra: [],
    });
  });

  it('informa las claves que faltan y las que sobran, anidadas', () => {
    expect(
      compareKeys({ a: 'x', b: { c: 'y', d: 'z' } }, { b: { c: '2', e: '3' }, f: '4' }),
    ).toEqual({ missing: ['a', 'b.d'], extra: ['b.e', 'f'] });
  });

  it('trata como faltante una clave con otra forma', () => {
    expect(compareKeys({ a: { b: 'x' } }, { a: 'y' })).toEqual({ missing: ['a'], extra: [] });
    expect(compareKeys({ a: 'x' }, { a: { b: 'y' } })).toEqual({ missing: ['a'], extra: [] });
  });
});

describe('messages', () => {
  it('devuelve el diccionario de cada idioma', () => {
    expect(messages('es').site.name).toBe('Portafolio');
    expect(messages('en').site.name).toBe('Portfolio');
  });
});

describe('defineToolTexts', () => {
  it('devuelve los textos si los dos idiomas tienen las mismas claves', () => {
    const texts = {
      es: { name: 'Hora', description: 'Calcula horas.', units: { h: 'h' } },
      en: { name: 'Time', description: 'Computes hours.', units: { h: 'h' } },
    };
    expect(defineToolTexts(texts)).toBe(texts);
  });

  it('falla al definirse si faltan o sobran claves', () => {
    const es = { name: 'Hora', description: 'Calcula horas.', units: { h: 'h' } };
    const en = { name: 'Time', description: 'Computes hours.', units: { m: 'm' } };
    expect(() => defineToolTexts({ es, en: en as unknown as typeof es })).toThrow(
      'Textos de herramienta en: faltan claves [units.h]; sobran claves [units.m]',
    );
  });
});
