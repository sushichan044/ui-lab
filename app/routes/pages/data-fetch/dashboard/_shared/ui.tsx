import type { FC, ReactNode } from "react";

import type { ItemDetail } from "../../_shared/fakeApi";
import type { Overview, Row, TabKind } from "./api";
import { TABS } from "./api";

// --- Overview (widget 1) ---

export const OverviewView: FC<{ overview: Overview }> = ({ overview }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="avatar avatar-placeholder">
        <div className="bg-neutral text-neutral-content w-12 rounded-full">
          <span>{overview.profile.name.slice(0, 2).toUpperCase()}</span>
        </div>
      </div>
      <div>
        <p className="font-semibold">{overview.profile.name}</p>
        <p className="text-xs opacity-70">{overview.profile.bio}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {overview.kpis.map((kpi) => (
        <div className="stat bg-base-200 rounded-box p-3" key={kpi.label}>
          <div className="stat-title text-xs">{kpi.label}</div>
          <div className="stat-value text-2xl">{kpi.value}</div>
        </div>
      ))}
      <div className="stat bg-base-200 rounded-box p-3">
        <div className="stat-title text-xs">Notes</div>
        <div className="stat-value text-2xl">{overview.noteCount}</div>
      </div>
    </div>
  </div>
);

export const OverviewSkeleton: FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="skeleton h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-3 w-48" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div className="skeleton h-16 w-full" key={i} />
      ))}
    </div>
  </div>
);

// --- Tabs (widget 2) ---

export const TabBar: FC<{
  active: TabKind | null;
  onSelect: (id: TabKind) => void;
  pending?: boolean;
}> = ({ active, onSelect, pending }) => (
  <div className="tabs tabs-boxed w-fit">
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

export const RowList: FC<{ rows: Row[] }> = ({ rows }) => (
  <ul className="space-y-2">
    {rows.map((row) => (
      <li className="card bg-base-200 p-3" key={row.id}>
        <p className="text-sm font-semibold">{row.primary}</p>
        <p className="text-xs opacity-70">{row.secondary}</p>
      </li>
    ))}
  </ul>
);

export const RowListSkeleton: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-14 w-full" />
    <div className="skeleton h-14 w-full" />
    <div className="skeleton h-14 w-full" />
  </div>
);

// --- Detail modal (widget 3) ---

export const DetailView: FC<{ detail: ItemDetail }> = ({ detail }) => (
  <div className="space-y-2">
    <p className="font-semibold">{detail.name}</p>
    <p className="text-sm opacity-70">{detail.description}</p>
    <div className="flex gap-4 text-xs opacity-50">
      <span>owner: {detail.owner}</span>
      <span>updated: {detail.updatedAt}</span>
    </div>
  </div>
);

export const DetailSkeleton: FC = () => (
  <div className="space-y-2">
    <div className="skeleton h-5 w-1/3" />
    <div className="skeleton h-4 w-full" />
    <div className="skeleton h-4 w-2/3" />
  </div>
);

export const ErrorView: FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="space-y-2">
    <p className="text-error text-sm font-semibold">Failed to load</p>
    <p className="text-xs opacity-70">{message}</p>
    <button className="btn btn-sm btn-outline btn-error" onClick={onRetry} type="button">
      Retry
    </button>
  </div>
);

// --- Note form (widget 4) ---

export const NoteForm: FC<{
  onSubmit: (text: string) => void;
  pending: boolean;
  children?: ReactNode;
}> = ({ onSubmit, pending, children }) => (
  <form
    className="flex gap-2"
    onSubmit={(e) => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem("note");
      if (input instanceof HTMLInputElement) {
        onSubmit(input.value);
        e.currentTarget.reset();
      }
    }}
  >
    <input
      className="input input-sm input-bordered flex-1"
      name="note"
      placeholder="Add a quick note…"
      type="text"
    />
    <button className="btn btn-sm btn-primary" disabled={pending} type="submit">
      {pending ? <span className="loading loading-spinner loading-xs" /> : "Add"}
    </button>
    {children}
  </form>
);

// --- Section frame shared by all widgets ---

export const WidgetCard: FC<{ title: string; hint: string; children: ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <section className="card bg-base-100 border border-base-300 p-4 space-y-3">
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-xs opacity-60">{hint}</p>
    </div>
    {children}
  </section>
);
