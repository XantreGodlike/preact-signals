import {
  types as BabelTypes,
  template as BabelTemplate,
  PluginObj,
  PluginPass,
  NodePath,
} from "@babel/core";
import type { Binding } from "@babel/traverse";
import { isModule, addNamed } from "@babel/helper-module-imports";
import assert from "assert";

const PLUGIN_NAME = "@preact-signals/utils/babel";
type PluginStoreMap = {
  $stateIdentifier: Set<BabelTypes.Identifier>;
  $linkedStateIdentifier: Set<BabelTypes.Identifier>;
} & Record<`${"imports" | "requires"}/${string}`, BabelTypes.Identifier>;

const self = {
  get: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T
  ): PluginStoreMap[T] | undefined => pass.get(`${PLUGIN_NAME}/${name}`),
  set: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T,
    v: PluginStoreMap[T]
  ) => pass.set(`${PLUGIN_NAME}/${name}`, v),
  addToSet: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T,
    v: PluginStoreMap[T] extends Set<infer U> ? U : never
  ) => {
    let set = self.get(pass, name) as undefined | Set<any>;

    if (!set) {
      set = new Set();
      // @ts-expect-error complex types
      self.set(pass, name, set);
    }
    set.add(v);
  },
  hasInSet: <T extends keyof PluginStoreMap>(
    pass: PluginPass,
    name: T,
    v: PluginStoreMap[T] extends Set<infer U> ? U : never
  ) => {
    const set = self.get(pass, name);
    if (!set) return false;
    // @ts-expect-error complex types
    return set.has(v);
  },
};

const knownImportSpecifiers = new Set(["$$", "$state", "$linkedState"]);

function createImportLazily(
  t: typeof BabelTypes,
  pass: PluginPass,
  path: NodePath<BabelTypes.Program>,
  importName: string,
  source: string
): () => BabelTypes.Identifier {
  return () => {
    if (isModule(path)) {
      let reference = self.get(pass, `imports/${importName}`);
      if (reference) return t.cloneNode(reference);
      reference = addNamed(path, importName, source, {
        importedInterop: "uncompiled",
        importPosition: "after",
      });
      self.set(pass, `imports/${importName}`, reference);

      const matchesImportName = (
        s: BabelTypes.ImportDeclaration["specifiers"][0]
      ) => {
        if (s.type !== "ImportSpecifier") return false;
        return (
          (s.imported.type === "Identifier" &&
            s.imported.name === importName) ||
          (s.imported.type === "StringLiteral" &&
            s.imported.value === importName)
        );
      };

      for (let statement of path.get("body")) {
        if (
          statement.isImportDeclaration() &&
          statement.node.source.value === source &&
          statement.node.specifiers.some(matchesImportName)
        ) {
          path.scope.registerDeclaration(statement);
          break;
        }
      }
      return reference;
    }

    let reference = self.get(pass, `requires/${importName}`);
    if (reference) {
      return t.cloneNode(reference);
    }
    reference = addNamed(path, importName, source, {
      importedInterop: "uncompiled",
    });
    // TODO: use this code in safe-react babel plugin
    path.traverse({
      VariableDeclaration(path) {
        for (const declarator of path.get("declarations")) {
          if (
            declarator.node.id.type === "Identifier" &&
            declarator.node.id.name === importName
          ) {
            path.scope.registerDeclaration(declarator);
            break;
          }
        }
      },
    });
    self.set(pass, `requires/${importName}`, reference);

    return reference;
  };
}

interface PluginArgs {
  types: typeof BabelTypes;
  template: typeof BabelTemplate;
}

const isImportMacrosName = (name: string) =>
  name === "@preact-signals/utils/macro";

const isVariableDeclaratorRefMacros = (
  child: NodePath<BabelTypes.VariableDeclarator>
) =>
  child.node.init?.type === "CallExpression" &&
  child.node.init.callee.type === "Identifier" &&
  child.node.init.callee.name === "require" &&
  child.node.init.arguments.length === 1 &&
  child.node.init.arguments[0]?.type === "StringLiteral" &&
  isImportMacrosName(child.node.init.arguments[0].value);

const stateMacros = ["$state", "$linkedState"] as const;
const refMacro = "$$" as const;

const importSpecifiers = [...stateMacros, refMacro];

type RefMacro = typeof refMacro;
type StateMacros = (typeof stateMacros)[number];
type MacroIdentifier = RefMacro | StateMacros;

const getStateMacros = (
  node: BabelTypes.VariableDeclarator
): StateMacros | null => {
  if (!node.init || node.init.type !== "CallExpression") return null;
  if (node.init.callee.type !== "Identifier") return null;
  const calleeName = node.init.callee.name;

  if (calleeName === "$state") return "$state";
  if (calleeName === "$linkedState") return "$linkedState";

  return null;
};

const getStateMacrosBody = (
  node: BabelTypes.VariableDeclarator
): [BabelTypes.Identifier, BabelTypes.Expression] | null => {
  if (!node.init || node.init.type !== "CallExpression") return null;
  if (
    node.init.callee.type !== "Identifier" ||
    (stateMacros as readonly string[]).indexOf(node.init.callee.name) === -1
  ) {
    return null;
  }

  const args = node.init.arguments;
  if (node.id.type !== "Identifier") {
    throw SyntaxErrorWithLoc.makeFromPosition(
      "Expected $state to be used with identifier for VariableDeclarator",
      node.id.loc?.start
    );
  }
  const nodeName = node.id.name;
  if (args.length === 0 || args.length > 1) {
    throw SyntaxErrorWithLoc.makeFromPosition(
      `Expected at exact one argument for ${nodeName}`,
      node.init.loc?.start
    );
  }
  const arg = args[0];
  if (
    !arg ||
    arg.type === "JSXNamespacedName" ||
    arg.type === "ArgumentPlaceholder" ||
    arg.type === "SpreadElement"
  ) {
    throw SyntaxErrorWithLoc.makeFromPosition(
      `Argument for ${nodeName} expected to be a valid expression`,
      arg?.loc?.start
    );
  }
  return [node.id, arg];
};

export type BabelMacroPluginOptions = {
  enableStateMacros: boolean;
};

class SyntaxErrorWithLoc extends SyntaxError {
  loc: { line: number; column: number };
  private constructor(message: string, line: number, column: number) {
    super(message);
    this.loc = { line, column };
  }
  public static make(message: string, line: number, column: number) {
    return new SyntaxErrorWithLoc(message, line, column);
  }
  public static makeFromPosition(
    message: string,
    position: { line: number; column: number } | undefined
  ) {
    return position
      ? new SyntaxErrorWithLoc(message, position.line, position.column)
      : new SyntaxError(message);
  }
}

/**
 *
 * @param binding
 * @param importSpecifier
 * @returns null if there is no import to remove, otherwise a function to remove the import
 */
const createRemoveImport = (
  scope: { removeBinding: (name: string) => void },
  binding: Binding,
  importSpecifier: MacroIdentifier
): null | (() => void) => {
  if (
    binding.path.isVariableDeclarator() &&
    isVariableDeclaratorRefMacros(binding.path)
  ) {
    const varDecl = binding.path;
    return () => {
      if (varDecl.node.id.type === "ObjectPattern") {
        if (varDecl.node.id.properties.length > 1) {
          for (const prop of varDecl.node.id.properties) {
            if (prop.type === "RestElement") {
              throw SyntaxErrorWithLoc.makeFromPosition(
                "Rest elements are not supported",
                prop.loc?.start
              );
            }
            if (prop.value.type !== "Identifier") {
              throw SyntaxErrorWithLoc.makeFromPosition(
                "Expected import from macros to be an identifier",
                prop.value.loc?.start
              );
            }
            if (prop.shorthand) {
              assert(
                prop.key.type === "Identifier" &&
                  importSpecifiers.includes(prop.key.name as MacroIdentifier),
                SyntaxErrorWithLoc.makeFromPosition(
                  `Expected to be Identifier and key to be one of ${importSpecifiers.join(
                    ", "
                  )}`,
                  prop.key.loc?.start
                )
              );
            }

            assert(
              prop.key.type === "Identifier" &&
                prop.value.type === "Identifier" &&
                prop.key.name === prop.value.name &&
                importSpecifiers.includes(prop.key.name as MacroIdentifier),
              SyntaxErrorWithLoc.makeFromPosition(
                `Expected key to be one of ${importSpecifiers.join(", ")}`,
                prop.key.loc?.start
              )
            );
          }
          const elIndex = varDecl.node.id.properties.findIndex((prop) => {
            return (
              prop.type === "ObjectProperty" &&
              prop.key.type === "Identifier" &&
              prop.key.name === importSpecifier
            );
          });
          if (elIndex !== -1) {
            varDecl.node.id.properties.splice(elIndex, 1);
            scope.removeBinding(importSpecifier);
            return;
          }
        }
      }
      binding.path.remove();
      scope.removeBinding(importSpecifier);
    };
  }
  if (
    binding.path.node.type === "ImportSpecifier" &&
    binding.path.parent.type === "ImportDeclaration" &&
    isImportMacrosName(binding.path.parent.source.value)
  ) {
    for (const specifier of binding.path.parent.specifiers) {
      assert(specifier.type === "ImportSpecifier");

      const value =
        specifier.imported.type === "Identifier"
          ? specifier.imported.name
          : specifier.imported.value;
      if (!importSpecifiers.includes(value as MacroIdentifier)) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected ${value} to be one of ${importSpecifiers.join(", ")}`,
          specifier.imported.loc?.start
        );
      }
    }
    const parentPath = binding.path.parentPath;

    if (!parentPath) {
      throw new Error("invariant: importSpecifier should have a parentPath");
    }
    assert(parentPath.isImportDeclaration());
    return () => {
      if (parentPath.node.specifiers.length === 1) {
        parentPath.remove();
      } else {
        const specifier = parentPath
          .get("specifiers")
          .find(({ node: spec }) => {
            return (
              spec.type === "ImportSpecifier" &&
              spec.imported.type === "Identifier" &&
              spec.imported.name === importSpecifier
            );
          });
        assert(specifier?.type === "ImportSpecifier");
        specifier.remove();
      }

      scope.removeBinding(importSpecifier);
    };
  }

  return null;
};

const processRefMacros = (
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  importRefLazily: ReturnType<typeof createImportLazily>
) => {
  if (!path.scope.references[refMacro]) return;

  const binding = path.scope.getBinding(refMacro);
  if (!binding) return;

  const paths = binding?.referencePaths;
  if (!paths) return;
  const remove = createRemoveImport(path.scope, binding, refMacro);
  if (!remove) {
    return;
  }

  for (const path of paths) {
    const parent = path.parentPath;
    if (!parent || parent.node.type !== "CallExpression") {
      throw SyntaxErrorWithLoc.makeFromPosition(
        "$$ expected to be used only inside of CallExpressions",
        (parent ?? path).node.loc?.start
      );
    }
    if (parent.node.arguments.length !== 1) {
      throw SyntaxErrorWithLoc.makeFromPosition(
        "$$ expected to be called with exactly one argument",
        parent.node.loc?.start
      );
    }
    const arg = parent.node.arguments[0];
    if (!arg) {
      throw Error("invariant: Arg cannot be null");
    }
    if (!t.isExpression(arg)) {
      throw SyntaxErrorWithLoc.makeFromPosition(
        "$$ expected to be called with an expression",
        arg.loc?.start
      );
    }

    parent.node.callee = importRefLazily();
    parent.node.arguments = [t.arrowFunctionExpression([], arg)];

    binding.dereference();
  }
  if (binding.references !== 0) {
    throw new Error("invariant: Expected no references");
  }
  remove();
  path.scope.removeBinding(refMacro);
};

const createStoreProperty = (
  storeIdent: BabelTypes.Identifier,
  t: typeof BabelTypes,
  init: BabelTypes.Expression,
  type: "state" | "linkedState",
  counter: number
) => {
  if (type === "linkedState") {
    return t.callExpression(
      t.memberExpression(t.cloneNode(storeIdent), t.identifier("lReactive")),
      [t.cloneNode(init), t.numericLiteral(counter)]
    );
  }
  const getExpression = t.callExpression(
    t.memberExpression(t.cloneNode(storeIdent), t.identifier("get")),
    [t.numericLiteral(counter)]
  );

  const createFallback = t.callExpression(
    t.memberExpression(t.cloneNode(storeIdent), t.identifier("reactive")),
    [t.cloneNode(init), t.numericLiteral(counter)]
  );

  return t.logicalExpression("??", getExpression, createFallback);
};

const processStateMacros = (
  path: NodePath<BabelTypes.Program>,
  t: typeof BabelTypes,
  state: PluginPass,
  importLazily: ReturnType<typeof createImportLazily>
) => {
  const stateMacros = ["$state", "$linkedState"] as const;

  const functionToIdentifier = new Map<
    BabelTypes.Function,
    BabelTypes.Identifier
  >();
  const storeIdentCounter = new Map<BabelTypes.Identifier, number>();

  const getNextCounter = (ident: BabelTypes.Identifier) => {
    const counter = storeIdentCounter.get(ident) ?? 0;
    storeIdentCounter.set(ident, counter + 1);
    return counter;
  };

  for (const macro of stateMacros) {
    if (!path.scope.references[macro]) {
      continue;
    }
    const binding = path.scope.getBinding(macro);
    if (!binding) {
      continue;
    }
    const remove = createRemoveImport(path.scope, binding, macro);
    if (!remove) {
      continue;
    }

    if (!binding.referencePaths || binding.referencePaths.length === 0) {
      remove();
      continue;
    }

    for (const path of binding.referencePaths) {
      const callParent = path.parentPath;
      if (!callParent || !callParent.isCallExpression()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          "Expected $state to be used only as call expressions",
          (callParent ?? path).node.loc?.start
        );
      }
      const parent = callParent.parentPath;
      if (!parent || !parent.isVariableDeclarator()) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected ${macro} to be used only in variable declarations`,
          path.node.loc?.start
        );
      }
      if (!parent.parentPath.isVariableDeclaration()) {
        throw new Error(
          "invariant: parentPath should be a VariableDeclaration"
        );
      }
      if (
        parent.parentPath.node.kind !== "const" &&
        macro === "$state" &&
        parent.parentPath.node.kind !== "let"
      ) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          macro === "$state"
            ? `${macro} should be used with const`
            : `${macro} should be used with let`,
          path.node.loc?.start
        );
      }
      const res = getStateMacrosBody(parent.node);
      if (!res) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          "Expected $state to have a valid body",
          path.node.loc?.start
        );
      }
      const [id, body] = res;
      const functionParent = parent.getFunctionParent();
      if (!functionParent) {
        throw SyntaxErrorWithLoc.makeFromPosition(
          `Expected "${macro}" to be used inside of a function`,
          parent.node.loc?.start
        );
      }

      const storeIdent = (() => {
        {
          const _ = functionToIdentifier.get(functionParent.node);
          if (_) {
            return {
              original: _,
              clone: t.cloneNode(_),
            };
          }
        }

        const functionBody =
          functionParent.node.body.type === "BlockStatement"
            ? functionParent.node.body
            : t.blockStatement([t.returnStatement(functionParent.node.body)]);

        t.callExpression(importLazily(), []);
        const ident = path.scope.generateUidIdentifier("store");
        const decl = t.variableDeclaration("const", [
          t.variableDeclarator(ident, t.callExpression(importLazily(), [])),
        ]);

        functionBody.body.unshift(decl);
        functionParent.node.body = functionBody;
        const body = functionParent.get("body");
        assert(body.isBlockStatement());

        for (const it of body.get("body")) {
          if (it.node === decl) {
            body.scope.registerDeclaration(it);
            break;
          }
        }

        functionToIdentifier.set(functionParent.node, ident);
        return { original: ident, clone: t.cloneNode(ident) };
      })();

      const [referencePath] = callParent.replaceWith(
        createStoreProperty(
          storeIdent.clone,
          t,
          body,
          macro === "$linkedState" ? "linkedState" : "state",
          getNextCounter(storeIdent.original)
        )
      );
      path.scope.getBinding(storeIdent.original.name)?.reference(referencePath);
      self.addToSet(
        state,
        macro === "$state" ? "$stateIdentifier" : "$linkedStateIdentifier",
        id
      );

      const varBinding = path.scope.getBinding(id.name);
      if (!varBinding) {
        throw new Error("invariant: Expected a binding");
      }

      for (const refPath of varBinding.referencePaths) {
        refPath.replaceWith(
          t.memberExpression(t.cloneNode(id), t.identifier("value"))
        );
      }

      binding.dereference();
    }
    if (binding.references !== 0) {
      throw new Error("invariant: Expected no references");
    }
    remove();
  }
};

export default function preactSignalsUtilsBabel(
  { types: t }: PluginArgs,
  options?: BabelMacroPluginOptions
): PluginObj {
  const enableStateMacros = options?.enableStateMacros;

  return {
    name: PLUGIN_NAME,
    visitor: {
      Program: {
        enter(path, state) {
          processRefMacros(
            path,
            t,
            createImportLazily(t, state, path, "$", "@preact-signals/utils")
          );

          if (enableStateMacros) {
            processStateMacros(
              path,
              t,
              state,
              createImportLazily(
                t,
                state,
                path,
                "useStore",
                "@preact-signals/utils/macro-helper"
              )
            );
          }
        },
      },
      AssignmentExpression(path, state) {
        if (!enableStateMacros) {
          return;
        }
        // replacing state macro assignments
        if (path.node.left.type !== "Identifier") {
          return;
        }
        const ident = path.scope.getBindingIdentifier(path.node.left.name);
        if (!ident) {
          return;
        }
        if (self.hasInSet(state, "$stateIdentifier", ident)) {
          path.replaceWith(
            t.assignmentExpression(
              path.node.operator,
              t.memberExpression(
                t.cloneNode(path.node.left),
                t.identifier("value")
              ),
              path.node.right
            )
          );
          return;
        }
        if (self.hasInSet(state, "$linkedStateIdentifier", ident)) {
          throw SyntaxErrorWithLoc.makeFromPosition(
            "Cannot assign to a binded state",
            path.node.loc?.start
          );
        }
      },
    },
  };
}
