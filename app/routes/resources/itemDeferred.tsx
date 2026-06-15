import { fetchItemDetail } from "../pages/data-fetch/_shared/fakeApi";
import type { Route } from "./+types/itemDeferred";

// Resource route (no default export) consumed via fetcher.load().
// The loader returns the Promise WITHOUT awaiting it, so React Router streams it and
// fetcher.data.detail is a Promise. fetcher.load() resolves immediately; the client
// passes the Promise to use() inside a <Suspense> boundary — suspense-native on-demand.
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "0";
  const shouldFail = url.searchParams.get("fail") === "1";
  // A rejected Promise also streams: use() re-throws it to the nearest ErrorBoundary.
  return { detail: fetchItemDetail(id, { delayMs: 1500, shouldFail }) };
}
