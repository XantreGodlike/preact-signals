import { Show } from "@preact-signals/utils/components";
import { useComputed, useSignal } from "@preact/signals-react";
import { Counter } from "./Counter";

export const TestShow = (): JSX.Element => {
  const counter = useSignal(0);

  return (
    <div>
      <h1>TestShow</h1>
      <Counter counter={counter} />
      <Show fallback={<div>even</div>} when={() => counter.value % 2 === 0}>
        <div>odd</div>
      </Show>
      <Show
        fallback={<div>even</div>}
        when={useComputed(() => counter.value % 2 === 0)}
      >
        <div>odd</div>
      </Show>
      {/* works ok in react but is not reactive in preact */}
      {useComputed(() =>
        counter.value % 2 === 0 ? <div>even</div> : <div>odd</div>
      )}
    </div>
  );
};
