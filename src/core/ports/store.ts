import type { Result } from '../result.ts';

export type StoreError = { readonly kind: 'quota_exceeded' } | { readonly kind: 'unavailable' };

/** Almacenamiento clave-valor síncrono; lo implementa `platform/local-store.ts`. */
export interface KeyValueStore {
  get(key: string): Result<string | null, StoreError>;
  set(key: string, value: string): Result<void, StoreError>;
  remove(key: string): Result<void, StoreError>;
}
