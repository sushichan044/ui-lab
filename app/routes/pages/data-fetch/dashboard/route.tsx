import type { FC } from "react";
import { useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/route";
import type { Strategy } from "./_shared/api";
import { loadOverview, parseStrategy, STRATEGY_INFO } from "./_shared/api";
import { ClientLoaderDashboard } from "./strategies/client-loader";
import { SwrDashboard } from "./strategies/swr";
import { UseEffectDashboard } from "./strategies/use-effect";

export function meta() {
  return [{ title: "Data Fetch Strategy Dashboard | UI Lab" }];
}

// clientLoader (not a server loader) is the page-load fetch for the client-loader
// strategy. It runs at navigation time, before render — which is exactly why the
// strategy lives in the URL and switching it is a navigation, not a useState toggle.
// The other two strategies fetch after mount, so this returns null for them and no
// hidden navigation-time fetch happens. The Promise is returned un-awaited so the
// component streams it via use() under <Suspense>.
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const strategy = parseStrategy(request.url);
  if (strategy !== "client-loader") return { strategy, overview: null };
  return { strategy, overview: loadOverview() };
}

const STRATEGY_ORDER: Strategy[] = ["client-loader", "swr", "use-effect"];

const StrategyToggle: FC<{ active: Strategy }> = ({ active }) => (
  <div className="join">
    {STRATEGY_ORDER.map((id) => (
      <Link
        className={`btn btn-sm join-item ${id === active ? "btn-primary" : "btn-outline"}`}
        key={id}
        // Switching strategy is a navigation: clientLoader re-runs, and the matching
        // implementation tree below is mounted fresh.
        to={{ search: `?strategy=${id}` }}
      >
        {STRATEGY_INFO[id].label}
      </Link>
    ))}
  </div>
);

// What the selected strategy does at each of the three fetch/mutation moments, so the
// single-strategy view makes clear which approach is on screen and how it behaves.
const StrategyInfoPanel: FC<{ strategy: Strategy }> = ({ strategy }) => {
  const info = STRATEGY_INFO[strategy];
  return (
    <div className="bg-base-200 rounded-box space-y-3 p-4">
      <p className="text-sm opacity-80">{info.summary}</p>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          { term: "Page load", detail: info.pageLoad },
          { term: "On demand", detail: info.onDemand },
          { term: "Mutation", detail: info.mutation },
        ].map(({ term, detail }) => (
          <div key={term}>
            <dt className="text-xs font-semibold opacity-60">{term}</dt>
            <dd className="text-xs opacity-80">{detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  const { strategy } = loaderData;
  // Shared "force fail" switch for the detail modal (widget 3) — demonstrates
  // in-place error containment under each strategy.
  const [fail, setFail] = useState(false);

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Data Fetch Strategy Dashboard</h1>
        <p className="max-w-2xl text-sm opacity-70">
          One dashboard, three fetching strategies. The switch below changes <code>?strategy=</code>{" "}
          via navigation, so the whole page re-renders under the chosen approach. Every widget is
          implemented three times and shares only its presentational UI.
        </p>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <StrategyToggle active={strategy} />
          <label className="flex w-fit cursor-pointer items-center gap-2">
            <input
              checked={fail}
              className="toggle toggle-error toggle-sm"
              onChange={(e) => setFail(e.target.checked)}
              type="checkbox"
            />
            <span className="text-sm">Force fail (detail fetch)</span>
          </label>
        </div>
        <StrategyInfoPanel strategy={strategy} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {strategy === "use-effect" && <UseEffectDashboard fail={fail} />}
        {strategy === "swr" && <SwrDashboard fail={fail} />}
        {strategy === "client-loader" && (
          <ClientLoaderDashboard fail={fail} overview={loaderData.overview} />
        )}
      </div>
    </main>
  );
}
