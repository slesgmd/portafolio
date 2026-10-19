import { describe, expect, it } from 'vitest';
import type { KeyValueStore, StoreError } from '../ports/store.ts';
import type { Result } from '../result.ts';
import {
  load,
  maxStoredBytes,
  save,
  utf8ByteLength,
  type ParseError,
  type VersionedStoreSpec,
} from './versioned-store.ts';

const memoryStore = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    get: (key) => ({ ok: true, value: data.get(key) ?? null }),
    set: (key, value) => {
      data.set(key, value);
      return { ok: true, value: undefined };
    },
    remove: (key) => {
      data.delete(key);
      return { ok: true, value: undefined };
    },
  };
  return { store, data };
};

const failingStore = (error: StoreError): KeyValueStore => ({
  get: () => ({ ok: false, error }),
  set: () => ({ ok: false, error }),
  remove: () => ({ ok: false, error }),
});

interface Note {
  readonly text: string;
  readonly pinned: boolean;
}

const parseNote = (raw: unknown): Result<Note, ParseError> => {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: { kind: 'invalid', issues: ['no es un objeto'] } };
  }
  const { text, pinned } = raw as Record<string, unknown>;
  if (typeof text !== 'string' || typeof pinned !== 'boolean') {
    return { ok: false, error: { kind: 'invalid', issues: ['campos inválidos'] } };
  }
  return { ok: true, value: { text, pinned } };
};

// v1 guardaba la cadena sola; v2, un objeto sin `pinned`; v3 añade `pinned`.
const fromV2 = (prev: unknown) => ({ ...(prev as object), pinned: false });
const spec: VersionedStoreSpec<Note> = {
  key: 'tool:notas',
  version: 3,
  parse: parseNote,
  migrations: { 1: (prev) => ({ text: prev }), 2: fromV2 },
};

const stored = (version: number, data: unknown) => JSON.stringify({ version, data });

describe('utf8ByteLength', () => {
  it('cuenta los bytes de cada rango de UTF-8', () => {
    expect(utf8ByteLength('')).toBe(0);
    expect(utf8ByteLength('abc')).toBe(3);
    expect(utf8ByteLength('ñé')).toBe(4);
    expect(utf8ByteLength('€')).toBe(3);
    expect(utf8ByteLength('😀')).toBe(4);
    expect(utf8ByteLength('a😀€ñ')).toBe(1 + 4 + 3 + 2);
  });

  it('cuenta 3 bytes por sustituto suelto, como U+FFFD', () => {
    expect(utf8ByteLength('\ud83d')).toBe(3);
    expect(utf8ByteLength('\ude00')).toBe(3);
    expect(utf8ByteLength('\ud83da')).toBe(4);
  });
});

describe('save y load', () => {
  it('guardan y leen un valor de la versión actual', () => {
    const { store, data } = memoryStore();
    const note: Note = { text: 'hola', pinned: true };
    expect(save(store, spec, note)).toEqual({ ok: true, value: undefined });
    expect(data.get('tool:notas')).toBe(stored(3, note));
    expect(load(store, spec)).toEqual({ ok: true, value: note });
  });

  it('devuelven null si no hay nada guardado', () => {
    expect(load(memoryStore().store, spec)).toEqual({ ok: true, value: null });
  });

  it('migran paso a paso desde cada versión anterior', () => {
    for (const [version, data] of [
      [1, 'antigua'],
      [2, { text: 'antigua' }],
    ] as const) {
      const { store } = memoryStore({ 'tool:notas': stored(version, data) });
      expect(load(store, spec)).toEqual({ ok: true, value: { text: 'antigua', pinned: false } });
    }
  });

  it('descartan un valor inválido y lo borran', () => {
    const cases: [string, ParseError][] = [
      ['{', { kind: 'invalid', issues: ['el valor guardado no es JSON'] }],
      ['null', { kind: 'invalid', issues: ['el valor guardado no tiene versión y datos'] }],
      ['"texto"', { kind: 'invalid', issues: ['el valor guardado no tiene versión y datos'] }],
      [
        '{"version":3}',
        { kind: 'invalid', issues: ['el valor guardado no tiene versión y datos'] },
      ],
      [
        stored(1.5, 'x'),
        { kind: 'invalid', issues: ['la versión guardada no es un entero positivo'] },
      ],
      [
        stored(0, 'x'),
        { kind: 'invalid', issues: ['la versión guardada no es un entero positivo'] },
      ],
      [
        JSON.stringify({ version: '3', data: {} }),
        { kind: 'invalid', issues: ['la versión guardada no es un entero positivo'] },
      ],
      [stored(3, { text: 1 }), { kind: 'invalid', issues: ['campos inválidos'] }],
      [stored(4, {}), { kind: 'unsupported_version', version: 4 }],
    ];
    for (const [value, error] of cases) {
      const { store, data } = memoryStore({ 'tool:notas': value });
      expect(load(store, spec), value).toEqual({ ok: false, error });
      expect(data.has('tool:notas'), value).toBe(false);
    }
  });

  it('rechazan una versión sin migración', () => {
    const gap: VersionedStoreSpec<Note> = { ...spec, migrations: { 2: fromV2 } };
    const { store } = memoryStore({ 'tool:notas': stored(1, 'x') });
    expect(load(store, gap)).toEqual({
      ok: false,
      error: { kind: 'unsupported_version', version: 1 },
    });
  });

  it('propagan los errores del almacenamiento', () => {
    for (const error of [{ kind: 'unavailable' }, { kind: 'quota_exceeded' }] as const) {
      const store = failingStore(error);
      expect(load(store, spec)).toEqual({ ok: false, error });
      expect(save(store, spec, { text: '', pinned: false })).toEqual({ ok: false, error });
    }
  });

  it('no guardan un valor que supera el límite', () => {
    const { store, data } = memoryStore();
    const overhead = utf8ByteLength(stored(3, { text: '', pinned: false }));
    const fits: Note = { text: 'a'.repeat(maxStoredBytes - overhead), pinned: false };
    expect(save(store, spec, fits).ok).toBe(true);

    const tooLarge: Note = { ...fits, text: `${fits.text}ñ` };
    expect(save(store, spec, tooLarge)).toEqual({
      ok: false,
      error: { kind: 'too_large', bytes: maxStoredBytes + 2, limit: maxStoredBytes },
    });
    expect(data.get('tool:notas')).toBe(stored(3, fits));
  });
});
