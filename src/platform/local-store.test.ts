import { describe, expect, it } from 'vitest';
import { createLocalStore } from './local-store.ts';

const memoryStorage = (): Storage => {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
};

const throwing = (error: unknown): Storage => {
  const fail = () => {
    throw error;
  };
  return { ...memoryStorage(), getItem: fail, setItem: fail, removeItem: fail };
};

describe('createLocalStore', () => {
  it('lee, escribe y borra', () => {
    const storage = memoryStorage();
    const shared = createLocalStore(() => storage);
    expect(shared.get('tool:x')).toEqual({ ok: true, value: null });
    expect(shared.set('tool:x', 'v')).toEqual({ ok: true, value: undefined });
    expect(shared.get('tool:x')).toEqual({ ok: true, value: 'v' });
    expect(shared.remove('tool:x')).toEqual({ ok: true, value: undefined });
    expect(shared.get('tool:x')).toEqual({ ok: true, value: null });
  });

  it('traduce los errores de cuota de cada motor', () => {
    for (const name of ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED']) {
      const store = createLocalStore(() => throwing(new DOMException('lleno', name)));
      expect(store.set('tool:x', 'v')).toEqual({ ok: false, error: { kind: 'quota_exceeded' } });
    }
  });

  it('trata cualquier otro fallo como almacenamiento no disponible', () => {
    const blocked = createLocalStore(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    const unavailable = { ok: false, error: { kind: 'unavailable' } };
    expect(blocked.get('tool:x')).toEqual(unavailable);
    expect(blocked.set('tool:x', 'v')).toEqual(unavailable);
    expect(blocked.remove('tool:x')).toEqual(unavailable);
    expect(createLocalStore(() => throwing(new Error('x'))).get('tool:x')).toEqual(unavailable);
  });
});
