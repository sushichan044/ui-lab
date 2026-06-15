import type { FC, ReactNode } from "react";
import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Native <dialog> wrapper used by the on-demand modal demos.
// Children are mounted ONLY while `open` is true — this is the key to on-demand
// fetching: a child that fetches on mount never runs while the modal is closed.
export const Modal: FC<ModalProps> = ({ open, onClose, title, children }) => {
  const ref = useRef<HTMLDialogElement>(null);

  // Drive the dialog imperatively so the browser gives us the top layer, focus
  // trap, and Esc handling for free. showModal() must not be called twice.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog className="modal" onClose={onClose} ref={ref}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4">{open && children}</div>
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
  );
};
