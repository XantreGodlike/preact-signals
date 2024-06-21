# @preact-signals/query

## 2.0.6

### Patch Changes

- Updated dependencies [dcd7e2c]
  - @preact-signals/utils@0.22.0

## 2.0.5

### Patch Changes

- Updated dependencies [b29dbc5]
- Updated dependencies [b29dbc5]
  - @preact-signals/utils@0.21.0

## 2.0.4

### Patch Changes

- Updated dependencies [1b339b4]
  - @preact-signals/utils@0.20.2

## 2.0.3

### Patch Changes

- Updated dependencies [79d2ace]
- Updated dependencies [3801b85]
  - @preact-signals/utils@0.20.1

## 2.0.2

### Patch Changes

- Updated dependencies [b9d6034]
- Updated dependencies [b9d6034]
  - @preact-signals/utils@0.20.0

## 2.0.1

### Patch Changes

- 6b09439: Export `useQueryClient# @preact-signals/query
- 84b296d: Updated repository links
- Updated dependencies [84b296d]
- Updated dependencies [253049c]
- Updated dependencies [84b296d]
  - @preact-signals/utils@0.19.0
  - @preact-signals/unified-signals@0.2.7

## 2.0.0

### Major Changes

- 983dd69: # Breaking change:

  Added `executeOptionsOnReferenceChange` (default: true) to reexectue mutation or query options callback on each reference change (for proper update depending on closuje)
  This change is addresses issue that everything is needed to be signal to work properly with `useMutation# @preact-signals/query

  ```ts
  const [state, setState] = useState(0);
  useMutation$(() => ({
    mutationFn,
    onSuccess: () => {
      // previous behavior - state will be recaptured only if reactive dependency changed (in case without deps it will always be 0)
      // new behavior will be synced with current state value
      console.log(state);
    },
  }));
  ```

  Old behavior is can be used with `executeOptionsOnReferenceChange`: false. Options callback will be reexecuted only when deps tracked by reactivity changes

  ```ts
  const [state, setState] = useState(0);
  useMutation$(() => ({
    mutationFn,
    executeOptionsOnReferenceChange: false,
    onSuccess: () => {
      // state will be recaptured only if reactive dependency changed (in case without deps it will always be 0)
      console.log(state);
    },
  }));
  ```

### Patch Changes

- e1ab313: Fixed work of `useErrorBoundary` prop for `useMutation# @preact-signals/query. Now it throws an error while mutation is failed
- e1ab313: Fixed incorrect `useMutation# @preact-signals/query return type
- e1ab313: Mutations options used to be never updated after mutation creation

## 1.4.5

### Patch Changes

- Updated dependencies [02878e1]
- Updated dependencies [f40d84f]
- Updated dependencies [b7f18de]
  - @preact-signals/utils@0.18.0

## 1.4.4

### Patch Changes

- Updated dependencies [bd7e4f5]
- Updated dependencies [19d63c9]
  - @preact-signals/utils@0.17.0

## 1.4.3

### Patch Changes

- 3524db0: Exports [`SuspenseBehaviorProp`](https://github.com/XantreDev/preact-signals/issues/86) type
- Updated dependencies [db33dd8]
  - @preact-signals/unified-signals@0.2.6
  - @preact-signals/utils@0.16.2

## 1.4.2

### Patch Changes

- Updated dependencies [b595046]
  - @preact-signals/utils@0.16.1

## 1.4.1

### Patch Changes

- Updated dependencies [a11836b]
- Updated dependencies [8fee2c3]
- Updated dependencies [a83109b]
  - @preact-signals/utils@0.16.0

## 1.4.0

### Minor Changes

- e0d55b4: Added `suspenseBehavior` prop to more control on suspense queries [#60](https://github.com/XantreDev/preact-signals/issues/60)

## 1.3.18

### Patch Changes

- Updated dependencies [d9dca82]
  - @preact-signals/unified-signals@0.2.5
  - @preact-signals/utils@0.15.6

## 1.3.17

### Patch Changes

- Updated dependencies [9b4a63f]
- Updated dependencies [1170fba]
  - @preact-signals/utils@0.15.5
  - @preact-signals/unified-signals@0.2.4

## 1.3.16

### Patch Changes

- Updated dependencies [caf17f2]
  - @preact-signals/unified-signals@0.2.3
  - @preact-signals/utils@0.15.4

## 1.3.15

### Patch Changes

- ffabfd1: Marked `type-fest` as forward dependency. Fixes [#67](https://github.com/XantreDev/preact-signals/issues/67)
- Updated dependencies [ffabfd1]
  - @preact-signals/utils@0.15.3

## 1.3.14

### Patch Changes

- Updated dependencies [ddd7223]
  - @preact-signals/utils@0.15.2

## 1.3.13

### Patch Changes

- Updated dependencies [c8bba5f]
  - @preact-signals/utils@0.15.1

## 1.3.12

### Patch Changes

- Updated dependencies [ce35a28]
  - @preact-signals/utils@0.15.0

## 1.3.11

### Patch Changes

- 97be1be: Fix: reexport `useMutation# @preact-signals/query

## 1.3.10

### Patch Changes

- Updated dependencies [7999b3f]
  - @preact-signals/utils@0.14.1

## 1.3.9

### Patch Changes

- Updated dependencies [b714456]
- Updated dependencies [d57bc98]
- Updated dependencies [b875b2b]
  - @preact-signals/utils@0.14.0

## 1.3.8

### Patch Changes

- Updated dependencies [75d8a9f]
  - @preact-signals/utils@0.13.0

## 1.3.7

### Patch Changes

- Updated dependencies [2938683]
- Updated dependencies [62fee87]
  - @preact-signals/utils@0.12.3

## 1.3.6

### Patch Changes

- Updated dependencies [6abe126]
  - @preact-signals/utils@0.12.2

## 1.3.5

### Patch Changes

- Updated dependencies [d26e23e]
  - @preact-signals/utils@0.12.1

## 1.3.4

### Patch Changes

- Updated dependencies [d3bbcd3]
- Updated dependencies [8ad6ae2]
  - @preact-signals/utils@0.12.0

## 1.3.3

### Patch Changes

- Updated dependencies [eb2df1b]
  - @preact-signals/utils@0.11.0

## 1.3.2

### Patch Changes

- Updated dependencies [d451d06]
- Updated dependencies [7684de9]
  - @preact-signals/utils@0.10.0

## 1.3.1

### Patch Changes

- Updated dependencies [f15ddca]
- Updated dependencies [0dc8789]
- Updated dependencies [078119f]
  - @preact-signals/safe-react@0.0.2
  - @preact-signals/utils@0.9.4

## 1.3.0

### Minor Changes

- b0859ce: Removed incorrect `@trackSignals` directives for `@preact/signals-react-transform`

### Patch Changes

- 6b5fa85: Added `@preact-signals/safe-react` as peerDependency
- Updated dependencies [1090bd6]
- Updated dependencies [6b5fa85]
- Updated dependencies [6b5fa85]
  - @preact-signals/safe-react@0.0.1
  - @preact-signals/utils@0.9.3
  - @preact-signals/unified-signals@0.2.2

## 1.2.3

### Patch Changes

- Updated dependencies [342a376]
  - @preact-signals/utils@0.9.2

## 1.2.2

### Patch Changes

- Updated dependencies [f33edb4]
  - @preact-signals/utils@0.9.1

## 1.2.1

### Patch Changes

- Updated dependencies [ce2bbb9]
  - @preact-signals/utils@0.9.0

## 1.2.0

### Minor Changes

- 53f9f36: `@preact/signals-react-transform` support added

### Patch Changes

- Updated dependencies [53f9f36]
- Updated dependencies [5320526]
  - @preact-signals/utils@0.8.0

## 1.1.0

### Minor Changes

- 979002c: Added transitive dependecies and homepages

### Patch Changes

- 44f5f31: Fixed accident subscriptions to signals which callbacks like `queryFn` provided in options can read
- Updated dependencies [037bd2f]
- Updated dependencies [0579c7d]
- Updated dependencies [50befb5]
- Updated dependencies [979002c]
  - @preact-signals/utils@0.7.0
  - @preact-signals/unified-signals@0.2.1

## 1.0.5

### Patch Changes

- Updated dependencies [4f2712c]
- Updated dependencies [5cca167]
- Updated dependencies [28bae03]
- Updated dependencies [da9f104]
- Updated dependencies [854821c]
- Updated dependencies [049bb15]
- Updated dependencies [e803c73]
- Updated dependencies [049bb15]
  - @preact-signals/utils@0.6.0

## 1.0.4

### Patch Changes

- Updated dependencies [7b13f17]
- Updated dependencies [859edeb]
- Updated dependencies [74255e3]
  - @preact-signals/utils@0.5.0

## 1.0.3

### Patch Changes

- d2705bf: Fixed installation for preact in readme
- Updated dependencies [7694443]
- Updated dependencies [d2705bf]
- Updated dependencies [e9a5fef]
- Updated dependencies [ba769ed]
- Updated dependencies [e9a5fef]
- Updated dependencies [7dacde0]
- Updated dependencies [9db73dd]
  - @preact-signals/utils@0.4.0

## 1.0.2

### Patch Changes

- be69f42: Added more installation info to readme
- 0ba2b3a: Added correct git repository info
- Updated dependencies [460100f]
- Updated dependencies [4b713b3]
- Updated dependencies [0ba2b3a]
  - @preact-signals/unified-signals@0.2.0
  - @preact-signals/utils@0.3.0

## 1.0.1

### Patch Changes

- d725142: Added `preact` adoption example in docs
- da805ac: Removed chat gpt thing from readme))

## 1.0.0

### Minor Changes

- 5777d3a: Added `dataSafe` field will return `undefined` in case of error/loading
- 14256ad: Changed api to for `useIsFetching$` to direclty return signal
- 1fe23e2: Started using `@preact-signals/unified-signals`
- 55cfc73: Implemented suspense and useErrorBoundary for `useQuery$`
- 538d2a9: Added `useMutation$` and basic tests

### Patch Changes

- Updated dependencies [8f3b9c5]
- Updated dependencies [28d5595]
- Updated dependencies [4103d44]
- Updated dependencies [9dd35ab]
- Updated dependencies [f4040ee]
- Updated dependencies [81065a5]
- Updated dependencies [14256ad]
- Updated dependencies [c2bd0e6]
  - @preact-signals/utils@0.2.0
