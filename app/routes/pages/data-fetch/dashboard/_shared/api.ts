import type { ItemDetail, UserProfile } from "../../_shared/fakeApi";
import {
  addItemNote,
  fetchActivity,
  fetchFeed,
  fetchItemDetail,
  fetchRecommendations,
  fetchUserProfile,
  totalNoteCount,
} from "../../_shared/fakeApi";

// One delay for the whole dashboard so every strategy is compared on equal footing.
export const DELAY_MS = 1000;

// Fixed item shown by the detail modal (widget 3) across all strategies.
export const ITEM_ID = "42";

export type Strategy = "client-loader" | "swr" | "use-effect";

const STRATEGIES: readonly Strategy[] = ["client-loader", "swr", "use-effect"];

export function parseStrategy(url: string): Strategy {
  const value = new URL(url).searchParams.get("strategy");
  return (STRATEGIES as readonly string[]).includes(value ?? "")
    ? (value as Strategy)
    : "client-loader";
}

// Per-strategy summary rendered in the description panel under the toggle, so it is
// clear what the selected strategy does at each of the three fetch/mutation moments.
export interface StrategyInfo {
  label: string;
  summary: string;
  pageLoad: string;
  onDemand: string;
  mutation: string;
}

export const STRATEGY_INFO: Record<Strategy, StrategyInfo> = {
  "client-loader": {
    label: "clientLoader / clientAction",
    summary: "React Router drives fetching; switching strategy is a navigation.",
    pageLoad: "clientLoader runs at navigation, streamed via use() under <Suspense>.",
    onDemand: "fetcher.load() on demand; startTransition keeps the current view.",
    mutation: "fetcher.submit() → clientAction, then automatic revalidation.",
  },
  swr: {
    label: "SWR",
    summary: "useSWR caches by key and revalidates on mount and on demand.",
    pageLoad: "useSWR('overview') revalidates on mount.",
    onDemand: "useSWR with a dynamic key; cached keys show instantly.",
    mutation: "await the call, then mutate() the affected keys.",
  },
  "use-effect": {
    label: "useEffect",
    summary: "Imperative fetching with useEffect + useState; no cache.",
    pageLoad: "useEffect fetch on mount, tracked in component state.",
    onDemand: "fetch keyed by the trigger; every change re-runs and flashes a skeleton.",
    mutation: "await the call, then bump a key to refetch.",
  },
};

export type TabKind = "feed" | "recs" | "activity";

export const TABS: { id: TabKind; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "recs", label: "Recommendations" },
  { id: "activity", label: "Activity" },
];

export interface Row {
  id: string;
  primary: string;
  secondary: string;
}

export interface Kpi {
  label: string;
  value: number;
}

export interface Overview {
  profile: UserProfile;
  kpis: Kpi[];
  noteCount: number;
}

const opts = { delayMs: DELAY_MS, shouldFail: false } as const;

export async function loadOverview(): Promise<Overview> {
  const profile = await fetchUserProfile(opts);
  return {
    profile,
    kpis: [
      { label: "Active projects", value: 12 },
      { label: "Open tasks", value: 47 },
      { label: "Team members", value: 8 },
    ],
    // Total notes across items. The detail modal's mutation bumps one item's notes, so
    // revalidating the overview after that mutation visibly updates this count.
    noteCount: totalNoteCount(),
  };
}

const tabLoaders: Record<TabKind, () => Promise<Row[]>> = {
  feed: async () =>
    (await fetchFeed(opts)).map((i) => ({ id: i.id, primary: i.title, secondary: i.body })),
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

export function loadTab(kind: TabKind): Promise<Row[]> {
  return tabLoaders[kind]();
}

export function loadItem(id: string, fail: boolean): Promise<ItemDetail> {
  return fetchItemDetail(id, { delayMs: DELAY_MS, shouldFail: fail });
}

// The detail modal's mutation: add a note to a single item, then report the new total
// so callers can reflect it without a separate read.
export async function addNote(id: string, text: string): Promise<{ noteCount: number }> {
  await addItemNote(id, text, DELAY_MS);
  return { noteCount: totalNoteCount() };
}
