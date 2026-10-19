// Forma de los diccionarios (PLAN §5.7). Va aparte de `index.ts` para que `en.ts` y
// el `i18n.ts` de cada herramienta la importen sin crear un ciclo.

// Las mismas claves que `T`, con cualquier texto como valor.
export type Dict<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : Dict<T[K]>;
};

type Tree = { readonly [key: string]: string | Tree };

// Claves de `reference` que faltan en `candidate` y claves de `candidate` que sobran,
// como rutas con puntos. Repite en el build la comprobación de `satisfies Dict`, que
// `astro build` no hace porque no comprueba tipos (paso 5).
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
