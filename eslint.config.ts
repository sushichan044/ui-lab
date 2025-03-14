import react from "@virtual-live-lab/eslint-config/presets/react";
import ts from "@virtual-live-lab/eslint-config/presets/ts";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["build"],
  },
  tseslint.config(
    {
      extends: [...ts, ...react],
      name: "@repo/eslint-config",
    },
    {
      rules: {
        "react-refresh/only-export-components": [
          "error",
          {
            allowExportNames: ["meta", "links", "headers", "loader", "action"],
            allowConstantExport: true,
          },
        ],
      },
    },
  ),
);
