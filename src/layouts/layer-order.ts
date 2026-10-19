// Va en un `<style>` inline al principio de `<head>` porque el orden lo fija la primera
// aparición de cada capa, y en la hoja de Astro los estilos de los componentes van antes
// que el CSS global (ADR 0013). Su hash lo añade `astro.config.ts`.
export const layerOrder = '@layer reset, tokens, base, layout, components, utilities;';
