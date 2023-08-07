import { computed, effect } from "@preact-signals/unified-signals";
import { describe, expect, it, vi } from "vitest";
import { flatStore } from "./index";
import { setterOfFlatStore } from "./setter";

describe("store", () => {
  it("store has correct value", () => {
    const store = flatStore({
      count: 0,
    });

    expect(store.count).toBe(0);
    expect("count" in store).toBeTruthy();
    expect(Object.keys(store)).toEqual(["count"]);
  });

  it("prop can be deleted", () => {
    const store = flatStore<{ count?: number }>({
      count: 0,
    });

    delete store.count;
    expect(store.count).toBeUndefined();
  });
  it("store can have methods", () => {
    const store = flatStore({
      count: 0,
      increment() {
        this.count++;
      },
    });

    store.increment();
    expect(store.count).toBe(1);
  });
  it("store methods can be deleted", () => {
    const store = flatStore<{
      count: number;
      increment?(): void;
    }>({
      count: 0,
      increment() {
        this.count++;
      },
    });

    delete store.increment;
    expect(store.increment).toBeUndefined();
  });
  it("store can be updated", () => {
    const store = flatStore({
      count: 0,
    });

    store.count = 1;
    expect(store.count).toBe(1);
  });

  it("should be reactive", () => {
    const store = flatStore({
      count: 0,
    });

    const derived = computed(() => store.count);

    expect(derived.value).toBe(0);
    store.count = 10;
    expect(derived.value).toBe(10);
  });
});

describe("store setter", () => {
  it("should update store", () => {
    const store = flatStore({
      count: 0,
    });

    setterOfFlatStore(store)({
      count: 1,
    });

    expect(store.count).toBe(1);
  });
  it("should batch signal updates", () => {
    const store = flatStore({
      a: 0,
      b: 0,
    });
    const results: number[] = [];

    const dispose = effect(() => {
      results.push(store.a + store.b);
    });

    setterOfFlatStore(store)({
      a: 1,
      b: 10,
    });

    expect(results).toEqual([0, 11]);
    dispose();
  });

  it("should don't update store if value is the same", () => {
    const store = flatStore({
      count: 0,
    });

    const setter = setterOfFlatStore(store);
    const fn = vi.fn(() => {
      store.count;
    });
    const dispose = effect(fn);

    expect(fn).toHaveBeenCalledOnce();
    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    dispose();
  });

  it("shouldn't update store if value is the same", () => {
    const store = flatStore({
      count: 0,
    });

    const setter = setterOfFlatStore(store);
    const fn = vi.fn(() => {
      store.count;
    });
    const dispose = effect(fn);

    expect(fn).toHaveBeenCalledOnce();
    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    dispose();
  });
});
