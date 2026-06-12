"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bottom sheet, per the Figma frames: drag handle, hairline divider,
 * content slides up over the page. Built on <dialog> for free focus
 * trapping and Escape handling.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Backdrop click: the dialog element itself is the click target
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className="fixed inset-x-0 bottom-0 m-0 mx-auto max-h-[85svh] w-full max-w-(--container-column) bg-transparent p-0 backdrop:bg-black/50 open:animate-[sheet-in_240ms_cubic-bezier(0.32,0.72,0,1)]"
    >
      <div className="flex max-h-[85svh] flex-col rounded-t-(--radius-sheet) bg-surface">
        <div className="flex shrink-0 justify-center pb-4 pt-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-1 w-24 rounded-full bg-ink"
          />
        </div>
        <div className="h-px shrink-0 bg-surface-edge" />
        <div className="overflow-y-auto px-6 pb-12 pt-8">
          <h2 className="text-2xl font-medium">{title}</h2>
          <div className="pt-6">{children}</div>
        </div>
      </div>
      <style>{`
        @keyframes sheet-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </dialog>
  );
}
