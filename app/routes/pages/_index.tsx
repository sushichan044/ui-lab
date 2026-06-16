import { Link } from "react-router";

import { cloudflareContext } from "../../context.server";
import type { Route } from "./+types/_index";
export function meta() {
  return [
    { title: "sushichan044's UI Lab" },
    {
      content:
        "sushichan044's UI Lab is a place to experiment with new web technologies or ui implementations.",
      name: "description",
    },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  const cf = cloudflareContext.get(context);

  return {
    cloudflareValue: cf.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home() {
  return (
    <main className="mx-auto container p-4">
      <div className="grid gap-4">
        <section>
          <h2 className="text-xl font-bold">Input</h2>
          <Link className="link" to="/input/multi-checkbox">
            <p>Multi checkbox</p>
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-bold">Async Task</h2>
          <Link className="link" to="/interaction/async-task">
            <p>Async Task</p>
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-bold">Overlay</h2>
          <Link className="link" to="/niconico">
            <p>Niconico Comment Overlay</p>
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-bold">Client Loader</h2>
          <Link className="link" to="/client-loader">
            <p>Client Loader Example</p>
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-bold">Data Fetching (Suspense)</h2>
          <Link className="link" to="/data-fetch/islands">
            <p>
              Islands Playground — multiple islands, island-level ErrorBoundary, first-view priority
            </p>
          </Link>
          <Link className="link" to="/data-fetch/patterns">
            <p>Patterns — coarse vs fine boundary, waterfall vs parallel, startTransition</p>
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-bold">On-Demand Fetch (Suspense, before/after)</h2>
          <Link className="link" to="/data-fetch/on-demand-modal">
            <p>Modals — whole-content gated vs partial Suspense, in-modal error containment</p>
          </Link>
          <Link className="link" to="/data-fetch/on-demand-triggers">
            <p>Triggers — tab switch, accordion expand, hover/focus preview</p>
          </Link>
          <Link className="link" to="/data-fetch/on-demand-fetcher">
            <p>useFetcher — resource route, awaited vs deferred Promise + use()</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
