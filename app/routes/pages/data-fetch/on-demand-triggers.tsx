import type { FC } from "react";
import { Suspense, use, useCallback, useState, useTransition } from "react";
import { useFetcher } from "react-router";

import type { loader as deferredLoader } from "../../resources/itemDeferred";
import type { loader as listLoader } from "../../resources/listDeferred";
import type { FetchOptions, ItemDetail } from "./_shared/fakeApi";
import { fetchActivity, fetchFeed, fetchItemDetail, fetchRecommendations } from "./_shared/fakeApi";
import { useManualFetch } from "./_shared/useManualFetch";

const itemHref = (id: string) => `/data-fetch/resource/item-deferred?id=${id}`;

export function meta() {
  return [{ title: "On-Demand Triggers | UI Lab" }];
}

const DELAY_MS = 1200;

// --- Shared bits ---

interface Row {
  id: string;
  primary: string;
  secondary: string;
}

const SkeletonStack: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-12 w-full" />
    <div className="skeleton h-12 w-full" />
  </div>
);

const RowList: FC<{ rows: Row[] }> = ({ rows }) => (
  <ul className="space-y-2">
    {rows.map((row) => (
      <li className="card bg-base-200 p-3" key={row.id}>
        <p className="font-semibold text-sm">{row.primary}</p>
        <p className="text-xs opacity-70">{row.secondary}</p>
      </li>
    ))}
  </ul>
);

const DetailMini: FC<{ detail: ItemDetail }> = ({ detail }) => (
  <div className="space-y-1">
    <p className="font-semibold text-sm">{detail.name}</p>
    <p className="text-xs opacity-70">{detail.description}</p>
  </div>
);

// ============================================================
// Demo 1: Tabs — switching a tab fetches that tab's data
// ============================================================

type TabId = "feed" | "recs" | "activity";
const TABS: { id: TabId; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "recs", label: "Recommendations" },
  { id: "activity", label: "Activity" },
];

const tabFetchers: Record<TabId, (opts: FetchOptions) => Promise<Row[]>> = {
  feed: async (o) =>
    (await fetchFeed(o)).map((i) => ({ id: i.id, primary: i.title, secondary: i.body })),
  recs: async (o) =>
    (await fetchRecommendations(o)).map((i) => ({
      id: i.id,
      primary: i.title,
      secondary: i.reason,
    })),
  activity: async (o) =>
    (await fetchActivity(o)).map((i) => ({
      id: i.id,
      primary: i.action,
      secondary: i.timestamp,
    })),
};

const TabBar: FC<{ active: TabId | null; onSelect: (id: TabId) => void; pending?: boolean }> = ({
  active,
  onSelect,
  pending,
}) => (
  <div className="tabs tabs-boxed">
    {TABS.map((tab) => (
      <button
        className={`tab ${tab.id === active ? "tab-active" : ""}`}
        key={tab.id}
        onClick={() => onSelect(tab.id)}
        type="button"
      >
        {tab.label}
        {pending && tab.id === active && (
          <span className="loading loading-spinner loading-xs ml-2" />
        )}
      </button>
    ))}
  </div>
);

const TabsBefore: FC = () => {
  const [active, setActive] = useState<TabId | null>(null);
  const fetcher = useCallback(
    (id: string) => tabFetchers[id as TabId]({ delayMs: DELAY_MS, shouldFail: false }),
    [],
  );
  // Keyed by the active tab — every switch re-runs the fetch and flashes the skeleton.
  const { data, loading } = useManualFetch(active, fetcher);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-warning">Before — refetch on every switch</p>
      <TabBar active={active} onSelect={setActive} />
      {active === null ? (
        <p className="text-xs opacity-50">Select a tab to load it.</p>
      ) : loading || !data ? (
        <SkeletonStack />
      ) : (
        <RowList rows={data} />
      )}
    </div>
  );
};

const TabContent: FC<{ promise: Promise<Row[]> }> = ({ promise }) => (
  <RowList rows={use(promise)} />
);

const TabsAfter: FC = () => {
  const [active, setActive] = useState<TabId | null>(null);
  const [isPending, startTransition] = useTransition();
  // The Promise lives in fetcher.data — React Router owns it, not component state.
  const fetcher = useFetcher<typeof listLoader>();

  // startTransition keeps the current tab visible while the next one's fetch is in
  // flight — no skeleton flash on switch.
  const select = (id: TabId) => {
    startTransition(() => {
      setActive(id);
      void fetcher.load(`/data-fetch/resource/list-deferred?kind=${id}`);
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-success">After — useFetcher + startTransition</p>
      <TabBar active={active} onSelect={select} pending={isPending} />
      {active === null ? (
        <p className="text-xs opacity-50">Select a tab to load it.</p>
      ) : (
        <div className={isPending ? "opacity-60 transition-opacity" : ""}>
          <Suspense fallback={<SkeletonStack />}>
            {fetcher.data ? <TabContent promise={fetcher.data.rows} /> : <SkeletonStack />}
          </Suspense>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Demo 2: Accordion — expanding a row fetches its detail
// ============================================================

const ACCORDION_IDS = ["101", "102", "103"];

const AccordionBeforeBody: FC<{ id: string }> = ({ id }) => {
  const fetcher = useCallback(
    (itemId: string) => fetchItemDetail(itemId, { delayMs: DELAY_MS, shouldFail: false }),
    [],
  );
  const { data, loading } = useManualFetch(id, fetcher);
  if (loading || !data) return <div className="skeleton h-10 w-full" />;
  return <DetailMini detail={data} />;
};

const AccordionRowBefore: FC<{ id: string }> = ({ id }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card bg-base-200">
      <button
        className="flex justify-between p-3 text-sm font-semibold"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span>Row {id}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {/* Mount the body only while expanded → collapsed rows never fetch. */}
      {open && (
        <div className="border-t border-base-300 p-3">
          <AccordionBeforeBody id={id} />
        </div>
      )}
    </div>
  );
};

const AccordionDetail: FC<{ promise: Promise<ItemDetail> }> = ({ promise }) => (
  <DetailMini detail={use(promise)} />
);

const AccordionRowAfter: FC<{ id: string }> = ({ id }) => {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof deferredLoader>();

  const toggle = () => {
    // Load once on first expand; fetcher.data persists, so re-expanding is instant.
    if (fetcher.state === "idle" && !fetcher.data) {
      void fetcher.load(itemHref(id));
    }
    setOpen((o) => !o);
  };

  return (
    <div className="card bg-base-200">
      <button
        className="flex justify-between p-3 text-sm font-semibold"
        onClick={toggle}
        type="button"
      >
        <span>Row {id}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-base-300 p-3">
          {fetcher.data ? (
            <Suspense fallback={<div className="skeleton h-10 w-full" />}>
              <AccordionDetail promise={fetcher.data.detail} />
            </Suspense>
          ) : (
            <div className="skeleton h-10 w-full" />
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Demo 3: Hover/focus — pointing at a row fetches a preview
// ============================================================

const HOVER_IDS = ["201", "202", "203"];

const HoverRowBefore: FC<{ id: string }> = ({ id }) => {
  const [hovered, setHovered] = useState(false);
  const fetcher = useCallback(
    (itemId: string) => fetchItemDetail(itemId, { delayMs: DELAY_MS, shouldFail: false }),
    [],
  );
  // Keyed by hover state — leaving and re-entering refetches every time.
  const { data, loading } = useManualFetch(hovered ? id : null, fetcher);

  return (
    <div
      className="relative"
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="btn btn-sm btn-block justify-start" type="button">
        Hover row {id}
      </button>
      {hovered && (
        <div className="absolute z-10 mt-1 w-full card bg-base-300 p-3 shadow">
          {loading || !data ? (
            <div className="skeleton h-8 w-full" />
          ) : (
            <DetailMini detail={data} />
          )}
        </div>
      )}
    </div>
  );
};

const HoverRowAfter: FC<{ id: string }> = ({ id }) => {
  const [hovered, setHovered] = useState(false);
  const fetcher = useFetcher<typeof deferredLoader>();

  const enter = () => {
    // Load once; fetcher.data is cached, so re-hovering shows the preview instantly.
    if (fetcher.state === "idle" && !fetcher.data) {
      void fetcher.load(itemHref(id));
    }
    setHovered(true);
  };

  return (
    <div
      className="relative"
      onBlur={() => setHovered(false)}
      onFocus={enter}
      onMouseEnter={enter}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="btn btn-sm btn-block justify-start" type="button">
        Hover row {id}
      </button>
      {hovered && (
        <div className="absolute z-10 mt-1 w-full card bg-base-300 p-3 shadow">
          {fetcher.data ? (
            <Suspense fallback={<div className="skeleton h-8 w-full" />}>
              <AccordionDetail promise={fetcher.data.detail} />
            </Suspense>
          ) : (
            <div className="skeleton h-8 w-full" />
          )}
        </div>
      )}
    </div>
  );
};

// --- Page ---

export default function OnDemandTriggersPage() {
  return (
    <main className="container mx-auto p-4 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">On-Demand Triggers</h1>
        <p className="mt-2 text-sm opacity-70 max-w-2xl">
          Non-modal triggers for on-demand fetching. Left is <code>useEffect + useState</code>;
          right calls <code>fetcher.load()</code> at interaction time and consumes the deferred{" "}
          <code>fetcher.data</code> Promise with <code>use()</code> under{" "}
          <code>{"<Suspense>"}</code> — no Promise is held in component state.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">1. Tabs</h2>
        <p className="text-sm opacity-70">
          Switching to a tab loads its data via <code>fetcher.load()</code>. After wraps the load in{" "}
          <code>startTransition</code> so the current tab stays visible while the next one loads.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <TabsBefore />
          <TabsAfter />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. Accordion</h2>
        <p className="text-sm opacity-70">
          Expanding a row loads its detail; collapsed rows never fetch.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-warning">Before</p>
            {ACCORDION_IDS.map((id) => (
              <AccordionRowBefore id={id} key={id} />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-success">After</p>
            {ACCORDION_IDS.map((id) => (
              <AccordionRowAfter id={id} key={id} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">3. Hover / focus preview</h2>
        <p className="text-sm opacity-70">
          Pointing at (or focusing) a row loads a preview. After reuses <code>fetcher.data</code> so
          re-hovering shows it instantly.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-warning">Before</p>
            {HOVER_IDS.map((id) => (
              <HoverRowBefore id={id} key={id} />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-success">After</p>
            {HOVER_IDS.map((id) => (
              <HoverRowAfter id={id} key={id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
