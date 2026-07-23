"use client";

import { useEffect, useRef, useState } from "react";
import { useDataRoom } from "@/store/data-room-context";
import { SearchIcon, UploadIcon } from "./icons";

interface TopbarProps {
  onUploadClick: () => void;
}

export function Topbar({ onUploadClick }: TopbarProps) {
  const { user, view, search, setSearch, signOut } = useDataRoom();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-white px-6">
      {view === "browser" && (
        <div className="relative max-w-[460px] flex-1">
          <SearchIcon
            size={17}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 opacity-50"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files and folders by name…"
            className="h-10 w-full rounded-[10px] border border-[#e2e7f0] bg-[#f7f9fc] pr-9 pl-9.5 text-sm outline-none transition-all focus:border-accent focus:bg-white focus:ring-[3px] focus:ring-accent-ring"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex h-[22px] w-[22px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-[#e8edf5] text-xs text-slate-500"
            >
              ✕
            </button>
          )}
        </div>
      )}
      <div className="flex-1" />

      {view === "browser" && (
        <button
          onClick={onUploadClick}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-[#e2e7f0] bg-white px-4 text-[13.5px] font-semibold text-slate-700 transition-all hover:border-[#c3ccdc] hover:bg-[#f7f9fc]"
        >
          <UploadIcon size={16} />
          Upload
        </button>
      )}

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-2.5 rounded-full py-1 pr-1.5 pl-1 transition-colors hover:bg-[#f1f4f9]"
        >
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#5b82ff] text-[13px] font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <div className="text-[13px] font-semibold text-slate-800">{user.name}</div>
            <div className="text-[11px] text-slate-400">{user.email}</div>
          </div>
        </button>
        {menuOpen && (
          <div className="absolute top-13 right-0 z-40 w-[210px] animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-[0_20px_44px_-20px_rgba(15,23,42,.4)]">
            <div className="mb-1 border-b border-[#f1f4f9] px-3 py-2.5">
              <div className="text-[13px] font-semibold">{user.name}</div>
              <div className="text-[11.5px] text-slate-400">{user.email}</div>
            </div>
            <button
              onClick={signOut}
              className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
