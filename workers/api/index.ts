import { Hono } from "hono";

const app = new Hono();

export const apiRoutes = app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export type APIRoutes = typeof apiRoutes;
