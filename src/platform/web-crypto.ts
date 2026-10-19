import type { Hasher } from '../core/ports/hasher.ts';

// Web Crypto no admite vistas sobre un `SharedArrayBuffer`: esas se copian.
const ownBuffer = (data: Uint8Array): Uint8Array<ArrayBuffer> =>
  data.buffer instanceof ArrayBuffer ? (data as Uint8Array<ArrayBuffer>) : new Uint8Array(data);

export const createWebCryptoHasher = (subtle: SubtleCrypto = crypto.subtle): Hasher => ({
  sha256: async (data) => new Uint8Array(await subtle.digest('SHA-256', ownBuffer(data))),
});
