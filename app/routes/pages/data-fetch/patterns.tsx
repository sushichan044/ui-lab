import type { FC } from "react";
import { Suspense, use, useState, useTransition } from "react";

import type { FeedItem, Recommendation } from "./_shared/fakeApi";
import { fetchFeed, fetchRecommendations } from "./_shared/fakeApi";

export function meta() {
  return [{ title: "Suspense Patterns | UI Lab" }];
}

// --- Shared primitives ---

const Skeleton: FC = () => <div className="skeleton h-14 w-full" />;
const SkeletonStack: FC = () => (
  <div className="space-y-2">
    <Skeleton />
    <Skeleton />
  </div>
);

const Card: FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="card bg-base-200 p-3">
    <p className="font-semibold text-sm">{title}</p>
    <p className="text-xs opacity-70">{body}</p>
  </div>
);

const FeedConsumer: FC<{ promise: Promise<FeedItem[]> }> = ({ promise }) => {
  const items = use(promise);
  return (
    <div className="space-y-2">
      {items.slice(0, 2).map((item) => (
        <Card body={item.body} key={item.id} title={item.title} />
      ))}
    </div>
  );
};

const RecsConsumer: FC<{ promise: Promise<Recommendation[]> }> = ({ promise }) => {
  const recs = use(promise);
  return (
    <div className="space-y-2">
      {recs.map((rec) => (
        <Card body={rec.reason} key={rec.id} title={rec.title} />
      ))}
    </div>
  );
};

// --- Section A: Coarse vs Fine Suspense Boundary ---

interface IslandSet {
  fast: Promise<FeedItem[]>;
  medium: Promise<Recommendation[]>;
  slow: Promise<FeedItem[]>;
}

function makeIslandSet(): IslandSet {
  return {
    fast: fetchFeed({ delayMs: 600, shouldFail: false }),
    medium: fetchRecommendations({ delayMs: 1400, shouldFail: false }),
    slow: fetchFeed({ delayMs: 2400, shouldFail: false }),
  };
}

// All 3 under 1 Suspense → waits for the slowest before showing any
const CoarseBoundary: FC<{ islands: IslandSet }> = ({ islands }) => (
  <Suspense
    fallback={
      <div className="space-y-4">
        <SkeletonStack />
        <SkeletonStack />
        <SkeletonStack />
      </div>
    }
  >
    <div className="space-y-4">
      <FeedConsumer promise={islands.fast} />
      <RecsConsumer promise={islands.medium} />
      <FeedConsumer promise={islands.slow} />
    </div>
  </Suspense>
);

// Each in its own Suspense → each appears as it resolves
const FineBoundary: FC<{ islands: IslandSet }> = ({ islands }) => (
  <div className="space-y-4">
    <Suspense fallback={<SkeletonStack />}>
      <FeedConsumer promise={islands.fast} />
    </Suspense>
    <Suspense fallback={<SkeletonStack />}>
      <RecsConsumer promise={islands.medium} />
    </Suspense>
    <Suspense fallback={<SkeletonStack />}>
      <FeedConsumer promise={islands.slow} />
    </Suspense>
  </div>
);

const SectionA: FC = () => {
  const [left, setLeft] = useState<IslandSet>(() => makeIslandSet());
  const [right, setRight] = useState<IslandSet>(() => makeIslandSet());

  const replay = () => {
    setLeft(makeIslandSet());
    setRight(makeIslandSet());
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">A. Coarse vs Fine Suspense Boundary</h2>
        <button className="btn btn-sm btn-outline" onClick={replay} type="button">
          Replay
        </button>
      </div>
      <p className="text-sm opacity-70">
        Left: one <code>{"<Suspense>"}</code> wraps all 3 islands → all wait for the slowest (2.4s).
        Right: each island has its own <code>{"<Suspense>"}</code> → they appear as they finish
        (0.6s, 1.4s, 2.4s).
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-warning">Coarse — 1 boundary</p>
          <CoarseBoundary islands={left} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-success">Fine — per-island</p>
          <FineBoundary islands={right} />
        </div>
      </div>
    </section>
  );
};

// --- Section B: Waterfall vs Parallel Fetch ---

interface FetchPair {
  a: Promise<FeedItem[]>;
  b: Promise<Recommendation[]>;
}

function makeParallelPair(): FetchPair {
  return {
    a: fetchFeed({ delayMs: 1200, shouldFail: false }),
    b: fetchRecommendations({ delayMs: 1000, shouldFail: false }),
  };
}

function makeWaterfallPair(): FetchPair {
  const a = fetchFeed({ delayMs: 1200, shouldFail: false });
  // b starts only after a resolves — total latency adds up
  const b = a.then(() => fetchRecommendations({ delayMs: 1000, shouldFail: false }));
  return { a, b };
}

// Both a and b are consumed in the same component under 1 Suspense.
// Suspense sees the first pending use() and waits. When a resolves, React re-renders;
// if b is still pending it waits again. Total: sum(serial) or max(parallel).
const PairConsumer: FC<{ pair: FetchPair }> = ({ pair }) => {
  const aItems = use(pair.a);
  const bItems = use(pair.b);
  return (
    <div className="space-y-2">
      {aItems.slice(0, 1).map((item) => (
        <Card body={item.body} key={item.id} title={`A: ${item.title}`} />
      ))}
      {bItems.slice(0, 1).map((rec) => (
        <Card body={rec.reason} key={rec.id} title={`B: ${rec.title}`} />
      ))}
    </div>
  );
};

const SectionB: FC = () => {
  const [waterfall, setWaterfall] = useState<FetchPair>(() => makeWaterfallPair());
  const [parallel, setParallel] = useState<FetchPair>(() => makeParallelPair());

  const replay = () => {
    setWaterfall(makeWaterfallPair());
    setParallel(makeParallelPair());
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">B. Waterfall vs Parallel Fetch</h2>
        <button className="btn btn-sm btn-outline" onClick={replay} type="button">
          Replay
        </button>
      </div>
      <p className="text-sm opacity-70">
        Left: B starts only after A resolves (A: 1.2s then B: +1.0s = ~2.2s total). Right: A and B
        start simultaneously (max(1.2s, 1.0s) = ~1.2s total). The same{" "}
        <code>{"use(a) + use(b)"}</code> pattern — only the Promise creation differs.
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-warning">Waterfall (~2.2s)</p>
          <Suspense fallback={<SkeletonStack />}>
            <PairConsumer pair={waterfall} />
          </Suspense>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-success">Parallel (~1.2s)</p>
          <Suspense fallback={<SkeletonStack />}>
            <PairConsumer pair={parallel} />
          </Suspense>
        </div>
      </div>
    </section>
  );
};

// --- Section C: stale-while-loading with startTransition ---

// Without startTransition: setting a new Promise causes Suspense to fall back immediately
const WithoutTransitionDemo: FC = () => {
  const [promise, setPromise] = useState<Promise<FeedItem[]>>(() =>
    fetchFeed({ delayMs: 1500, shouldFail: false }),
  );

  const refresh = () => {
    setPromise(fetchFeed({ delayMs: 1500, shouldFail: false }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-warning">Without startTransition</p>
        <button className="btn btn-xs btn-outline" onClick={refresh} type="button">
          Refresh
        </button>
      </div>
      <p className="text-xs opacity-60">
        Old content disappears immediately — skeleton shows during fetch.
      </p>
      <Suspense fallback={<SkeletonStack />}>
        <FeedConsumer promise={promise} />
      </Suspense>
    </div>
  );
};

// With startTransition: React defers the state update — existing content stays visible,
// isPending signals that a background refresh is in progress
const WithTransitionDemo: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [promise, setPromise] = useState<Promise<FeedItem[]>>(() =>
    fetchFeed({ delayMs: 1500, shouldFail: false }),
  );

  const refresh = () => {
    startTransition(() => {
      setPromise(fetchFeed({ delayMs: 1500, shouldFail: false }));
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-success">With startTransition</p>
        <button
          className="btn btn-xs btn-outline"
          disabled={isPending}
          onClick={refresh}
          type="button"
        >
          {isPending ? "Refreshing…" : "Refresh"}
        </button>
        {isPending && <span className="loading loading-spinner loading-xs opacity-60" />}
      </div>
      <p className="text-xs opacity-60">
        Old content stays visible. <code>isPending</code> signals the background refresh.
      </p>
      <div className={isPending ? "opacity-60 transition-opacity" : ""}>
        <Suspense fallback={<SkeletonStack />}>
          <FeedConsumer promise={promise} />
        </Suspense>
      </div>
    </div>
  );
};

const SectionC: FC = () => (
  <section className="space-y-4">
    <h2 className="text-xl font-bold">C. Stale-While-Loading (startTransition)</h2>
    <p className="text-sm opacity-70">
      Without <code>startTransition</code>, replacing the Promise causes Suspense to immediately
      show the fallback. With <code>startTransition</code>, React keeps the existing content visible
      and uses <code>isPending</code> to indicate progress — no jarring flash.
    </p>
    <div className="grid grid-cols-2 gap-6">
      <WithoutTransitionDemo />
      <WithTransitionDemo />
    </div>
  </section>
);

// --- Page ---

export default function PatternsPage() {
  return (
    <main className="container mx-auto p-4 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">Suspense Patterns</h1>
        <p className="mt-2 text-sm opacity-70 max-w-2xl">
          Compare Suspense boundary granularity, fetch timing, and the effect of{" "}
          <code>startTransition</code> on perceived performance.
        </p>
      </div>
      <SectionA />
      <SectionB />
      <SectionC />
    </main>
  );
}
