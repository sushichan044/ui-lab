import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore virtual module provided by React Router at build time
import * as build from "virtual:react-router/server-build";

import { setCloudflareRRCtx } from "../app/entry.server";

type HonoConfig = {
  Bindings: CloudflareBindings;
};

const app = new Hono<HonoConfig>();

const reactRouterHandler = createRequestHandler(build, import.meta.env.MODE);

app.all("*", async (c) => {
  const rrCtx = new RouterContextProvider();

  setCloudflareRRCtx(rrCtx, c.env);

  return reactRouterHandler(c.req.raw, rrCtx);
});

export default app;
