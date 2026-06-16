import type { FC } from "react";
import { Suspense, use, useState, useTransition } from "react";
import { useFetcher } from "react-router";

import { ErrorBoundary } from "../../_shared/ErrorBoundary";
import type { ItemDetail } from "../../_shared/fakeApi";
import { Modal } from "../../_shared/Modal";
import type { Overview, Row, TabKind } from "../_shared/api";
import { ITEM_ID } from "../_shared/api";
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
import type { clientLoader as itemClientLoader } from "../data/item";
import type { clientLoader as tabClientLoader } from "../data/tab";

const OverviewStream: FC<{ promise: Promise<Overview> }> = ({ promise }) => (
  <OverviewView overview={use(promise)} />
);

const TabRows: FC<{ promise: Promise<Row[]> }> = ({ promise }) => <RowList rows={use(promise)} />;

const ModalDetail: FC<{ promise: Promise<ItemDetail> }> = ({ promise }) => (
  <DetailView detail={use(promise)} />
);

export const ClientLoaderDashboard: FC<{ fail: boolean; overview: Promise<Overview> | null }> = ({
  fail,
  overview,
}) => {
  const tabFetcher = useFetcher<typeof tabClientLoader>();
  const [tab, setTab] = useState<TabKind | null>(null);
  const [pending, startTransition] = useTransition();
  // startTransition keeps the current tab visible while the next one loads.
  const selectTab = (kind: TabKind) => {
    startTransition(async () => {
      setTab(kind);
      await tabFetcher.load(`/data-fetch/dashboard/data/tab/${kind}`);
    });
  };

  const itemFetcher = useFetcher<typeof itemClientLoader>();
  const [open, setOpen] = useState(false);
  const itemHref = `/data-fetch/dashboard/data/item/${ITEM_ID}?fail=${fail ? "1" : "0"}`;
  const openModal = () => {
    void itemFetcher.load(itemHref);
    setOpen(true);
  };

  const noteFetcher = useFetcher();
  const addNote = (text: string) => {
    void noteFetcher.submit(
      { note: text },
      { action: "/data-fetch/dashboard/data/mutate", method: "post" },
    );
  };

  return (
    <>
      <WidgetCard hint="page-load · clientLoader (runs at navigation)" title="Overview">
        <Suspense fallback={<OverviewSkeleton />}>
          {overview ? <OverviewStream promise={overview} /> : <OverviewSkeleton />}
        </Suspense>
      </WidgetCard>

      <WidgetCard hint="on-demand load · fetcher.load() + startTransition" title="Activity">
        <TabBar active={tab} onSelect={selectTab} pending={pending} />
        {tab === null ? (
          <p className="text-xs opacity-50">Select a tab to load it.</p>
        ) : (
          <div className={pending ? "opacity-60 transition-opacity" : ""}>
            <Suspense fallback={<RowListSkeleton />}>
              {tabFetcher.data ? <TabRows promise={tabFetcher.data.rows} /> : <RowListSkeleton />}
            </Suspense>
          </div>
        )}
      </WidgetCard>

      <WidgetCard hint="on-demand load · fetcher.load() on open" title="Item detail">
        <button className="btn btn-sm w-fit" onClick={openModal} type="button">
          Open detail
        </button>
        <Modal onClose={() => setOpen(false)} open={open} title={`Item ${ITEM_ID}`}>
          {/* ErrorBoundary + Suspense stay INSIDE the modal so a failed/pending fetch
              never bubbles to the root boundary and blanks the page. */}
          <ErrorBoundary
            fallback={({ error }) => (
              <ErrorView
                message={error.message}
                onRetry={() => {
                  void itemFetcher.load(itemHref);
                }}
              />
            )}
            resetKeys={[itemFetcher.data]}
          >
            <Suspense fallback={<DetailSkeleton />}>
              {itemFetcher.data ? (
                <ModalDetail promise={itemFetcher.data.detail} />
              ) : (
                <DetailSkeleton />
              )}
            </Suspense>
          </ErrorBoundary>
        </Modal>
      </WidgetCard>

      <WidgetCard hint="on-demand action · clientAction + auto revalidation" title="Add note">
        <NoteForm onSubmit={addNote} pending={noteFetcher.state !== "idle"} />
      </WidgetCard>
    </>
  );
};
