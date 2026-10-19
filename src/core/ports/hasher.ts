/** Lo implementa `platform/web-crypto.ts`. */
export interface Hasher {
  sha256(data: Uint8Array): Promise<Uint8Array>;
}
