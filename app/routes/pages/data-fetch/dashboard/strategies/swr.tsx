import type { FC } from "react";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import { Modal } from "../../_shared/Modal";
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

const ModalBody: FC<{ fail: boolean; onClose: () => void }> = ({ fail }) => {
  // Keyed by id + fail; SWR caches per key, so reopening shows the cached result.
  const { data, error, isLoading, mutate } = useSWR(`item:${ITEM_ID}:${fail}`, () =>
    loadItem(ITEM_ID, fail),
  );
  if (isLoading) return <DetailSkeleton />;
  if (error instanceof Error) return <ErrorView message={error.message} onRetry={() => mutate()} />;
  if (!data) return null;
  return <DetailView detail={data} />;
};

export const SwrDashboard: FC<{ fail: boolean }> = ({ fail }) => {
  const { mutate } = useSWRConfig();
  const overview = useSWR("overview", loadOverview);

  const [tab, setTab] = useState<TabKind | null>(null);
  // null key disables the request; selecting a tab enables it. Re-selecting a
  // cached tab shows its rows instantly — no skeleton flash.
  const tabQuery = useSWR(tab ? `tab:${tab}` : null, () => loadTab(tab as TabKind));

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addNote = async (text: string) => {
    setSubmitting(true);
    await submitNote(text);
    setSubmitting(false);
    await mutate("overview");
  };

  return (
    <>
      <WidgetCard hint="page-load · useSWR revalidates on mount" title="Overview">
        {overview.isLoading || !overview.data ? (
          <OverviewSkeleton />
        ) : (
          <OverviewView overview={overview.data} />
        )}
      </WidgetCard>

      <WidgetCard hint="on-demand load · useSWR with a dynamic key (cached)" title="Activity">
        <TabBar active={tab} onSelect={setTab} />
        {tab === null ? (
          <p className="text-xs opacity-50">Select a tab to load it.</p>
        ) : tabQuery.isLoading || !tabQuery.data ? (
          <RowListSkeleton />
        ) : (
          <RowList rows={tabQuery.data} />
        )}
      </WidgetCard>

      <WidgetCard hint="on-demand load · useSWR enabled when the modal opens" title="Item detail">
        <button className="btn btn-sm w-fit" onClick={() => setOpen(true)} type="button">
          Open detail
        </button>
        <Modal onClose={() => setOpen(false)} open={open} title={`Item ${ITEM_ID}`}>
          {/* Mounted only while open, so the keyed request fires on open. */}
          <ModalBody fail={fail} onClose={() => setOpen(false)} />
        </Modal>
      </WidgetCard>

      <WidgetCard hint="on-demand action · call, then mutate('overview')" title="Add note">
        <NoteForm onSubmit={addNote} pending={submitting} />
      </WidgetCard>
    </>
  );
};
