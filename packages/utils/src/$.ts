import { ReadonlySignal, computed, useComputed } from "@preact/signals-react";
import { Accessor } from "./utils";

declare class Uncached<T> {
  constructor(accessor: Accessor<T>);
  get value(): T;
  /** @internal */
  _accessor(): T;
}

interface Uncached<T> extends JSX.Element {}

const ReactElement = Symbol.for("react.element");

function Uncached<T>(this: Uncached<T>, accessor: Accessor<T>) {
  this._accessor = accessor;
}
Object.defineProperty(Uncached.prototype, "value", {
  get() {
    return this._accessor();
  },
});

// JSX bindings
const RAccessorComponent = ({ data }: { data: Uncached<unknown> }) => {
  return useComputed(data._accessor).value;
};
Object.defineProperties(Uncached.prototype, {
  $$typeof: {
    value: ReactElement,
    configurable: true,
  },
  type: {
    value: RAccessorComponent,
    configurable: true,
  },
  props: {
    configurable: true,
    get() {
      return { data: this };
    },
  },
  ref: {
    configurable: true,
    value: null,
  },
});

// Lighter lazy computation container without memoizing results
export const $ = <T>(accessor: Accessor<T>): Uncached<T> =>
  new Uncached(accessor);

const computesCache = new WeakMap<Accessor<any>, ReadonlySignal<any>>();
export const computedOf$ = <T>($value: Uncached<T>): ReadonlySignal<T> =>
  computesCache.get($value._accessor) ??
  (computesCache.set($value._accessor, computed($value._accessor)),
  computesCache.get($value._accessor)!);

export { Uncached };