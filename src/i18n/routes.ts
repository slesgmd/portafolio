// Rutas localizadas (PLAN §5.7, ADR 0006). Todas llevan prefijo de idioma y barra
// final. Los segmentos de sección se traducen con un mapa estático; los slugs de
// herramienta son identificadores compartidos.

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

// Segmentos de sección por idioma.
export const segments = {
  tools: { es: 'herramientas', en: 'tools' },
  about: { es: 'sobre-mi', en: 'about' },
} as const satisfies Record<string, Record<Locale, string>>;

// Página lógica, independiente del idioma.
export type Route =
  | { readonly kind: 'home' }
  | { readonly kind: 'about' }
  | { readonly kind: 'tools' }
  | { readonly kind: 'tool'; readonly slug: string };

// Ruta absoluta desde la raíz del sitio, con barra final.
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

// La misma página en cada idioma: alimenta `hreflang`, el sitemap y el selector.
export const alternatesFor = (route: Route): Record<Locale, string> => ({
  es: pathFor('es', route),
  en: pathFor('en', route),
});
