"use client";

import { useEffect } from "react";
import { useDataRoom } from "@/store/data-room-context";

export function UploadToast() {
  const { uploading } = useDataRoom();
  if (!uploading) return null;

  const label =
    uploading.fileName + (uploading.extraCount > 0 ? ` +${uploading.extraCount} more` : "");

  return (
    <div className="absolute right-6 bottom-5 z-50 flex animate-pop-in items-center gap-3 rounded-xl border border-line bg-white px-4.5 py-3.5 shadow-[0_20px_44px_-20px_rgba(15,23,42,.4)]">
      <div className="h-[22px] w-[22px] animate-spin rounded-full border-[2.5px] border-[#e2e7f0] border-t-accent" />
      <div>
        <div className="text-[13.5px] font-semibold">Uploading {label}</div>
        <div className="text-[11.5px] text-slate-400">Encrypting and adding to Data Room…</div>
      </div>
    </div>
  );
}

export function UploadErrorToast() {
  const { uploadError, dismissUploadError } = useDataRoom();

  useEffect(() => {
    if (!uploadError) return;
    const t = setTimeout(dismissUploadError, 6000);
    return () => clearTimeout(t);
  }, [uploadError, dismissUploadError]);

  if (!uploadError) return null;

  return (
    <div className="absolute right-6 bottom-24 z-50 flex max-w-md animate-pop-in items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4.5 py-3.5 shadow-[0_20px_44px_-20px_rgba(15,23,42,.3)]">
      <div className="min-w-0 text-[13px] leading-normal font-medium break-words text-red-700">
        {uploadError}
      </div>
      <button
        onClick={dismissUploadError}
        aria-label="Dismiss"
        className="cursor-pointer text-sm text-red-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
