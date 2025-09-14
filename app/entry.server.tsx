import type { EntryContext } from "react-router";
import type { RouterContextProvider } from "react-router";

import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { createContext, ServerRouter } from "react-router";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // _loadContext: AppLoadContext
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          console.error(error);
        }
      },
    },
  );
  shellRendered = true;

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  if (isbot(userAgent) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

// `createContext()` should be executed in React Router's runtime.
// So, placing it here instead of workers/app.ts
export const cloudflareRRCtx = createContext<CloudflareBindings>();
export const setCloudflareRRCtx = (
  ctx: RouterContextProvider,
  env: CloudflareBindings,
) => {
  ctx.set(cloudflareRRCtx, env);
};
