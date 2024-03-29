import { untracked } from "@preact-signals/utils";
import { useSignalEffectOnce } from "@preact-signals/utils/hooks";
import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "../react-query";
import { useQueryClient$ } from "../react-query/QueryClientProvider";
import {
  createHooksComponentElement,
  createQueryClient,
  fetchTime,
  queryKey,
  queueSignal,
  renderWithClient,
} from "./utils";

describe("useQueryClient$()", () => {
  it("should get", async () => {
    const key = queryKey();
    const queryFn = vi.fn(fetchTime(10));
    const { dispose, emit, queue } = queueSignal();
    const client = createQueryClient();
    renderWithClient(
      client,
      <>
        {createHooksComponentElement(() => {
          const data = useQueryClient$();

          emit(untracked(() => data.value));
        })}
      </>
    );

    expect(queue[0]).toBe(client);
    dispose();
  });
  it("should react to swap of query client", async () => {
    const { dispose, emit, queue } = queueSignal();
    const firstClient = createQueryClient();
    const secondClient = createQueryClient();
    const content = createHooksComponentElement(() => {
      const client$ = useQueryClient$();
      emit(untracked(() => client$.value));
      useSignalEffectOnce(() => {
        emit(client$.value);
      });
    });
    const { rerender } = render(
      <QueryClientProvider client={firstClient}>{content}</QueryClientProvider>
    );
    expect(queue[0]).toBe(firstClient);

    rerender(
      <QueryClientProvider client={secondClient}>{content}</QueryClientProvider>
    );
    expect(queue).toEqual([firstClient, secondClient]);
    dispose();
  });
  it("should not produce extra effect reevals", async () => {
    const { dispose, emit, queue } = queueSignal();
    const firstClient = createQueryClient();
    const secondClient = createQueryClient();
    let effectTimesCalled = 0;
    const content = createHooksComponentElement(() => {
      const client$ = useQueryClient$();
      emit(untracked(() => client$.value));
      useSignalEffectOnce(() => {
        effectTimesCalled++;
        emit(client$.value);
      });
    });
    const { rerender } = render(
      <QueryClientProvider client={firstClient}>{content}</QueryClientProvider>
    );
    expect(queue[0]).toBe(firstClient);
    expect(effectTimesCalled).toBe(1);

    rerender(
      <QueryClientProvider client={secondClient}>{content}</QueryClientProvider>
    );
    expect(queue).toEqual([firstClient, secondClient]);
    expect(effectTimesCalled).toBe(2);
    dispose();
  });
});
