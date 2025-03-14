import { createRequestHandler } from "react-router";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      ctx: ExecutionContext;
      env: CloudflareEnvironment;
    };
  }
}

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  async () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { ctx, env },
    });
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
