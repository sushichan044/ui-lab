import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";

const ReactCompilerConfig = {
  target: "19",
};

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions:
      isSsrBuild === true
        ? {
            input: "./workers/app.ts",
          }
        : undefined,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    Icons({ compiler: "jsx", jsx: "react" }),
    babel({
      babelConfig: {
        plugins: [
          "@babel/plugin-syntax-jsx",
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
        presets: ["@babel/preset-typescript"],
      },
      filter: /\.[jt]sx?$/,
    }),
  ],
}));
