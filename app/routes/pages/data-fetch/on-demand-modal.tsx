import type { FC } from "react";
import { Suspense, use, useCallback, useState } from "react";
import { useFetcher } from "react-router";

import type { loader as deferredLoader } from "../../resources/itemDeferred";
import { ErrorBoundary } from "./_shared/ErrorBoundary";
import type { ItemDetail } from "./_shared/fakeApi";
import { fetchItemDetail } from "./_shared/fakeApi";
import { Modal } from "./_shared/Modal";
import { useManualFetch } from "./_shared/useManualFetch";

const deferredHref = (fail: boolean) =>
  `/data-fetch/resource/item-deferred?id=${ITEM_ID}&fail=${fail ? "1" : "0"}`;

export function meta() {
  return [{ title: "On-Demand Modals | UI Lab" }];
}

const DELAY_MS = 1500;
const ITEM_ID = "42";

// --- Shared presentational pieces ---

const DetailView: FC<{ detail: ItemDetail }> = ({ detail }) => (
  <div className="space-y-2">
    <p className="font-semibold">{detail.name}</p>
    <p className="text-sm opacity-70">{detail.description}</p>
    <div className="flex gap-4 text-xs opacity-50">
      <span>owner: {detail.owner}</span>
      <span>updated: {detail.updatedAt}</span>
    </div>
  </div>
);

const FullSkeleton: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-5 w-1/3" />
    <div className="skeleton h-4 w-full" />
    <div className="skeleton h-4 w-2/3" />
  </div>
);

const InlineSkeleton: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-4 w-full" />
    <div className="skeleton h-4 w-2/3" />
  </div>
);

const ErrorView: FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="space-y-2">
    <p className="text-error text-sm font-semibold">Failed to load</p>
    <p className="text-xs opacity-70">{message}</p>
    <button className="btn btn-sm btn-outline btn-error" onClick={onRetry} type="button">
      Retry
    </button>
  </div>
);

const OpenButton: FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button className="btn btn-sm" onClick={onClick} type="button">
    {label}
  </button>
);

// `use(promise)` only resolves once the fetch settles, so wrapping this in <Suspense>
// is what gates the surrounding content on the fetch.
const SuspendingDetail: FC<{ promise: Promise<ItemDetail> }> = ({ promise }) => (
  <DetailView detail={use(promise)} />
);

// --- Demo 1: whole-content gated ---

// Hoisted (not defined inside render) so it is not remounted — and re-fetched — on
// every parent render. Mounted only while the modal is open, so the fetch is on-demand.
const GatedBeforeBody: FC<{ fail: boolean; onClose: () => void }> = ({ fail, onClose }) => {
  const fetcher = useCallback(
    (id: string) => fetchItemDetail(id, { delayMs: DELAY_MS, shouldFail: fail }),
    [fail],
  );
  const { data, loading, error } = useManualFetch(ITEM_ID, fetcher);
  if (loading) return <FullSkeleton />;
  if (error) return <ErrorView message={error.message} onRetry={onClose} />;
  if (!data) return null;
  return <DetailView detail={data} />;
};

const GatedBefore: FC<{ fail: boolean }> = ({ fail }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-warning">Before — useEffect + useState</p>
      <OpenButton label="Open (gated)" onClick={() => setOpen(true)} />
      <Modal onClose={() => setOpen(false)} open={open} title="Item detail (before)">
        <GatedBeforeBody fail={fail} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

const GatedAfter: FC<{ fail: boolean }> = ({ fail }) => {
  const [open, setOpen] = useState(false);
  // The Promise lives in fetcher.data (owned by React Router) — never in our own state.
  const fetcher = useFetcher<typeof deferredLoader>();

  const load = () => fetcher.load(deferredHref(fail));
  const open_ = () => {
    void load();
    setOpen(true);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-success">After — useFetcher + Suspense</p>
      <OpenButton label="Open (gated)" onClick={open_} />
      <Modal onClose={() => setOpen(false)} open={open} title="Item detail (after)">
        {/* ErrorBoundary + Suspense stay INSIDE the modal so a failed/pending fetch
            never bubbles to the root boundary and blanks the whole page. */}
        <ErrorBoundary
          fallback={({ error }) => <ErrorView message={error.message} onRetry={load} />}
          resetKeys={[fetcher.data]}
        >
          <Suspense fallback={<FullSkeleton />}>
            {fetcher.data ? <SuspendingDetail promise={fetcher.data.detail} /> : <FullSkeleton />}
          </Suspense>
        </ErrorBoundary>
      </Modal>
    </div>
  );
};

// --- Demo 2: partial Suspense (shell instant, data region streams) ---

const StaticSummary: FC = () => (
  <div className="card bg-base-200 p-3">
    <p className="text-sm font-semibold">Item #{ITEM_ID}</p>
    <p className="text-xs opacity-70">Summary already known by the caller — shown instantly.</p>
  </div>
);

const PartialBeforeBody: FC<{ fail: boolean; onClose: () => void }> = ({ fail, onClose }) => {
  const fetcher = useCallback(
    (id: string) => fetchItemDetail(id, { delayMs: DELAY_MS, shouldFail: fail }),
    [fail],
  );
  const { data, loading, error } = useManualFetch(ITEM_ID, fetcher);
  return (
    <div className="space-y-3">
      <StaticSummary />
      <div className="border-t border-base-300 pt-3">
        {loading ? (
          <InlineSkeleton />
        ) : error ? (
          <ErrorView message={error.message} onRetry={onClose} />
        ) : data ? (
          <DetailView detail={data} />
        ) : null}
      </div>
    </div>
  );
};

const PartialBefore: FC<{ fail: boolean }> = ({ fail }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-warning">Before — useEffect + useState</p>
      <OpenButton label="Open (partial)" onClick={() => setOpen(true)} />
      <Modal onClose={() => setOpen(false)} open={open} title="Item detail (before)">
        <PartialBeforeBody fail={fail} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

const PartialAfter: FC<{ fail: boolean }> = ({ fail }) => {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof deferredLoader>();

  const load = () => fetcher.load(deferredHref(fail));
  const open_ = () => {
    void load();
    setOpen(true);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-success">After — useFetcher + Suspense</p>
      <OpenButton label="Open (partial)" onClick={open_} />
      <Modal onClose={() => setOpen(false)} open={open} title="Item detail (after)">
        <div className="space-y-3">
          {/* Shell renders immediately; only the data region is wrapped in Suspense. */}
          <StaticSummary />
          <div className="border-t border-base-300 pt-3">
            <ErrorBoundary
              fallback={({ error }) => <ErrorView message={error.message} onRetry={load} />}
              resetKeys={[fetcher.data]}
            >
              <Suspense fallback={<InlineSkeleton />}>
                {fetcher.data ? (
                  <SuspendingDetail promise={fetcher.data.detail} />
                ) : (
                  <InlineSkeleton />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- Page ---

export default function OnDemandModalPage() {
  const [fail, setFail] = useState(false);

  return (
    <main className="container mx-auto p-4 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">On-Demand Modals</h1>
        <p className="mt-2 text-sm opacity-70 max-w-2xl">
          The fetch starts when the user opens the modal — not on page load. Left column is the
          imperative <code>useEffect + useState</code> approach; right column calls{" "}
          <code>fetcher.load()</code> on open and consumes the deferred{" "}
          <code>fetcher.data.detail</code> Promise with <code>use()</code> under a{" "}
          <code>{"<Suspense>"}</code> boundary — no Promise is held in component state.
        </p>
        <label className="mt-4 flex items-center gap-2 cursor-pointer w-fit">
          <input
            checked={fail}
            className="toggle toggle-error toggle-sm"
            onChange={(e) => setFail(e.target.checked)}
            type="checkbox"
          />
          <span className="text-sm">Force fail (see in-modal error containment)</span>
        </label>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">1. Whole-content gated</h2>
        <p className="text-sm opacity-70">
          The modal body shows nothing but a skeleton until the fetch completes — the content
          requires the data to exist.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <GatedBefore fail={fail} />
          <GatedAfter fail={fail} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. Partial Suspense</h2>
        <p className="text-sm opacity-70">
          The modal frame and the already-known summary render instantly; only the detail region
          shows a loading state while its fetch is in flight.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <PartialBefore fail={fail} />
          <PartialAfter fail={fail} />
        </div>
      </section>
    </main>
  );
}
