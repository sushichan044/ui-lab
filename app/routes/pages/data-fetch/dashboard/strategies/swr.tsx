import type { FC } from "react";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import { Modal } from "../../_shared/Modal";
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

const ModalBody: FC<{ fail: boolean }> = ({ fail }) => {
  const { mutate: globalMutate } = useSWRConfig();
  // Keyed by id + fail; SWR caches per key, so reopening shows the cached result.
  const { data, error, isLoading, mutate } = useSWR(`item:${ITEM_ID}:${fail}`, () =>
    loadItem(ITEM_ID, fail),
  );
  const [submitting, setSubmitting] = useState(false);

  // Mutation inside the modal: add the note, then revalidate the modal's own key (so
  // the notes list updates) and the overview key (so the total updates).
  const handleAddNote = async (text: string) => {
    setSubmitting(true);
    await addNote(ITEM_ID, text);
    setSubmitting(false);
    await Promise.all([mutate(), globalMutate("overview")]);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <DetailSkeleton />
      ) : error instanceof Error ? (
        <ErrorView message={error.message} onRetry={() => mutate()} />
      ) : data ? (
        <DetailView detail={data} />
      ) : null}
      <NoteForm onSubmit={handleAddNote} pending={submitting} />
    </div>
  );
};

export const SwrDashboard: FC<{ fail: boolean }> = ({ fail }) => {
  const overview = useSWR("overview", loadOverview);

  const [tab, setTab] = useState<TabKind | null>(null);
  // null key disables the request; selecting a tab enables it. Re-selecting a
  // cached tab shows its rows instantly — no skeleton flash.
  const tabQuery = useSWR(tab ? `tab:${tab}` : null, () => loadTab(tab as TabKind));

  const [open, setOpen] = useState(false);

  return (
    <>
      <WidgetCard
        badge="useSWR"
        className="lg:col-span-2"
        hint="page-load · useSWR revalidates on mount"
        title="Overview"
      >
        {overview.isLoading || !overview.data ? (
          <OverviewSkeleton />
        ) : (
          <OverviewView overview={overview.data} />
        )}
      </WidgetCard>

      <WidgetCard
        badge="useSWR (keyed)"
        hint="on-demand load · useSWR with a dynamic key (cached)"
        title="Activity"
      >
        <TabBar active={tab} onSelect={setTab} />
        {tab === null ? (
          <p className="text-xs opacity-50">Select a tab to load it.</p>
        ) : tabQuery.isLoading || !tabQuery.data ? (
          <RowListSkeleton />
        ) : (
          <RowList rows={tabQuery.data} />
        )}
      </WidgetCard>

      <WidgetCard
        badge="useSWR + mutate"
        hint="on-demand load on open · in-modal note mutation revalidates both keys"
        title="Item detail"
      >
        <button className="btn btn-sm w-fit" onClick={() => setOpen(true)} type="button">
          Open detail
        </button>
        <Modal onClose={() => setOpen(false)} open={open} title={`Item ${ITEM_ID}`}>
          {/* Mounted only while open, so the keyed request fires on open. */}
          <ModalBody fail={fail} />
        </Modal>
      </WidgetCard>
    </>
  );
};
