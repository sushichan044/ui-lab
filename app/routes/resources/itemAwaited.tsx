import { fetchItemDetail } from "../pages/data-fetch/_shared/fakeApi";
import type { Route } from "./+types/itemAwaited";

// Resource route (no default export) consumed via fetcher.load().
// The loader AWAITS the data, so fetcher.data.detail is the resolved value — the
// classic, non-streaming way to use a fetcher. The client keys its loading UI off
// fetcher.state.
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "0";
  const detail = await fetchItemDetail(id, { delayMs: 1500, shouldFail: false });
  return { detail };
}
