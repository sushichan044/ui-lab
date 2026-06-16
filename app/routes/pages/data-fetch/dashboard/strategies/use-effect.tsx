import type { FC } from "react";
import { useCallback, useState } from "react";

import { Modal } from "../../_shared/Modal";
import { useManualFetch } from "../../_shared/useManualFetch";
import type { TabKind } from "../_shared/api";
import { ITEM_ID, loadItem, loadOverview, loadTab, submitNote } from "../_shared/api";
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
const ModalBody: FC<{ fail: boolean; onClose: () => void }> = ({ fail, onClose }) => {
  const fetcher = useCallback((id: string) => loadItem(id, fail), [fail]);
  const { data, loading, error } = useManualFetch(ITEM_ID, fetcher);
  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorView message={error.message} onRetry={onClose} />;
  if (!data) return null;
  return <DetailView detail={data} />;
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
  const [submitting, setSubmitting] = useState(false);

  const addNote = async (text: string) => {
    setSubmitting(true);
    await submitNote(text);
    setSubmitting(false);
    setOverviewVersion((v) => v + 1);
  };

  return (
    <>
      <WidgetCard hint="page-load · useEffect fetch on mount" title="Overview">
        {overview.loading || !overview.data ? (
          <OverviewSkeleton />
        ) : (
          <OverviewView overview={overview.data} />
        )}
      </WidgetCard>

      <WidgetCard hint="on-demand load · fetch in the click handler" title="Activity">
        <TabBar active={tab} onSelect={setTab} />
        {tab === null ? (
          <p className="text-xs opacity-50">Select a tab to load it.</p>
        ) : tabState.loading || !tabState.data ? (
          <RowListSkeleton />
        ) : (
          <RowList rows={tabState.data} />
        )}
      </WidgetCard>

      <WidgetCard hint="on-demand load · fetch when the modal opens" title="Item detail">
        <button className="btn btn-sm w-fit" onClick={() => setOpen(true)} type="button">
          Open detail
        </button>
        <Modal onClose={() => setOpen(false)} open={open} title={`Item ${ITEM_ID}`}>
          <ModalBody fail={fail} onClose={() => setOpen(false)} />
        </Modal>
      </WidgetCard>

      <WidgetCard hint="on-demand action · call, then refetch the overview" title="Add note">
        <NoteForm onSubmit={addNote} pending={submitting} />
      </WidgetCard>
    </>
  );
};
