// Sitemap con alternativas por idioma (PLAN §5.7, ADR 0006). Cada página aparece una
// vez por idioma, con un `xhtml:link` por cada idioma y `x-default`. Las páginas de
// herramientas se añaden con el registro (tarea 0.7).
import type { APIRoute } from 'astro';
import { alternatesFor, defaultLocale, locales, type Route } from '../i18n';

const routes: readonly Route[] = [{ kind: 'home' }, { kind: 'about' }];

export const GET: APIRoute = ({ site }) => {
  if (site === undefined) throw new Error('Falta `site` en astro.config.ts');
  const absolute = (path: string): string => new URL(path, site).href;

  const urls = routes.flatMap((route) => {
    const alternates = alternatesFor(route);
    const links = [
      ...locales.map((locale) => [locale, alternates[locale]] as const),
      ['x-default', alternates[defaultLocale]] as const,
    ]
      .map(
        ([hreflang, path]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${absolute(path)}"/>`,
      )
      .join('\n');
    return locales.map(
      (locale) => `  <url>\n    <loc>${absolute(alternates[locale])}</loc>\n${links}\n  </url>`,
    );
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
