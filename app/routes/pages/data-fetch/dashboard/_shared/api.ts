import type { ItemDetail, UserProfile } from "../../_shared/fakeApi";
import {
  fetchActivity,
  fetchFeed,
  fetchItemDetail,
  fetchRecommendations,
  fetchUserProfile,
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

// In-memory mutation target. submitNote bumps it; loadOverview reflects it, so a
// mutation (widget 4) is visibly observed after revalidation/refetch.
let noteCount = 0;

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
    noteCount,
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

export async function submitNote(text: string): Promise<{ noteCount: number }> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  if (text.trim().length > 0) noteCount += 1;
  return { noteCount };
}
