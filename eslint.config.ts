import react from "@virtual-live-lab/eslint-config/presets/react";
import ts from "@virtual-live-lab/eslint-config/presets/ts";
import { composer } from "eslint-flat-config-utils";
import * as reactCompiler from "eslint-plugin-react-compiler";
import tseslint from "typescript-eslint";

export default composer(
  // @ts-expect-error 型が合わない
  tseslint.config(
    {
      ignores: ["build", "worker-configuration.d.ts"],
    },
    tseslint.config({
      extends: [...ts, ...react],
      name: "@repo/eslint-config",
    }),
    {
      plugins: {
        "react-compiler": reactCompiler,
      },
      rules: {
        "react-compiler/react-compiler": "error",
      },
    },
  ),
).override(28, {
  rules: {
    "react-refresh/only-export-components": [
      "error",
      {
        allowConstantExport: true,
        allowExportNames: ["meta", "links", "headers", "loader", "action"],
      },
    ],
  },
});
