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
    ]),
  ]),
] satisfies RouteConfig;

export default routes;
