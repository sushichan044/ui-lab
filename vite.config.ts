import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
    Icons(),
    tsconfigPaths(),
  ],
}));
