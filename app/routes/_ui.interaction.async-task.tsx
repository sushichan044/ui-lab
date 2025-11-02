import { useRef } from "react";
import toast from "react-hot-toast";

import type { Route } from "./+types/_ui.interaction.async-task";

import { useAsyncTask } from "../hooks/useAsyncTask";

export default function Page({}: Route.ComponentProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { isPending, run } = useAsyncTask({
    onError: (error) => {
      dialogRef.current?.close();

      toast.error(
        `Task failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          id: "async-task",
        },
      );
    },
    onStart: () => {
      dialogRef.current?.showModal();

      toast.loading("Task started", { id: "async-task" });
    },
    onSuccess: () => {
      dialogRef.current?.close();

      toast.success("Task completed", { id: "async-task" });
    },
    task: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      if (Math.random() < 0.5) {
        throw new Error("Bad luck!");
      }
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    },
  });

  return (
    <main className="mx-auto container p-4">
      <div className="space-y-4 md:space-y-8">
        <h1 className="text-3xl">Async Task UI</h1>
        <section className="space-y-2 md:space-y-4">
          <button
            className="btn"
            disabled={isPending}
            onClick={run}
            type="button"
          >
            <span>Start 5 seconds task</span>
          </button>

          <dialog className="modal" id="task-modal" ref={dialogRef}>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">Press ESC key or click outside to close.</p>
              <p>Task will continue running in the background.</p>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn" type="submit">
                    Close
                  </button>
                </form>
              </div>
            </div>
            <form className="modal-backdrop" method="dialog">
              <button type="submit">close</button>
            </form>
          </dialog>
        </section>
      </div>
    </main>
  );
}
