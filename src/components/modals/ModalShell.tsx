"use client";

import { useEffect, type ReactNode } from "react";

export function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 p-5 backdrop-blur-[2px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] animate-pop-in rounded-2xl bg-white p-6.5 shadow-[0_30px_70px_-25px_rgba(15,23,42,.55)]"
      >
        {children}
      </div>
    </div>
  );
}
