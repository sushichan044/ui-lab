import { loadItem } from "../_shared/api";
import type { Route } from "./+types/item";

// Client route for the client-loader strategy's on-demand detail load. The Promise
// is returned un-awaited; a rejected one (fail=1) streams too, and use() re-throws
// it to the modal's ErrorBoundary.
export function clientLoader({ params, request }: Route.ClientLoaderArgs) {
  const fail = new URL(request.url).searchParams.get("fail") === "1";
  return { detail: loadItem(params.id, fail) };
}

export default function ItemData() {
  return null;
}
