/** Resultado de una operación con errores esperables (PLAN §5.5). */
export type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };
