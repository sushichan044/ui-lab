import type { TabKind } from "../_shared/api";
import { loadTab } from "../_shared/api";
import type { Route } from "./+types/tab";

// Client route used only by the client-loader strategy's on-demand tab load via
// fetcher.load(). clientLoader returns the un-awaited Promise so fetcher.data.rows
// is a Promise for use() under <Suspense>.
export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { rows: loadTab(params.kind as TabKind) };
}

// No UI: reached only through fetcher.load(). Kept as a valid route module.
export default function TabData() {
  return null;
}
