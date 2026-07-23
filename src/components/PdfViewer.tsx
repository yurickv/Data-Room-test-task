"use client";

import { useEffect, useState } from "react";
import { formatSize } from "@/lib/format";
import { getFileBlob } from "@/lib/idb";
import type { FileNode } from "@/lib/types";
import { PdfFileIcon } from "./icons";

interface PdfViewerProps {
  file: FileNode;
  onClose: () => void;
}

/**
 * Full-screen overlay. Uploaded files render inline from an IndexedDB blob;
 * seed files (metadata only) show a document placeholder instead.
 */
export function PdfViewer({ file, onClose }: PdfViewerProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!file.hasData);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!file.hasData) return;
    let url: string | null = null;
    let cancelled = false;
    void getFileBlob(file.id)
      .then((blob) => {
        if (cancelled || !blob) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id, file.hasData]);

  const meta =
    formatSize(file.size) + (file.pages ? ` · ${file.pages} pages` : "");

  return (
    <div className="fixed inset-0 z-120 flex animate-[fade-in_.2s_ease_both] flex-col bg-[#090e1a]/70 backdrop-blur-[3px]">
      <div className="flex h-[60px] shrink-0 items-center gap-3.5 px-5.5 text-slate-200">
        <PdfFileIcon size={20} className="text-red-400" />
        <div className="truncate text-[14.5px] font-semibold">{file.name}</div>
        <div className="text-[12.5px] whitespace-nowrap text-slate-400">{meta}</div>
        <div className="flex-1" />
        <button
          onClick={onClose}
          aria-label="Close viewer"
          className="h-[38px] w-[38px] cursor-pointer rounded-[10px] border border-white/15 bg-white/5 text-base text-slate-200 transition-colors hover:bg-white/15"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-hidden px-5.5 pb-5.5">
        <div className="h-full w-full overflow-hidden rounded-xl bg-white">
          {src ? (
            <iframe src={src} title={file.name} className="h-full w-full border-none" />
          ) : loading ? (
            <div className="flex h-full w-full items-center justify-center bg-canvas">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#e2e7f0] border-t-accent" />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-canvas p-10 text-center">
              <div className="w-[130px] rounded-lg border border-[#e2e7f0] bg-white p-4.5 text-left shadow-[0_20px_40px_-20px_rgba(15,23,42,.35)]">
                <div className="h-2 w-[70%] rounded-[3px] bg-red-600 opacity-85" />
                <div className="mt-3.5 h-[7px] rounded-[3px] bg-[#e2e7f0]" />
                <div className="mt-[7px] h-[7px] w-[90%] rounded-[3px] bg-[#e2e7f0]" />
                <div className="mt-[7px] h-[7px] w-[80%] rounded-[3px] bg-[#e2e7f0]" />
                <div className="mt-3.5 h-[7px] w-[95%] rounded-[3px] bg-[#e2e7f0]" />
                <div className="mt-[7px] h-[7px] w-[60%] rounded-[3px] bg-[#e2e7f0]" />
              </div>
              <h3 className="mt-6 text-[17px] font-semibold">{file.name}</h3>
              <p className="mt-2 max-w-[340px] text-[13.5px] leading-relaxed text-slate-500">
                This is a sample document in the demo Data Room. Upload your own PDF to see it
                render fully inline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
