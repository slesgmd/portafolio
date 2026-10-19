import { describe, expect, it } from 'vitest';
import { createWebCryptoHasher } from './web-crypto.ts';

const hex = (bytes: Uint8Array): string =>
  [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

// Vectores de FIPS 180-2.
const abc = new Uint8Array([0x61, 0x62, 0x63]);
const abcDigest = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

describe('createWebCryptoHasher', () => {
  const hasher = createWebCryptoHasher();

  it('calcula SHA-256', async () => {
    expect(hex(await hasher.sha256(abc))).toBe(abcDigest);
    expect(hex(await hasher.sha256(new Uint8Array()))).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('acepta vistas parciales y sobre SharedArrayBuffer', async () => {
    const padded = new Uint8Array([0, 0x61, 0x62, 0x63, 0]);
    expect(hex(await hasher.sha256(padded.subarray(1, 4)))).toBe(abcDigest);
    const shared = new Uint8Array(new SharedArrayBuffer(3));
    shared.set(abc);
    expect(hex(await hasher.sha256(shared))).toBe(abcDigest);
  });
});
