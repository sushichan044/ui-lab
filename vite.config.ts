import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";

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
    cloudflareDevProxy({
      // @ts-expect-error よくわかんない
      getLoadContext({ context }) {
        return { cloudflare: context.cloudflare };
      },
    }),
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
    tsconfigPaths(),
  ],
}));
