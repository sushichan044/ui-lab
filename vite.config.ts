import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { DevTools } from "@vitejs/devtools";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig, lazyPlugins } from "vite-plus";
export default defineConfig({
  fmt: {
    ignorePatterns: ["pnpm-lock.yaml", "CHANGELOG.md"],
    jsdoc: true,
    sortImports: true,
  },
  lint: {
    jsPlugins: ["vite-plus/oxlint-plugin"],
    categories: {
      correctness: "error",
      nursery: "error",
      perf: "error",
    },
    env: {
      browser: true,
      node: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
  plugins: [
    ...(lazyPlugins(() => [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tailwindcss(),
      reactRouter(),
      babel({
        presets: [reactCompilerPreset()],
      }),
      Icons({ compiler: "jsx", jsx: "react" }),
      devtoolsJson(),
      DevTools(),
    ]) ?? []),
  ],
  build: {
    rolldownOptions: {
      devtools: {},
    },
  },
  test: {
    benchmark: {
      include: ["**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
    passWithNoTests: true,
    typecheck: {
      enabled: true,
    },
  },
  run: {
    tasks: {
      build: {
        command: "vp build",
      },
      dev: {
        command: "vp dev",
        dependsOn: ["typegen"],
      },
      check: {
        command: "vp check",
        dependsOn: ["typegen"],
      },
      typegen: {
        command: ["vp fmt"],
        dependsOn: ["typegen:react-router", "typegen:cloudflare"],
      },
      "typegen:react-router": {
        command: "react-router typegen",
        output: [".react-router/**"],
      },
      "typegen:cloudflare": {
        command: "wrangler types --env-interface CloudflareBindings",
        output: ["./worker-configuration.d.ts"],
      },
    },
  },
});
