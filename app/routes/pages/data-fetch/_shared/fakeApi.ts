export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface FetchOptions {
  delayMs: number;
  shouldFail: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
}

export interface FeedItem {
  id: string;
  title: string;
  body: string;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchUserProfile(opts: FetchOptions): Promise<UserProfile> {
  await delay(opts.delayMs);
  if (opts.shouldFail) throw new ApiError(500, "Failed to load profile");
  return {
    id: "user-1",
    name: "Sushichan044",
    bio: "Frontend engineer exploring Suspense patterns.",
  };
}

export async function fetchFeed(opts: FetchOptions): Promise<FeedItem[]> {
  await delay(opts.delayMs);
  if (opts.shouldFail) throw new ApiError(500, "Feed failed to load");
  return [
    { id: "f1", title: "Suspense Island Alpha", body: "First item from the feed." },
    { id: "f2", title: "Suspense Island Beta", body: "Second item from the feed." },
    { id: "f3", title: "Suspense Island Gamma", body: "Third item from the feed." },
  ];
}

export async function fetchRecommendations(opts: FetchOptions): Promise<Recommendation[]> {
  await delay(opts.delayMs);
  if (opts.shouldFail) throw new ApiError(500, "Recommendations failed to load");
  return [
    { id: "r1", title: "React Suspense Docs", reason: "You are exploring Suspense patterns." },
    {
      id: "r2",
      title: "Error Boundary Guide",
      reason: "ErrorBoundary + toast is the right pattern.",
    },
  ];
}

export async function fetchActivity(opts: FetchOptions): Promise<ActivityItem[]> {
  await delay(opts.delayMs);
  if (opts.shouldFail) throw new ApiError(500, "Activity failed to load");
  return [
    { id: "a1", action: "Opened islands page", timestamp: "just now" },
    { id: "a2", action: "Read Suspense docs", timestamp: "5 min ago" },
    { id: "a3", action: "Explored ErrorBoundary", timestamp: "10 min ago" },
  ];
}
