// Aparte de `index.ts` para que `en.ts` y el `i18n.ts` de cada herramienta lo importen
// sin crear un ciclo.

export type Dict<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : Dict<T[K]>;
};

type Tree = { readonly [key: string]: string | Tree };

// Repite en el build la comprobación de `satisfies Dict`: `astro build` no comprueba
// tipos, y el paso 5 debe fallar con una traducción faltante (§12).
export const compareKeys = (
  reference: Tree,
  candidate: Tree,
  prefix = '',
): { missing: string[]; extra: string[] } => {
  const missing: string[] = [];
  const extra: string[] = [];
  for (const [key, value] of Object.entries(reference)) {
    const path = `${prefix}${key}`;
    const other = candidate[key];
    if (other === undefined) {
      missing.push(path);
    } else if (typeof value === 'string' || typeof other === 'string') {
      if (typeof value !== typeof other) missing.push(path);
    } else {
      const nested = compareKeys(value, other, `${path}.`);
      missing.push(...nested.missing);
      extra.push(...nested.extra);
    }
  }
  for (const key of Object.keys(candidate)) {
    if (!(key in reference)) extra.push(`${prefix}${key}`);
  }
  return { missing, extra };
};
