import type { StoreError, KeyValueStore } from '../ports/store.ts';
import type { Result } from '../result.ts';

export type ParseError =
  | { readonly kind: 'invalid'; readonly issues: readonly string[] }
  | { readonly kind: 'unsupported_version'; readonly version: number };

export interface VersionedStoreSpec<T> {
  readonly key: `tool:${string}`;
  readonly version: number;
  /** La aporta la herramienta, con el validador (ADR 0011). */
  parse(raw: unknown): Result<T, ParseError>;
  /** `migrations[n]` convierte los datos de la versión `n` a la `n + 1`. */
  readonly migrations: Readonly<Record<number, (prev: unknown) => unknown>>;
}

export type LoadError = ParseError | StoreError;

export type SaveError =
  StoreError | { readonly kind: 'too_large'; readonly bytes: number; readonly limit: number };

/** Límite por herramienta en bytes UTF-8 del valor serializado (PLAN §11). */
export const maxStoredBytes = 1_000_000;

interface Envelope {
  readonly version: number;
  readonly data: unknown;
}

const invalid = (issue: string): Result<never, ParseError> => ({
  ok: false,
  error: { kind: 'invalid', issues: [issue] },
});

const isLowSurrogate = (unit: number): boolean => unit >= 0xdc00 && unit <= 0xdfff;

// Sin `TextEncoder`: `core` no tiene APIs del entorno (§5.2).
export const utf8ByteLength = (text: string): number => {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit < 0x80) bytes += 1;
    else if (unit < 0x800) bytes += 2;
    else if (unit >= 0xd800 && unit <= 0xdbff && isLowSurrogate(text.charCodeAt(i + 1))) {
      bytes += 4;
      i++;
    } else bytes += 3;
  }
  return bytes;
};

const parseEnvelope = (text: string): Result<Envelope, ParseError> => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return invalid('el valor guardado no es JSON');
  }
  if (typeof raw !== 'object' || raw === null || !('version' in raw) || !('data' in raw)) {
    return invalid('el valor guardado no tiene versión y datos');
  }
  const { version, data } = raw;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return invalid('la versión guardada no es un entero positivo');
  }
  return { ok: true, value: { version, data } };
};

const migrate = <T>(
  spec: VersionedStoreSpec<T>,
  { version, data }: Envelope,
): Result<unknown, ParseError> => {
  if (version > spec.version) return { ok: false, error: { kind: 'unsupported_version', version } };
  let current = data;
  for (let from = version; from < spec.version; from++) {
    const step = spec.migrations[from];
    if (step === undefined) return { ok: false, error: { kind: 'unsupported_version', version } };
    current = step(current);
  }
  return { ok: true, value: current };
};

/**
 * Lee y valida el valor de `spec.key`, migrándolo si es de una versión anterior.
 * `null` si no hay nada guardado. Un valor inválido se borra (PLAN §5.6).
 */
export const load = <T>(
  store: KeyValueStore,
  spec: VersionedStoreSpec<T>,
): Result<T | null, LoadError> => {
  const stored = store.get(spec.key);
  if (!stored.ok) return stored;
  if (stored.value === null) return { ok: true, value: null };

  const envelope = parseEnvelope(stored.value);
  const migrated = envelope.ok ? migrate(spec, envelope.value) : envelope;
  const parsed = migrated.ok ? spec.parse(migrated.value) : migrated;
  // Si el borrado falla, la herramienta arranca vacía igual y el valor se sobrescribe al
  // guardar.
  if (!parsed.ok) store.remove(spec.key);
  return parsed;
};

/** Guarda `value` con la versión de `spec`, si cabe en `maxStoredBytes`. */
export const save = <T>(
  store: KeyValueStore,
  spec: VersionedStoreSpec<T>,
  value: T,
): Result<void, SaveError> => {
  const envelope: Envelope = { version: spec.version, data: value };
  const text = JSON.stringify(envelope);
  const bytes = utf8ByteLength(text);
  if (bytes > maxStoredBytes) {
    return { ok: false, error: { kind: 'too_large', bytes, limit: maxStoredBytes } };
  }
  return store.set(spec.key, text);
};
