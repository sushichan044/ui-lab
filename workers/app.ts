import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore virtual module provided by React Router at build time
import * as build from "virtual:react-router/server-build";

import {
  apiClientContext,
  cloudflareContext,
  executionContextContext,
} from "../app/context";
import { hc } from "hono/client";
import { apiRoutes, APIRoutes } from "./api";

type HonoConfig = {
  Bindings: CloudflareBindings;
  Variables: {
    apiClient: ReturnType<typeof hc<APIRoutes>>;
  };
};

const reactRouterHandler = createRequestHandler(build, import.meta.env.MODE);

const app = new Hono<HonoConfig>();

app.use(async (c, next) => {
  // api has base path /api
  const apiClient = hc<APIRoutes>(new URL("/api", c.req.url).toString());
  c.set("apiClient", apiClient);
  await next();
});

app.route("/api", apiRoutes);

app.all("*", async (c) => {
  const rrCtx = new RouterContextProvider();

  cloudflareContext.set(rrCtx, c.env);
  apiClientContext.set(rrCtx, c.get("apiClient"));
  executionContextContext.set(rrCtx, c.executionCtx);

  return reactRouterHandler(c.req.raw, rrCtx);
});

export default app;
