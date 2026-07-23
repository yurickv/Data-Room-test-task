"use client";

import { useMemo } from "react";
import { formatSize } from "@/lib/format";
import { flattenFolderTree } from "@/lib/tree";
import { useDataRoom } from "@/store/data-room-context";
import { FolderIcon, FolderLockIcon, HomeIcon, ShieldIcon } from "./icons";

const STORAGE_CAP_BYTES = 5 * 1024 ** 3;

interface SidebarProps {
  /** Mobile drawer state; on md+ the sidebar is always visible and these are inert. */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { nodes, view, currentRoomId, currentFolderId, goHome, openFolder } = useDataRoom();

  const navigate = (action: () => void) => {
    action();
    onMobileClose();
  };

  const tree = useMemo(
    () => (currentRoomId ? flattenFolderTree(nodes, currentRoomId) : []),
    [nodes, currentRoomId],
  );

  const usedBytes = useMemo(
    () =>
      Object.values(nodes).reduce((sum, n) => sum + (n.type === "file" ? n.size : 0), 0),
    [nodes],
  );
  const usedPct = Math.max(1, Math.round((usedBytes / STORAGE_CAP_BYTES) * 100));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col overflow-hidden bg-navy text-slate-300 transition-transform duration-200 md:static md:z-auto md:w-auto md:translate-x-0 md:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 pt-4 pb-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <FolderLockIcon size={17} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-serif text-[15px] leading-tight font-semibold text-white">
            Acme Corp.
          </div>
          <div className="text-[11px] text-[#7f90b3]">Data Room</div>
        </div>
      </div>

      <div className="px-3 pt-3.5 pb-1.5">
        <button
          onClick={() => navigate(goHome)}
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13.5px] font-medium transition-colors hover:bg-white/5 ${
            view === "home" ? "bg-white/10 text-white" : "text-slate-300"
          }`}
        >
          <HomeIcon size={16} />
          All Data Rooms
        </button>
      </div>

      {view === "browser" && (
        <>
          <div className="px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-wider text-[#5f7098] uppercase">
            Folders
          </div>
          <nav className="dr-scroll flex-1 overflow-y-auto px-2 pb-3">
            {tree.length === 0 && (
              <p className="px-3 py-2 text-xs text-[#5f7098]">No folders yet</p>
            )}
            {tree.map(({ folder, depth }) => {
              const active = folder.id === currentFolderId;
              return (
                <button
                  key={folder.id}
                  onClick={() => navigate(() => openFolder(folder.id))}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-[7px] text-left text-[13px] font-medium transition-colors ${
                    active ? "bg-accent/30 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                  style={{ marginLeft: depth * 14, width: `calc(100% - ${depth * 14}px)` }}
                >
                  <FolderIcon size={15} className="shrink-0 opacity-85" />
                  <span className="truncate">{folder.name}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}
      {view !== "browser" && <div className="flex-1" />}

      <div className="border-t border-white/10 px-4 py-3.5">
        <div className="mb-1.5 flex justify-between text-[11.5px] text-[#8493b5]">
          <span>{formatSize(usedBytes)} of 5 GB</span>
          <span>{usedPct}%</span>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-[#5b82ff]"
            style={{ width: `${Math.max(2, (usedBytes / STORAGE_CAP_BYTES) * 100)}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[#5f9e8f]">
          <ShieldIcon size={13} />
          Encrypted · Audit log active
        </div>
      </div>
      </aside>
    </>
  );
}
