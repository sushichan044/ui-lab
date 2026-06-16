import type { FC } from "react";
import { useCallback, useState } from "react";

import { Modal } from "../../_shared/Modal";
import { useManualFetch } from "../../_shared/useManualFetch";
import type { TabKind } from "../_shared/api";
import { addNote, ITEM_ID, loadItem, loadOverview, loadTab } from "../_shared/api";
import {
  DetailSkeleton,
  DetailView,
  ErrorView,
  NoteForm,
  OverviewSkeleton,
  OverviewView,
  RowList,
  RowListSkeleton,
  TabBar,
  WidgetCard,
} from "../_shared/ui";

// Mounted only while the modal is open, so the fetch is on-demand. useManualFetch
// runs the fetch on mount and tracks loading/error in component state.
const ModalBody: FC<{ fail: boolean; onMutated: () => void }> = ({ fail, onMutated }) => {
  // Bumping the version changes the key, which re-runs the item fetch — this is how
  // the imperative strategy revalidates the modal's own detail after a mutation.
  const [version, setVersion] = useState(0);
  const fetcher = useCallback(() => loadItem(ITEM_ID, fail), [fail]);
  const { data, loading, error } = useManualFetch(`${ITEM_ID}:${version}`, fetcher);
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async (text: string) => {
    setSubmitting(true);
    await addNote(ITEM_ID, text);
    setSubmitting(false);
    setVersion((v) => v + 1); // refetch this item's detail (in-modal notes list)
    onMutated(); // refetch the overview total
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <DetailSkeleton />
      ) : error ? (
        <ErrorView message={error.message} onRetry={() => setVersion((v) => v + 1)} />
      ) : data ? (
        <DetailView detail={data} />
      ) : null}
      <NoteForm onSubmit={handleAddNote} pending={submitting} />
    </div>
  );
};

export const UseEffectDashboard: FC<{ fail: boolean }> = ({ fail }) => {
  // Bumping the version changes the key, which re-runs the overview fetch — this is
  // how the imperative strategy "revalidates" after a mutation.
  const [overviewVersion, setOverviewVersion] = useState(0);
  const overview = useManualFetch(`overview:${overviewVersion}`, loadOverview);

  const [tab, setTab] = useState<TabKind | null>(null);
  const loadTabRows = useCallback((kind: string) => loadTab(kind as TabKind), []);
  // Keyed by the active tab — every switch re-runs the fetch and flashes the skeleton.
  const tabState = useManualFetch(tab, loadTabRows);

  const [open, setOpen] = useState(false);

  return (
    <>
      <WidgetCard
        badge="useEffect"
        className="lg:col-span-2"
        hint="page-load · useEffect fetch on mount"
        title="Overview"
      >
        {overview.loading || !overview.data ? (
          <OverviewSkeleton />
        ) : (
          <OverviewView overview={overview.data} />
        )}
      </WidgetCard>

      <WidgetCard
        badge="useEffect (keyed)"
        hint="on-demand load · fetch in the click handler"
        title="Activity"
      >
        <TabBar active={tab} onSelect={setTab} />
        {tab === null ? (
          <p className="text-xs opacity-50">Select a tab to load it.</p>
        ) : tabState.loading || !tabState.data ? (
          <RowListSkeleton />
        ) : (
          <RowList rows={tabState.data} />
        )}
      </WidgetCard>

      <WidgetCard
        badge="useEffect + refetch"
        hint="on-demand load on open · in-modal note mutation refetches detail + overview"
        title="Item detail"
      >
        <button className="btn btn-sm w-fit" onClick={() => setOpen(true)} type="button">
          Open detail
        </button>
        <Modal onClose={() => setOpen(false)} open={open} title={`Item ${ITEM_ID}`}>
          <ModalBody fail={fail} onMutated={() => setOverviewVersion((v) => v + 1)} />
        </Modal>
      </WidgetCard>
    </>
  );
};
