"use client";

import { TrashIcon } from "../icons";
import { ModalShell } from "./ModalShell";

interface DeleteModalProps {
  kind: "folder" | "file";
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteModal({ kind, description, onConfirm, onClose }: DeleteModalProps) {
  return (
    <ModalShell onClose={onClose}>
      <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-[11px] bg-red-50">
        <TrashIcon size={24} className="text-red-600" />
      </div>
      <h3 className="text-lg font-semibold">Delete {kind}?</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{description}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-[42px] cursor-pointer rounded-[10px] border border-[#e2e7f0] bg-white px-4.5 text-sm font-semibold text-slate-600 hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="h-[42px] cursor-pointer rounded-[10px] bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </ModalShell>
  );
}
