import {
  fetchActivity,
  fetchFeed,
  fetchRecommendations,
} from "../pages/data-fetch/_shared/fakeApi";
import type { Route } from "./+types/listDeferred";

interface Row {
  id: string;
  primary: string;
  secondary: string;
}

const opts = { delayMs: 1200, shouldFail: false } as const;

// Deferred list loader for the tab demo. Each kind maps its source data into a common
// Row shape. Loaded on demand via fetcher.load() when the user selects a tab.
const feedRows = async (): Promise<Row[]> =>
  (await fetchFeed(opts)).map((i) => ({ id: i.id, primary: i.title, secondary: i.body }));

const byKind: Record<string, () => Promise<Row[]>> = {
  feed: feedRows,
  recs: async () =>
    (await fetchRecommendations(opts)).map((i) => ({
      id: i.id,
      primary: i.title,
      secondary: i.reason,
    })),
  activity: async () =>
    (await fetchActivity(opts)).map((i) => ({
      id: i.id,
      primary: i.action,
      secondary: i.timestamp,
    })),
};

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") ?? "feed";
  const make = byKind[kind] ?? feedRows;
  // Return the Promise without awaiting → fetcher.data.rows is a Promise for use().
  return { rows: make() };
}
