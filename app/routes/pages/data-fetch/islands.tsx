import type { FC } from "react";
import { Suspense, use } from "react";
import toast from "react-hot-toast";
import { useRevalidator, useSearchParams } from "react-router";

import type { Route } from "./+types/islands";
import { ErrorBoundary } from "./_shared/ErrorBoundary";
import type { ActivityItem, FeedItem, Recommendation, UserProfile } from "./_shared/fakeApi";
import {
  fetchActivity,
  fetchFeed,
  fetchRecommendations,
  fetchUserProfile,
} from "./_shared/fakeApi";

export function meta() {
  return [{ title: "Suspense Islands | UI Lab" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const p = (key: string, def: string) => url.searchParams.get(key) ?? def;

  const mode = p("mode", "stream");
  const criticalDelay = Number(p("criticalDelay", "300"));
  const feedDelay = Number(p("feedDelay", "1500"));
  const recsDelay = Number(p("recsDelay", "2200"));
  const activityDelay = Number(p("activityDelay", "800"));
  const criticalFail = p("criticalFail", "0") === "1";
  const feedFail = p("feedFail", "0") === "1";
  const recsFail = p("recsFail", "0") === "1";
  const activityFail = p("activityFail", "0") === "1";

  // Critical path: awaited first → profile is present in the initial HTML shell.
  // This is "first-view priority" — the server doesn't respond until the user-facing content is ready.
  const profile = await fetchUserProfile({ delayMs: criticalDelay, shouldFail: criticalFail });

  if (mode === "await-all") {
    // await-all: hold the response until every fetch completes — no streaming benefit, but easy baseline
    const [feed, recommendations, activity] = await Promise.all([
      fetchFeed({ delayMs: feedDelay, shouldFail: feedFail }),
      fetchRecommendations({ delayMs: recsDelay, shouldFail: recsFail }),
      fetchActivity({ delayMs: activityDelay, shouldFail: activityFail }),
    ]);
    return {
      mode,
      profile,
      feed: Promise.resolve(feed),
      recommendations: Promise.resolve(recommendations),
      activity: Promise.resolve(activity),
    };
  }

  // stream mode: return Promises without awaiting → React Router streams each resolution separately.
  // The shell HTML already contains profile; islands appear as their Promises resolve.
  return {
    mode,
    profile,
    feed: fetchFeed({ delayMs: feedDelay, shouldFail: feedFail }),
    recommendations: fetchRecommendations({ delayMs: recsDelay, shouldFail: recsFail }),
    activity: fetchActivity({ delayMs: activityDelay, shouldFail: activityFail }),
  };
}

// --- Island leaf components ---

const FeedIsland: FC<{ promise: Promise<FeedItem[]> }> = ({ promise }) => {
  const items = use(promise);
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li className="card bg-base-200 p-3" key={item.id}>
          <p className="font-semibold text-sm">{item.title}</p>
          <p className="text-xs opacity-70">{item.body}</p>
        </li>
      ))}
    </ul>
  );
};

const RecsIsland: FC<{ promise: Promise<Recommendation[]> }> = ({ promise }) => {
  const recs = use(promise);
  return (
    <ul className="space-y-2">
      {recs.map((rec) => (
        <li className="card bg-base-200 p-3" key={rec.id}>
          <p className="font-semibold text-sm">{rec.title}</p>
          <p className="text-xs opacity-70">{rec.reason}</p>
        </li>
      ))}
    </ul>
  );
};

const ActivityIsland: FC<{ promise: Promise<ActivityItem[]> }> = ({ promise }) => {
  const items = use(promise);
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li className="flex justify-between text-sm" key={item.id}>
          <span>{item.action}</span>
          <span className="opacity-50 text-xs">{item.timestamp}</span>
        </li>
      ))}
    </ul>
  );
};

// --- Shared primitives ---

const IslandSkeleton: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-14 w-full" />
    <div className="skeleton h-14 w-full" />
  </div>
);

const IslandError: FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="card border border-error/30 p-4 space-y-2">
    <p className="text-error text-sm font-semibold">Failed to load</p>
    <p className="text-xs opacity-70">{message}</p>
    <button className="btn btn-sm btn-outline btn-error" onClick={onRetry} type="button">
      Retry
    </button>
  </div>
);

const ProfileCard: FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="card bg-base-200 p-4">
    <p className="font-bold text-lg">{profile.name}</p>
    <p className="text-sm opacity-70">{profile.bio}</p>
  </div>
);

// --- Control panel ---

const BoolToggle: FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      checked={checked}
      className="toggle toggle-error toggle-sm"
      onChange={(e) => onChange(e.target.checked)}
      type="checkbox"
    />
    <span className="text-sm">{label}</span>
  </label>
);

// --- Page ---

export default function Page({ loaderData }: Route.ComponentProps) {
  const [params, setParams] = useSearchParams();
  const revalidator = useRevalidator();

  const p = (key: string, def: string) => params.get(key) ?? def;
  const setBool = (key: string, v: boolean) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, v ? "1" : "0");
      return next;
    });
  };
  const mode = p("mode", "stream");

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Suspense Islands Playground</h1>
        <p className="mt-2 text-sm opacity-70 max-w-2xl">
          Profile (critical) is <code>await</code>ed in the server loader — it lands in the initial
          HTML shell. Feed / Recs / Activity are returned as Promises and stream in independently.
          Each island has its own <code>{"<Suspense>"}</code> + <code>{"<ErrorBoundary>"}</code>, so
          one failure does not affect the others.
        </p>
      </div>

      {/* Control panel — each toggle updates a URL param, which triggers loader revalidation */}
      <section className="card bg-base-200 p-4 space-y-4">
        <h2 className="font-semibold text-sm uppercase opacity-60 tracking-wide">Controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase opacity-50">Feed</p>
            <BoolToggle
              checked={p("feedFail", "0") === "1"}
              label="Force fail"
              onChange={(v) => setBool("feedFail", v)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase opacity-50">Recommendations</p>
            <BoolToggle
              checked={p("recsFail", "0") === "1"}
              label="Force fail"
              onChange={(v) => setBool("recsFail", v)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase opacity-50">Activity</p>
            <BoolToggle
              checked={p("activityFail", "0") === "1"}
              label="Force fail"
              onChange={(v) => setBool("activityFail", v)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase opacity-50">Mode</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                checked={mode === "await-all"}
                className="toggle toggle-info toggle-sm"
                onChange={(e) => {
                  setParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("mode", e.target.checked ? "await-all" : "stream");
                    return next;
                  });
                }}
                type="checkbox"
              />
              <span className="text-sm">await-all</span>
            </label>
            {mode === "await-all" && (
              <p className="text-xs text-info">All islands wait for the slowest (2.2s).</p>
            )}
          </div>
        </div>
      </section>

      {/* Critical island — already rendered in the initial HTML shell */}
      <section className="space-y-2">
        <h2 className="font-semibold">
          Profile{" "}
          <span className="badge badge-success badge-sm align-middle">critical — first-view</span>
        </h2>
        <ProfileCard profile={loaderData.profile} />
      </section>

      {/* Secondary islands — each independent */}
      <div className="grid md:grid-cols-3 gap-6">
        <section className="space-y-2">
          <h2 className="font-semibold">
            Feed <span className="badge badge-outline badge-sm align-middle">deferred ~1.5s</span>
          </h2>
          <ErrorBoundary
            fallback={({ error }) => (
              <IslandError message={error.message} onRetry={() => revalidator.revalidate()} />
            )}
            onError={(error) => toast.error(`Feed: ${error.message}`, { id: "feed-error" })}
            resetKeys={[revalidator.state]}
          >
            <Suspense fallback={<IslandSkeleton />}>
              <FeedIsland promise={loaderData.feed} />
            </Suspense>
          </ErrorBoundary>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">
            Recommendations{" "}
            <span className="badge badge-outline badge-sm align-middle">deferred ~2.2s</span>
          </h2>
          <ErrorBoundary
            fallback={({ error }) => (
              <IslandError message={error.message} onRetry={() => revalidator.revalidate()} />
            )}
            onError={(error) => toast.error(`Recs: ${error.message}`, { id: "recs-error" })}
            resetKeys={[revalidator.state]}
          >
            <Suspense fallback={<IslandSkeleton />}>
              <RecsIsland promise={loaderData.recommendations} />
            </Suspense>
          </ErrorBoundary>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">
            Activity{" "}
            <span className="badge badge-outline badge-sm align-middle">deferred ~0.8s</span>
          </h2>
          <ErrorBoundary
            fallback={({ error }) => (
              <IslandError message={error.message} onRetry={() => revalidator.revalidate()} />
            )}
            onError={(error) => toast.error(`Activity: ${error.message}`, { id: "activity-error" })}
            resetKeys={[revalidator.state]}
          >
            <Suspense fallback={<IslandSkeleton />}>
              <ActivityIsland promise={loaderData.activity} />
            </Suspense>
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
