import { afterEach, describe, expect, it, vi } from 'vitest';
import { hydrate } from './hydration.ts';

const element = (hydration?: string): HTMLElement =>
  ({ dataset: hydration === undefined ? {} : { hydration } }) as unknown as HTMLElement;

const fakeObserver = () => {
  const observer = { observe: vi.fn(), disconnect: vi.fn() };
  let callback: IntersectionObserverCallback | undefined;
  const create = (cb: IntersectionObserverCallback) => {
    callback = cb;
    return observer;
  };
  const intersect = (isIntersecting: boolean) =>
    callback?.(
      [{ isIntersecting } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
  return { observer, create, intersect };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hydrate', () => {
  it('carga al instante con `load` o sin estrategia', () => {
    for (const root of [element('load'), element()]) {
      const load = vi.fn(() => Promise.resolve());
      const { create, observer } = fakeObserver();
      hydrate(root, load, create);
      expect(load).toHaveBeenCalledOnce();
      expect(observer.observe).not.toHaveBeenCalled();
    }
  });

  it('con `visible`, carga una sola vez al entrar en pantalla', () => {
    const root = element('visible');
    const load = vi.fn(() => Promise.resolve());
    const { create, observer, intersect } = fakeObserver();
    hydrate(root, load, create);
    expect(observer.observe).toHaveBeenCalledWith(root);
    expect(load).not.toHaveBeenCalled();

    intersect(false);
    expect(load).not.toHaveBeenCalled();
    intersect(true);
    expect(load).toHaveBeenCalledOnce();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  it('con `visible` y sin IntersectionObserver, carga al instante', () => {
    const load = vi.fn(() => Promise.resolve());
    hydrate(element('visible'), load, () => null);
    expect(load).toHaveBeenCalledOnce();
  });

  it('usa el IntersectionObserver global si existe', () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        disconnect = vi.fn();
      },
    );
    const root = element('visible');
    const load = vi.fn(() => Promise.resolve());
    hydrate(root, load);
    expect(observe).toHaveBeenCalledWith(root);
    expect(load).not.toHaveBeenCalled();
  });

  it('sin IntersectionObserver global, carga al instante', () => {
    expect(typeof IntersectionObserver).toBe('undefined');
    const load = vi.fn(() => Promise.resolve());
    hydrate(element('visible'), load);
    expect(load).toHaveBeenCalledOnce();
  });
});
