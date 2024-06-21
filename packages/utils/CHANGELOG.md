# @preact-signals/utils

## 0.22.0

### Minor Changes

- dcd7e2c: Implemented `experimental_stateMacrosOptimization` for automatic optimization of state macroses in JSX

  Example:

  ```tsx
  import { $state, $derived } from "@preact-signals/utils/macro";

  let a = $state(10);
  let b = $state(20);

  const c = <>{a * b + 10}</>;
  ```

  Will be optimized to:

  ```tsx
  import { deepSignal as _deepSignal, $ as _$ } from "@preact-signals/utils";

  let a = _deepSignal(10);
  let b = _deepSignal(20);

  const c = <>{_$(() => a.value * b.value + 10)}</>;
  ```

  In result your components will have less rerender when using state bindings

## 0.21.0

### Minor Changes

- b29dbc5: Disallow reexports from macro lib
- b29dbc5: Added `$deref` feature for state macroses to get actual state macro reference

## 0.20.2

### Patch Changes

- 1b339b4: Fixed incorrect babel transform of state macro identifier inside of `$`

## 0.20.1

### Patch Changes

- 79d2ace: Updated @babel/helper-module-imports
- 3801b85: [babel]: started to refernce variables

## 0.20.0

### Minor Changes

- b9d6034: Implemented `reducerSignal` api (reducer pattern for signals)

### Patch Changes

- b9d6034: Improved hooks documentation

## 0.19.0

### Minor Changes

- 84b296d: - implemented `$derived` and `$useDerived` macros
  - documented state macros
- 253049c: Added validation of esm imports from `@preact-signals/utils/macro`

### Patch Changes

- 84b296d: Updated repository links
- Updated dependencies [84b296d]
  - @preact-signals/unified-signals@0.2.7

## 0.18.0

### Minor Changes

- 02878e1: Removed caching from Switch component. Added `Switch.Match` as alias for separete Match component
- f40d84f: `Show` stopped to be computed. Now reexcute on every parent render

### Patch Changes

- b7f18de: Removed unecessary signal creation in Computed

## 0.17.0

### Minor Changes

- bd7e4f5: Improved implementation of $ macro. Added correcteness checks, custom Errors. Added experimental_stateMacros flag (draft - will be changed)
- 19d63c9: - made macroses also a hooks

## 0.16.2

### Patch Changes

- Updated dependencies [db33dd8]
  - @preact-signals/unified-signals@0.2.6

## 0.16.1

### Patch Changes

- b595046: Improved treeshacking by avoiding `export *`

## 0.16.0

### Minor Changes

- a83109b: Added `@preact-signals/utils/integrations/reanimated`. It provides hooks to convert signals to Reanimated shared values.

  Example:

  ```tsx
  import { useSignal } from "@preact-signals/react";
  import { useAnimatedSharedValueOfAccessor } from "@preact-signals/utils/integrations/reanimated";
  import { useAnimatedStyle } from "react-native-reanimated";

  const maxLength = 10;
  function ExampleComponent() {
    const input = useSignal("");
    const progress = useAnimatedSharedValueOfAccessor(
      () => input.value.length / maxLength,
      {
        type: "spring",
        params: {
          damping: 10,
        },
      },
    );
    return (
      <View>
        <CustomInput value={input} onChangeText={(v) => (input.value = v)} />
        <Animated.View
          style={useAnimatedStyle(() => ({
            alignSelf: "stretch",
            backgroundColor: "blue",
            height: 10,
            transform: [{ scaleX: progress.value }],
          }))}
        />
      </View>
    );
  }
  ```

### Patch Changes

- a11836b: Added markdown docs
- 8fee2c3: Added documentation about using HOCs with third party libraries

## 0.15.6

### Patch Changes

- Updated dependencies [d9dca82]
  - @preact-signals/unified-signals@0.2.5

## 0.15.5

### Patch Changes

- 9b4a63f: Documented Next.js setup with `@preact-signals/safe-react`
- Updated dependencies [1170fba]
  - @preact-signals/unified-signals@0.2.4

## 0.15.4

### Patch Changes

- Updated dependencies [caf17f2]
  - @preact-signals/unified-signals@0.2.3

## 0.15.3

### Patch Changes

- ffabfd1: Marked `type-fest` as forward dependency. Fixes [#67](https://github.com/XantreDev/preact-signals/issues/67)

## 0.15.2

### Patch Changes

- ddd7223: Fixed exports field fallbacks

## 0.15.1

### Patch Changes

- c8bba5f: Fixed removal of all cjs imports by babel plugin

## 0.15.0

### Minor Changes

- ce35a28: Implemented macros to simplify creation of `ReactiveRef`-s

  Without macros:

  ```ts
  import { $ } from "@preact-signals/utils";

  const a = $(() => 1);
  ```

  With macros:

  ```ts
  import { $ } from "@preact-signals/utils/macro";

  const a = $(1);
  ```

  More information about macros setup can be found in [README](https://github.com/XantreDev/preact-signals/tree/main/packages/utils#macro-setup)

## 0.14.1

### Patch Changes

- 7999b3f: Reexport `writableRefOfArrayProp` and `writableRefOfObjectProp`

## 0.14.0

### Minor Changes

- d57bc98: Seted minimal peer version of `@preact-signals/safe-react` because of incompatibility of directives
- b875b2b: Renamed `Uncached` -> `ReactiveRef`, `WritableUncached` -> `WritableReactiveRef`.
  **Still exported as `Uncached` and `WritableUncached` for backwards compatibility. Can be removed in next versions**
  Added `writableRefOfObjectProp` and `writableRefOfArrayProp` to create writable refs for object/array properties.
  Improved jsdoc comments.

### Patch Changes

- b714456: Added info about autogenerated docs to README.md.
  Added install guide for `@preact-signals/safe-react`.

## 0.13.0

### Minor Changes

- 75d8a9f: # Breaking Changes

  This release changes opt-in and opt-out directives to be the same as in `@preact/signals-react`.

  `@trackSignals` -> `@useSignals`
  `@noTrackSignals` -> `@noUseSignals`

  To support new directives, you can just find and replace all instances of the old directives with the new ones.

## 0.12.3

### Patch Changes

- 2938683: Exported public apis
- 62fee87: Fix incorrect work of `reactifyLite` with regular props

## 0.12.2

### Patch Changes

- 6abe126: Improve deep signals types

## 0.12.1

### Patch Changes

- d26e23e: Fix call of `rafReaction` fn after disposal

## 0.12.0

### Minor Changes

- d3bbcd3: Added WritableUncached which receives getter and setter functions.

  ```ts
  const a = signal({ a: 1 });
  const aField = $w({
    get() {
      return a().a;
    },
    set(value) {
      a({ a: value });
    },
  });

  console.log(aField.value); // 1
  aField.value = 2;
  console.log(aField.value); // 2
  console.log(a.value); // { a: 2 }
  ```

- 8ad6ae2: Added `rafReaction` for easier integration with raw DOM.

  ### `rafReaction`

  Will execute reaction after deps changed on next animation frame. Return dispose function.

  ```tsx
  const sig = signal(1);
  const el = document.createElement("div");

  rafReaction(
    // deps
    () => sig.value,
    // effect
    (value) => {
      el.style.transform = `translateX(${value}px)`;
    },
  );

  sig.value = 10;
  ```

## 0.11.0

### Minor Changes

- eb2df1b: Moved deepReactivity api to main entry point

  `@preact-signals/utils/store` is now `@preact-signals/utils`
  `@preact-signals/utils/store/hooks` is now `@preact-signals/utils/hooks`

  For now the old paths are still available, but will be removed in the next minor version.

## 0.10.0

### Minor Changes

- d451d06: Added fallback for resolver that is not supporting package exports (react-native)

### Patch Changes

- 7684de9: Fixed typescript issue with `"moduleResolution": "node"`

## 0.9.4

### Patch Changes

- 0dc8789: Fixed sourcemaps
- Updated dependencies [f15ddca]
- Updated dependencies [078119f]
  - @preact-signals/safe-react@0.0.2

## 0.9.3

### Patch Changes

- 6b5fa85: Removed unnecessary private varitables usage from hocs entry
- 6b5fa85: Added `@preact-signals/safe-react` as peerDependency
- Updated dependencies [1090bd6]
- Updated dependencies [6b5fa85]
  - @preact-signals/safe-react@0.0.1
  - @preact-signals/unified-signals@0.2.2

## 0.9.2

### Patch Changes

- 342a376: Added information about usage with vanillajs

## 0.9.1

### Patch Changes

- f33edb4: Bumped `react-fast-hoc` to 0.3.2

## 0.9.0

### Minor Changes

- ce2bbb9: Removed implementation of JSX binding for @preact-signals/utils`.
From now `@preact-signals/utils` `$`has`Signal` in prototype chain.

  ```tsx
  console.log($(() => 10) instanceof Signal); // true
  ```

  It actually compatible with signal in most cases, but it has not value, only callback for calculation.

## 0.8.0

### Minor Changes

- 53f9f36: `@preact/signals-react-transform` support added
- 5320526: Creates signal that linked to value passed to hook, with unwrapping of signals to avoid `.value.value`

  ```tsx
  // always linked to value passed to hook
  const s1 = useLinkedSignal(Math.random() > 0.5 ? 1 : 0);
  // 0 | 1
  console.log(s1.peek());

  const s2 = useLinkedSignal(Math.random() > 0.5 ? signal(true) : false);
  // false | true
  console.log(s2.peek());

  // deeply unwrapping
  const s3 = useLinkedSignal(signal(signal(signal(false))));
  // false
  console.log(s3.peek());
  ```

## 0.7.0

### Minor Changes

- 0579c7d: Implemented deep signals tracking system, for more details check: https://github.com/XantreDev/preact-signals/blob/main/posts/deep-tracking.md
- 979002c: Added transitive dependecies and homepages

### Patch Changes

- 037bd2f: Documented new functionality with deep reactivity
- Updated dependencies [50befb5]
- Updated dependencies [979002c]
  - @preact-signals/unified-signals@0.2.1

## 0.6.0

### Minor Changes

- 4f2712c: Added signal prop to resource fetcher info. AbortSignal will be aborted after resource dispose
- 5cca167: Resource reimplemented using `untracked` and `flat-store`
- da9f104: - resource hooks started to work with `React.StrictMode`
  - exported `For` and `Computed` components from `@preact-signals/utils/components`
- 854821c: Added options to `reaction` utility.
  The memoize property is false by default, but can be turned on, that will memoize deps function

  ```ts
  // will only reexecute reaction if deps result actually changed
  reaction(
    () => {
      sig.value;
      return sig2.value;
    },
    () => {},
    {
      memoize: true,
    },
  );
  ```

- 049bb15: `flat-store`: all getters provided to flat store is automaticly converts to computeds
- e803c73: - fixed flat-store hooks bindings

  - implemented typesafe `createFlatStoreOfSignals`

  This function wraps provided **signals and value** to flat store. You can pass computed's too and it will be readonly field

  ```typescript
  const [store, setStore] = createFlatStoreOfSignals({
    a: 1,
    b: 2,
    c: signal(10),
    d: computed(() => 10),
  });

  // ok
  setStore({
    a: 10,
    b: 11,
    c: 12,
  });

  setStore({
    // type error and throws
    d: 10,
  });
  ```

  - implemented `useFlatStoreOfSignals` hook binding

- 049bb15: Alloweded to return dispose function from `reaction`

### Patch Changes

- 28bae03: Fixed typescript typings of exports entries

## 0.5.0

### Minor Changes

- 7b13f17: Exported resource from root

### Patch Changes

- 859edeb: Fixed no resource resetting
- 74255e3: Added info about react strict mode

## 0.4.0

### Minor Changes

- 7694443: Added `reaction` and renamed some apis
- e9a5fef: Removed internal utils exports. And added react binding for `reaction`
- ba769ed: Renamed hocs: 'signalifyProps' -> 'reactifyProps', 'reactify...' -> 'makeReactive...'
- e9a5fef: Added `reaction` utility for imperative reaction on deps changes
- 7dacde0: Documented library api
- 9db73dd: Restructured exports and file strtucture. Started to export all framework independent utils from root, other kind of utils started to export from `hocs` and `hooks`

### Patch Changes

- d2705bf: Fixed `# @preact-signals/utils jsx rendering in Preact

## 0.3.0

### Minor Changes

- 4b713b3: Merged polyfills into `@preact-signals/unified-signals`. From now unified-signals polyfills `untracked` by itself

### Patch Changes

- 0ba2b3a: Added correct git repository info
- Updated dependencies [460100f]
- Updated dependencies [4b713b3]
- Updated dependencies [0ba2b3a]
  - @preact-signals/unified-signals@0.2.0

## 0.2.0

### Minor Changes

- 8f3b9c5: Added `toggleSignal` utility for inverting boolean signal value
- 28d5595: Started using `@preact-signals/unified-signals`
- 9dd35ab: Moved all packages to utils package
- f4040ee: Added untracked tests and untracked fixes
- 81065a5: Added reactive hocs
- 14256ad: Added ReadonlyFlatStore
- c2bd0e6: Renamed store to flat store

### Patch Changes

- 4103d44: Polyfills created as package and utils was moves to `@preact-signals/utils`
- Updated dependencies [89badcb]
- Updated dependencies [1f96c91]
- Updated dependencies [4103d44]
- Updated dependencies [55cfc73]
  - @preact-signals/polyfills@0.2.0

## 0.1.0

### Minor Changes

- 48826c5: Moved reusabled functionality to `@preact-signals/utils`
