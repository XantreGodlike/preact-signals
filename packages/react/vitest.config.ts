import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

const selfName = packageJson.name;

const exactRegEx = (it: string) => new RegExp(`^${it}$`);

export default defineConfig({
  esbuild: {
    jsx: "preserve",
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./setupVitest.ts",

    alias: [
      {
        find: exactRegEx("react"),
        replacement: require.resolve(packageJson.exports["./react"]),
      },
      {
        find: exactRegEx(`${selfName}/jsx-runtime`),
        replacement: require.resolve(packageJson.exports["./jsx-runtime"]),
      },
      {
        find: `${selfName}/jsx-dev-runtime`,
        replacement: require.resolve(packageJson.exports["./jsx-dev-runtime"]),
      },
      {
        find: exactRegEx(`${selfName}/tracking`),
        replacement: require.resolve(
          packageJson.exports["./tracking"]["react-native"]
        ),
      },
      {
        find: exactRegEx(selfName),
        replacement: "./src/index.ts",
      },
      {
        find: "@preact/signals-react",
        replacement: "./src/index.ts",
      },
    ],
  },
  plugins: [
    react({
      jsxImportSource: selfName,
      babel: {
        plugins: ["module:@preact-signals/safe-react/babel"],
      },
    }),
  ],
  define: {
    __DEV__: true,
  },
});
