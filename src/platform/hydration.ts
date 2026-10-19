// Decisión 6 (ADR 0005): sin framework, la estrategia de `meta.ts` llega en
// `data-hydration` y la interfaz se carga con `import()`.

type Observer = Pick<IntersectionObserver, 'observe' | 'disconnect'>;
type CreateObserver = (callback: IntersectionObserverCallback) => Observer | null;

const createIntersectionObserver: CreateObserver = (callback) =>
  typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(callback);

/**
 * Llama a `load` al instante, o cuando `root` entra en pantalla si `root` tiene
 * `data-hydration="visible"`. Sin `IntersectionObserver`, carga al instante.
 */
export const hydrate = (
  root: HTMLElement,
  load: () => Promise<unknown>,
  createObserver: CreateObserver = createIntersectionObserver,
): void => {
  const observer =
    root.dataset['hydration'] === 'visible'
      ? createObserver((entries, self) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          self.disconnect();
          void load();
        })
      : null;
  if (observer === null) void load();
  else observer.observe(root);
};
