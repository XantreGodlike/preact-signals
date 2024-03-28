import {
  type ReadonlySignal,
  signal,
  Signal,
} from "@preact-signals/unified-signals";
import { useRef } from "react";
import { useConstant } from "./components/utils";
import { deepSignal } from "./store";

type Store = {
  get<T = unknown>(id: number): Signal<T> | null;
  reactive<T>(value: T, id: number): Signal<T>;
  lReactive<T>(value: T, id: number): ReadonlySignal<T>;
};

export const useStore = (): Store => {
  const storeMapRef = useRef<Map<number, Signal<any>> | null>(null);

  if (!storeMapRef.current) {
    storeMapRef.current = new Map();
  }
  const storeMap = storeMapRef.current;

  return useConstant(() => ({
    get: (id) => storeMap.get(id) ?? null,
    reactive: (value, id) => {
      {
        const cur = storeMap.get(id);
        if (cur) {
          return cur;
        }
      }

      const next = deepSignal(value);
      storeMap.set(id, next);

      return next;
    },
    lReactive: (value, id) => {
      const prev = storeMap.get(id) ?? signal(value);
      if (prev.peek() !== value) {
        prev.value = value;
      }
      return prev;
    },
  }));
};
