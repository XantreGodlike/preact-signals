import { it, describe } from "vitest";
import { format as _format } from "prettier";
import { transform } from "@babel/core";
import preactSignalsUtilsBabel, { BabelMacroPluginOptions } from "../babel";

const format = (code: string) => _format(code, { parser: "acorn" });

type TestCase = {
  type: "success" | "error";
  name: string;
  input: string;
  output: string;
  isCJS: boolean;
  options: BabelMacroPluginOptions | undefined;
};
const TestCase = {
  makeSuccess: (name: string, input: string, output: string): TestCase =>
    TestCase.makeConfigurable(name, input, output, {}),
  makeConfigurable: (
    name: string,
    input: string,
    output: string,
    params: Partial<Omit<TestCase, "input" | "output" | "name">>
  ): TestCase => ({
    type: params.type ?? "success",
    name,
    input,
    output,
    isCJS: params.isCJS ?? false,
    options: params.options ?? {
      enableStateMacros: true,
    },
  }),
  makeError: (name: string, input: string): TestCase =>
    TestCase.makeConfigurable(name, input, "", { type: "error" }),
};

describe.concurrent("@preact-signals/utils/macro", () => {
  const success = [
    TestCase.makeSuccess(
      "ESM import",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(1)
    `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      const a = _$(() => 1);
    `
    ),
    TestCase.makeSuccess(
      "Working inside of scopes",
      `
      import { $$ } from "@preact-signals/utils/macro";

      $$(10)
      {
        const a = $$(1)
        
        const $$ = 0
        
        console.log($$)
      }
      `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      _$(() => 10)
      {
        const a = $$(1)
        const $$ = 0;
        console.log($$);
      }
      `
    ),
    TestCase.makeSuccess(
      "Transforms only resolved as macro: unresolved",
      `$$(10)`,
      `$$(10)`
    ),
    TestCase.makeSuccess(
      "Must remove import event if not used",
      `
      import { $$ } from "@preact-signals/utils/macro";
      `,
      ``
    ),
    TestCase.makeSuccess(
      "Transforms only resolved as macro: declared",
      `
      import {$$} from "@preact-signals/utils/macro";
      $$(10)
      {
        const $$ = () => 10;
        $$(10)
      }
      `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      _$(() => 10);
      {
        const $$ = () => 10;
        $$(10);
      }
      `
    ),
    TestCase.makeSuccess(
      "Correctly handles braces in arrow function if using object",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$({ a: 1 })
    `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      const a = _$(() => ({
        a: 1,
      }));
    `
    ),
    TestCase.makeConfigurable(
      "CJS import",
      `
      const { $$ } = require("@preact-signals/utils/macro");

      const a = $$(1)
      `,
      `
      var _$ = require("@preact-signals/utils").$;
      const a = _$(() => 1);
      `,
      { isCJS: true }
    ),
    TestCase.makeConfigurable(
      "CJS import with multiple imports",
      `
      const { $$, $state } = require("@preact-signals/utils/macro");
      $$(10)
      `,
      `
      var _$ = require("@preact-signals/utils").$;
      const { $state } = require("@preact-signals/utils/macro");
      _$(() => 10)
      `,
      {
        isCJS: true,
        options: {
          enableStateMacros: false,
        },
      }
    ),
    TestCase.makeSuccess(
      "nested macro",
      `
      const {$$} = require("@preact-signals/utils/macro");

      $$($$(1))
      `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      _$(() => _$(() => 1));
      `
    ),
    TestCase.makeSuccess(
      "is not breaking directives",
      `
        'use client';
        'use strict';
        
        import { $$ } from "@preact-signals/utils/macro";

        const a = $$(1)
      `,
      `
        'use client';
        'use strict';
        
        import { $ as _$ } from "@preact-signals/utils";
        const a = _$(() => 1)
        `
    ),
    TestCase.makeSuccess(
      "is not break other imports",
      `
        import React from 'react';
        import {readFileSync} from 'fs';
        import * as path from 'path';
      `,
      `
        import React from 'react';
        import {readFileSync} from 'fs';
        import * as path from 'path';
      `
    ),
    TestCase.makeConfigurable(
      "is not break other imports (CJS)",
      `
        const React = require('react');
        const {readFileSync} = require('fs');
        const path = require('path');
      `,
      `
        const React = require('react');
        const {readFileSync} = require('fs');
        const path = require('path');
      `,
      { isCJS: true }
    ),
    TestCase.makeSuccess(
      "Replaces $state references",
      `
      import { $state, $linkedState } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $state(0)
        let b = $state(0)
        const c = $linkedState(0)
        a += 10
        a.value += 10
        a
        a.value
        
        b += 10
        c.value += 10
      }
      `,
      `
      import { useStore as _useStore } from "@preact-signals/utils/macro-helper";
      const _ = () => {
        const _store = _useStore();
        let a = _store.get(0) ?? _store.reactive(0, 0);
        let b = _store.get(1) ?? _store.reactive(0, 1);
        const c = _store.lReactive(0, 2);
        a.value += 10;
        a.value.value += 10;
        a.value;
        a.value.value;
        b.value += 10;
        c.value.value += 10;
      };
      `
    ),
  ];

  for (const { input, isCJS, name, options, output } of success) {
    it(name, async ({ expect }) => {
      expect(
        await format(
          transform(input, {
            plugins: [[preactSignalsUtilsBabel, options]],
            sourceType: isCJS ? "script" : "module",
          })?.code!
        )
      ).toEqual(await format(output));
    });
  }
  const fail = [
    TestCase.makeError(
      "Throws error if not a CallExpression",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$;
    `
    ),
    TestCase.makeError(
      "Throws error if callExpression called with multiple arguments",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(1, 2);
    `
    ),
    TestCase.makeError(
      "Throws error if callExpression called with no arguments",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$();
    `
    ),
    TestCase.makeError(
      "Throws error if used with spread argument",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(...[1]);
    `
    ),
    TestCase.makeError(
      "Throws error if `$state` used with var for variable declaration",
      `
      import { $state } from "@preact-signals/utils/macro";
      const _ = () => {
        var a = $state(0)
      }
      `
    ),
    TestCase.makeError(
      "Throws error if using $state outside of function",
      `
      import { $state } from "@preact-signals/utils/macro";
      let a = $state(0)
      `
    ),
    TestCase.makeConfigurable(
      "CJS cannot rest pattern in require",
      `
      const { $$, ...a } = require("@preact-signals/utils/macro");`,
      ``,
      { isCJS: true }
    ),
    TestCase.makeError(
      "Throws error if $linkedState assigned to a variable",
      `
      import { $linkedState } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $linkedState(0)
        a += 10
      }
      `
    ),
    // TODO: throw even has no import of known macro
    TestCase.makeError(
      "Throws if imports unknown macro",
      `
      import { $unknown, $$ } from "@preact-signals/utils/macro";
      `
    ),
    // TODO: throw even has no import of known macro
    TestCase.makeError(
      "Throws if imports unknown macro (CJS)",
      `
      const { $unknown, $$ } = require("@preact-signals/utils/macro")
      `
    ),
    TestCase.makeError(
      "Throws if state macros is used outside of variable declaration ($state)",
      `
      import { $state } from "@preact-signals/utils/macro";
      const _ = () => {
        $state(0)
      }`
    ),
    TestCase.makeError(
      "Throws if state macros is used outside of variable declaration ($linkedState)",
      `
      import { $linkedState, $state } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $state(0)
        $linkedState(0)
      }`
    ),
  ];

  for (const { input, isCJS, name, options } of fail) {
    it(name, async ({ expect }) => {
      expect(() => {
        try {
          transform(input, {
            plugins: [[preactSignalsUtilsBabel, options]],
            sourceType: isCJS ? "script" : "module",
          });
        } catch (e) {
          // console.log(e);
          throw e;
        }
      }).toThrowError();
    });
  }
});
