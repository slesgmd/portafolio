// Orden de las capas CSS (PLAN §10, ADR 0008). Va en un `<style>` inline al principio de
// `<head>`: el orden lo fija la primera aparición de cada capa en el documento, y en la
// hoja que empaqueta Astro los estilos de los componentes van antes que el CSS global
// importado por el layout. `astro.config.ts` añade su hash a la CSP.
export const layerOrder = '@layer reset, tokens, base, layout, components, utilities;';
