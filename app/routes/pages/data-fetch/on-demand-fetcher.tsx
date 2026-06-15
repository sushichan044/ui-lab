import type { FC } from "react";
import { Suspense, use } from "react";
import { useFetcher } from "react-router";

import type { loader as awaitedLoader } from "../../resources/itemAwaited";
import type { loader as deferredLoader } from "../../resources/itemDeferred";
import type { ItemDetail } from "./_shared/fakeApi";

export function meta() {
  return [{ title: "On-Demand useFetcher | UI Lab" }];
}

const ITEM_ID = "42";
const AWAITED_HREF = `/data-fetch/resource/item-awaited?id=${ITEM_ID}`;
const DEFERRED_HREF = `/data-fetch/resource/item-deferred?id=${ITEM_ID}`;

const DetailCard: FC<{ detail: ItemDetail }> = ({ detail }) => (
  <div className="card bg-base-200 p-3 space-y-1">
    <p className="font-semibold text-sm">{detail.name}</p>
    <p className="text-xs opacity-70">{detail.description}</p>
    <p className="text-xs opacity-50">owner: {detail.owner}</p>
  </div>
);

const Skeleton: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-4 w-1/2" />
    <div className="skeleton h-4 w-full" />
  </div>
);

const Placeholder: FC = () => <p className="text-xs opacity-50">Press Load to fetch on demand.</p>;

// --- Before: awaited loader, UI keyed off fetcher.state ---

const AwaitedDemo: FC = () => {
  const fetcher = useFetcher<typeof awaitedLoader>();
  const loading = fetcher.state === "loading";

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-warning">Before — fetcher.state + awaited data</p>
      <button
        className="btn btn-sm"
        disabled={loading}
        onClick={() => fetcher.load(AWAITED_HREF)}
        type="button"
      >
        Load
      </button>
      {loading ? (
        <Skeleton />
      ) : fetcher.data ? (
        <DetailCard detail={fetcher.data.detail} />
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

// --- After: deferred loader, use() + Suspense ---

const DeferredDetail: FC<{ promise: Promise<ItemDetail> }> = ({ promise }) => (
  <DetailCard detail={use(promise)} />
);

const DeferredDemo: FC = () => {
  const fetcher = useFetcher<typeof deferredLoader>();

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-success">After — deferred Promise + use()</p>
      <button className="btn btn-sm" onClick={() => fetcher.load(DEFERRED_HREF)} type="button">
        Load
      </button>
      {fetcher.data ? (
        <Suspense fallback={<Skeleton />}>
          <DeferredDetail promise={fetcher.data.detail} />
        </Suspense>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

export default function OnDemandFetcherPage() {
  return (
    <main className="container mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">On-Demand with useFetcher</h1>
        <p className="mt-2 text-sm opacity-70 max-w-2xl">
          <code>fetcher.load()</code> calls a React Router resource route on a user action — the
          fetch runs on the server, not the client. Left: the loader awaits its data, so the UI
          waits on <code>fetcher.state</code>. Right: the loader returns an un-awaited Promise, so{" "}
          <code>fetcher.data.detail</code> is a Promise the client streams in via <code>use()</code>{" "}
          under <code>{"<Suspense>"}</code>.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <AwaitedDemo />
        <DeferredDemo />
      </div>
    </main>
  );
}
