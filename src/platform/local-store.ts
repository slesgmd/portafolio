import type { KeyValueStore, StoreError } from '../core/ports/store.ts';
import type { Result } from '../core/result.ts';

// Firefox usaba otro nombre para el mismo error.
const quotaErrorNames = new Set(['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED']);

const toStoreError = (error: unknown): StoreError =>
  error instanceof DOMException && quotaErrorNames.has(error.name)
    ? { kind: 'quota_exceeded' }
    : { kind: 'unavailable' };

// Acceder a `localStorage` lanza si el navegador lo bloquea, así que se lee en cada uso.
const attempt = <T>(operation: () => T): Result<T, StoreError> => {
  try {
    return { ok: true, value: operation() };
  } catch (error) {
    return { ok: false, error: toStoreError(error) };
  }
};

export const createLocalStore = (storage: () => Storage = () => localStorage): KeyValueStore => ({
  get: (key) => attempt(() => storage().getItem(key)),
  set: (key, value) => attempt(() => storage().setItem(key, value)),
  remove: (key) => attempt(() => storage().removeItem(key)),
});
