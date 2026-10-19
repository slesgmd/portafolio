// Rutas propias en lugar del enrutado `i18n` de Astro, que no traduce los segmentos
// (ADR 0006).

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const segments = {
  tools: { es: 'herramientas', en: 'tools' },
  about: { es: 'sobre-mi', en: 'about' },
} as const satisfies Record<string, Record<Locale, string>>;

// Los slugs de herramienta no se traducen (§5.7).
export type Route =
  | { readonly kind: 'home' }
  | { readonly kind: 'about' }
  | { readonly kind: 'tools' }
  | { readonly kind: 'tool'; readonly slug: string };

export const pathFor = (locale: Locale, route: Route): string => {
  switch (route.kind) {
    case 'home':
      return `/${locale}/`;
    case 'about':
      return `/${locale}/${segments.about[locale]}/`;
    case 'tools':
      return `/${locale}/${segments.tools[locale]}/`;
    case 'tool':
      return `/${locale}/${segments.tools[locale]}/${route.slug}/`;
  }
};

export const alternatesFor = (route: Route): Record<Locale, string> => ({
  es: pathFor('es', route),
  en: pathFor('en', route),
});
