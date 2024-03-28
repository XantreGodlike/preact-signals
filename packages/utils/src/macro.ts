import { ReactiveRef } from "./lib";

console.log(
  "To use macro, you need to use babel plugin. Check out the README for more info."
);
/**
 * This function is compile time shorthand for `$(() => value)`
 *
 * @example
 * ```tsx
 * import { $$ } from "@preact-signals/utils/macro";
 *
 * // This is equivalent to:
 * // const a = $(() => 1)
 * const a = $$(1)
 * ```
 *
 * @example A more complex example
 * ```tsx
 * import { $$ } from "@preact-signals/utils/macro";
 *
 * const a = signal(1)
 * const sig = signal(1)
 * const b = $$(a.value + sig.value)
 *
 * effect(() => {
 *   console.log(b.value)
 * })
 *
 * // logs 3
 * sig.value = 2
 *
 * // logs 4
 * a.value = 2
 * ```
 */
export const $$: <T>(value: T) => ReactiveRef<T> = () => {
  throw new Error("This function is only available at compile time");
};

export const $state = <T>(value: T): T => {
  throw new Error("This function is only available at compile time");
};
export const $linkedState = <T>(value: T): T => {
  throw new Error("This function is only available at compile time");
};
