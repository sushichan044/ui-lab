import type { Config } from "@react-router/dev/config";
import { ensureTrailingSlash } from "vite-plugin-dev-server-gateway";

export default {
  basename: ensureTrailingSlash(process.env["PREVIEW_GATEWAY_BASE"]),
  future: {
    v8_viteEnvironmentApi: true,
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
  },
  ssr: true,
} satisfies Config;
