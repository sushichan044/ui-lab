import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout, prefix } from "@react-router/dev/routes";

const routes = [
  layout("./routes/_layouts/ui.tsx", [
    index("./routes/pages/_index.tsx"),

    route("client-loader", "./routes/pages/client-loader.tsx"),
    route("niconico", "./routes/pages/niconico.tsx"),

    ...prefix("input", [route("multi-checkbox", "./routes/pages/input/multi-checkbox.tsx")]),

    ...prefix("interaction", [route("async-task", "./routes/pages/interaction/async-task.tsx")]),

    ...prefix("data-fetch", [
      route("islands", "./routes/pages/data-fetch/islands.tsx"),
      route("patterns", "./routes/pages/data-fetch/patterns.tsx"),
      route("on-demand-modal", "./routes/pages/data-fetch/on-demand-modal.tsx"),
      route("on-demand-triggers", "./routes/pages/data-fetch/on-demand-triggers.tsx"),
      route("on-demand-fetcher", "./routes/pages/data-fetch/on-demand-fetcher.tsx"),
    ]),
  ]),

  // Resource routes (no UI / no default export) — live outside the UI layout.
  // Loaded on demand via fetcher.load() from /data-fetch/on-demand-fetcher.
  route("data-fetch/resource/item-awaited", "./routes/resources/itemAwaited.tsx"),
  route("data-fetch/resource/item-deferred", "./routes/resources/itemDeferred.tsx"),
  route("data-fetch/resource/list-deferred", "./routes/resources/listDeferred.tsx"),
] satisfies RouteConfig;

export default routes;
