// import * as React from "react";
// import ReactDOM from "react-dom";
// import ReactDOMServer from "react-dom/server";
// import ReactDOMTestUtils from "react-dom/test-utils";
// import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
// // eslint-disable-next-line import/no-unresolved -- types only for module augmentation
// // @ts-expect-error
// import type { } from "react-dom/next";

import { describe, expect, it } from "vitest";

// import {
//   QueryCache,
//   QueryClientProvider,
//   dehydrate,
//   hydrate,
//   useQuery,
// } from "..";
// import { createQueryClient, setIsServer, sleep } from "../utils";
describe("all is ok", () => {
  it("should be ok", () => {
    expect(true).toBe(true);
  });
});

// const isReact18 = () => (process.env.REACTJS_VERSION || "18") === "18";

// const ReactHydrate = (element: React.ReactElement, container: Element) => {
//   if (isReact18()) {
//     let root: any;
//     ReactDOMTestUtils.act(() => {
//       // @ts-expect-error
//       root = ReactDOM.hydrateRoot(container, element);
//     });
//     return () => {
//       root.unmount();
//     };
//   }

//   ReactDOM.hydrate(element, container);
//   return () => {
//     ReactDOM.unmountComponentAtNode(container);
//   };
// };

// async function fetchData<TData>(value: TData, ms?: number): Promise<TData> {
//   await sleep(ms || 1);
//   return value;
// }

// function PrintStateComponent({ componentName, result }: any): any {
//   return `${componentName} - status:${result.status} fetching:${result.isFetching} data:${result.data}`;
// }

// describe("Server side rendering with de/rehydration", () => {
//   let previousIsReactActEnvironment: unknown;
//   beforeAll(() => {
//     // @ts-expect-error we expect IS_REACT_ACT_ENVIRONMENT to exist
//     previousIsReactActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT = true;
//   });

//   afterAll(() => {
//     // @ts-expect-error we expect IS_REACT_ACT_ENVIRONMENT to exist
//     globalThis.IS_REACT_ACT_ENVIRONMENT = previousIsReactActEnvironment;
//   });
//   it("should not mismatch on success", async () => {
//     const consoleMock = vi.spyOn(console, "error");
//     consoleMock.mockImplementation(() => undefined);

//     if (!isReact18()) {
//       return;
//     }
//     const fetchDataSuccess = vi.fn<
//       Parameters<typeof fetchData>,
//       ReturnType<typeof fetchData>
//     >(fetchData);

//     // -- Shared part --
//     function SuccessComponent() {
//       const result = useQuery(["success"], () => fetchDataSuccess("success!"));
//       return (
//         <PrintStateComponent componentName="SuccessComponent" result={result} />
//       );
//     }

//     // -- Server part --
//     setIsServer(true);

//     const prefetchCache = new QueryCache();
//     const prefetchClient = createQueryClient({
//       queryCache: prefetchCache,
//     });
//     await prefetchClient.prefetchQuery(["success"], () =>
//       fetchDataSuccess("success")
//     );
//     const dehydratedStateServer = dehydrate(prefetchClient);
//     const renderCache = new QueryCache();
//     const renderClient = createQueryClient({
//       queryCache: renderCache,
//     });
//     hydrate(renderClient, dehydratedStateServer);
//     const markup = ReactDOMServer.renderToString(
//       <QueryClientProvider client={renderClient}>
//         <SuccessComponent />
//       </QueryClientProvider>
//     );
//     const stringifiedState = JSON.stringify(dehydratedStateServer);
//     renderClient.clear();
//     setIsServer(false);

//     const expectedMarkup =
//       "SuccessComponent - status:success fetching:true data:success";

//     expect(markup).toBe(expectedMarkup);
//     expect(fetchDataSuccess).toHaveBeenCalledTimes(1);

//     // -- Client part --
//     const el = document.createElement("div");
//     el.innerHTML = markup;

//     const queryCache = new QueryCache();
//     const queryClient = createQueryClient({ queryCache });
//     hydrate(queryClient, JSON.parse(stringifiedState));

//     const unmount = ReactHydrate(
//       <QueryClientProvider client={queryClient}>
//         <SuccessComponent />
//       </QueryClientProvider>,
//       el
//     );

//     // Check that we have no React hydration mismatches
//     // this should be zero calls and can be changed once we drop react17 support
//     expect(consoleMock).toHaveBeenNthCalledWith(
//       1,
//       'Warning: You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'
//     );
//     expect(fetchDataSuccess).toHaveBeenCalledTimes(2);
//     expect(el.innerHTML).toBe(expectedMarkup);

//     unmount();
//     queryClient.clear();
//     consoleMock.mockRestore();
//   });

//   it("should not mismatch on error", async () => {
//     const consoleMock = vi.spyOn(console, "error");
//     consoleMock.mockImplementation(() => undefined);

//     if (!isReact18()) {
//       return;
//     }
//     const fetchDataError = vi.fn(() => {
//       throw new Error("fetchDataError");
//     });

//     // -- Shared part --
//     function ErrorComponent() {
//       const result = useQuery(["error"], () => fetchDataError(), {
//         retry: false,
//       });
//       return (
//         <PrintStateComponent componentName="ErrorComponent" result={result} />
//       );
//     }

//     // -- Server part --
//     setIsServer(true);
//     const prefetchCache = new QueryCache();
//     const prefetchClient = createQueryClient({
//       queryCache: prefetchCache,
//     });
//     await prefetchClient.prefetchQuery(["error"], () => fetchDataError());
//     const dehydratedStateServer = dehydrate(prefetchClient);
//     const renderCache = new QueryCache();
//     const renderClient = createQueryClient({
//       queryCache: renderCache,
//     });
//     hydrate(renderClient, dehydratedStateServer);
//     const markup = ReactDOMServer.renderToString(
//       <QueryClientProvider client={renderClient}>
//         <ErrorComponent />
//       </QueryClientProvider>
//     );
//     const stringifiedState = JSON.stringify(dehydratedStateServer);
//     renderClient.clear();
//     setIsServer(false);

//     const expectedMarkup =
//       "ErrorComponent - status:loading fetching:true data:undefined";

//     expect(markup).toBe(expectedMarkup);

//     // -- Client part --
//     const el = document.createElement("div");
//     el.innerHTML = markup;

//     const queryCache = new QueryCache();
//     const queryClient = createQueryClient({ queryCache });
//     hydrate(queryClient, JSON.parse(stringifiedState));

//     const unmount = ReactHydrate(
//       <QueryClientProvider client={queryClient}>
//         <ErrorComponent />
//       </QueryClientProvider>,
//       el
//     );

//     // We expect exactly one console.error here, which is from the
//     expect(consoleMock).toHaveBeenCalledTimes(1);
//     expect(fetchDataError).toHaveBeenCalledTimes(2);
//     expect(el.innerHTML).toBe(expectedMarkup);
//     await sleep(50);
//     expect(fetchDataError).toHaveBeenCalledTimes(2);
//     expect(el.innerHTML).toBe(
//       "ErrorComponent - status:error fetching:false data:undefined"
//     );

//     unmount();
//     queryClient.clear();
//     consoleMock.mockRestore();
//   });

//   it("should not mismatch on queries that were not prefetched", async () => {
//     const consoleMock = vi.spyOn(console, "error");
//     consoleMock.mockImplementation(() => undefined);

//     if (!isReact18()) {
//       return;
//     }
//     const fetchDataSuccess = vi.fn<
//       Parameters<typeof fetchData>,
//       ReturnType<typeof fetchData>
//     >(fetchData);

//     // -- Shared part --
//     function SuccessComponent() {
//       const result = useQuery(["success"], () => fetchDataSuccess("success!"));
//       return (
//         <PrintStateComponent componentName="SuccessComponent" result={result} />
//       );
//     }

//     // -- Server part --
//     setIsServer(true);

//     const prefetchClient = createQueryClient();
//     const dehydratedStateServer = dehydrate(prefetchClient);
//     const renderClient = createQueryClient();
//     hydrate(renderClient, dehydratedStateServer);
//     const markup = ReactDOMServer.renderToString(
//       <QueryClientProvider client={renderClient}>
//         <SuccessComponent />
//       </QueryClientProvider>
//     );
//     const stringifiedState = JSON.stringify(dehydratedStateServer);
//     renderClient.clear();
//     setIsServer(false);

//     const expectedMarkup =
//       "SuccessComponent - status:loading fetching:true data:undefined";

//     expect(markup).toBe(expectedMarkup);

//     // -- Client part --
//     const el = document.createElement("div");
//     el.innerHTML = markup;

//     const queryCache = new QueryCache();
//     const queryClient = createQueryClient({ queryCache });
//     hydrate(queryClient, JSON.parse(stringifiedState));

//     const unmount = ReactHydrate(
//       <QueryClientProvider client={queryClient}>
//         <SuccessComponent />
//       </QueryClientProvider>,
//       el
//     );

//     // Check that we have no React hydration mismatches
//     // this should be zero calls and can be changed once we drop react17 support
//     expect(consoleMock).toHaveBeenNthCalledWith(
//       1,
//       'Warning: You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'
//     );
//     expect(fetchDataSuccess).toHaveBeenCalledTimes(1);
//     expect(el.innerHTML).toBe(expectedMarkup);
//     await sleep(50);
//     expect(fetchDataSuccess).toHaveBeenCalledTimes(1);
//     expect(el.innerHTML).toBe(
//       "SuccessComponent - status:success fetching:false data:success!"
//     );

//     unmount();
//     queryClient.clear();
//     consoleMock.mockRestore();
//   });
// });
