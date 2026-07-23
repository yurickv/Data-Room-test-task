"use client";

import { useMemo, useState } from "react";
import { pluralize } from "@/lib/format";
import { childrenOf, pathOf, sortNodes } from "@/lib/tree";
import type { FileNode, TreeNode } from "@/lib/types";
import { useDataRoom } from "@/store/data-room-context";
import { ItemRow } from "./ItemRow";
import { FolderIcon, FolderPlusIcon, SearchIcon, UploadIcon } from "./icons";

interface BrowserViewProps {
  onNewFolder: () => void;
  onUploadClick: () => void;
  onRename: (id: string) => void;
  onMove: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenFile: (file: FileNode) => void;
}

export function BrowserView({
  onNewFolder,
  onUploadClick,
  onRename,
  onMove,
  onDelete,
  onOpenFile,
}: BrowserViewProps) {
  const { rooms, nodes, currentRoomId, currentFolderId, search, setSearch, openFolder } =
    useDataRoom();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadFiles } = useDataRoom();

  const room = rooms.find((r) => r.id === currentRoomId);
  const query = search.trim().toLowerCase();

  const items: TreeNode[] = useMemo(() => {
    if (!currentRoomId) return [];
    if (query) {
      return sortNodes(
        Object.values(nodes).filter(
          (n) => n.roomId === currentRoomId && n.name.toLowerCase().includes(query),
        ),
      );
    }
    return childrenOf(nodes, currentRoomId, currentFolderId);
  }, [nodes, currentRoomId, currentFolderId, query]);

  const crumbs = useMemo(() => {
    const chain: Array<{ id: string | null; name: string }> = [];
    let cursor = currentFolderId;
    while (cursor) {
      const node = nodes[cursor];
      if (!node) break;
      chain.unshift({ id: node.id, name: node.name });
      cursor = node.parentId;
    }
    return [{ id: null, name: room?.name ?? "Data Room" }, ...chain];
  }, [nodes, currentFolderId, room]);

  if (!room) return null;
  const currentTitle = crumbs[crumbs.length - 1].name;

  const openNode = (node: TreeNode) => {
    setOpenMenuId(null);
    if (node.type === "folder") openFolder(node.id);
    else onOpenFile(node);
  };

  return (
    <>
      {/* Header: breadcrumbs + actions */}
      <div className="shrink-0 border-b border-line-soft bg-white px-4 pt-4 pb-3.5 sm:px-6 sm:pt-5">
        <nav className="mb-3.5 flex flex-wrap items-center gap-1.5 text-[13.5px]">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={crumb.id ?? "root"} className="flex items-center gap-1.5">
                <button
                  onClick={() => openFolder(crumb.id)}
                  className={`cursor-pointer transition-colors hover:text-accent ${
                    last ? "font-semibold text-slate-900" : "font-medium text-slate-500"
                  }`}
                >
                  {crumb.name}
                </button>
                {!last && <span className="text-slate-300">/</span>}
              </span>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="min-w-0 truncate font-serif text-[22px] font-semibold tracking-tight">
            {currentTitle}
          </h1>
          <div className="flex-1" />
          <button
            onClick={onNewFolder}
            aria-label="New Folder"
            className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#e2e7f0] bg-white px-3 text-[13px] font-semibold whitespace-nowrap text-slate-700 transition-all hover:border-[#c3ccdc] hover:bg-[#f7f9fc] sm:px-3.5"
          >
            <FolderPlusIcon size={15} className="shrink-0" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button
            onClick={onUploadClick}
            aria-label="Upload PDF"
            className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] bg-accent px-3 text-[13px] font-semibold whitespace-nowrap text-white shadow-[0_8px_18px_-9px_rgba(40,86,214,.6)] transition-colors hover:bg-accent-dark sm:px-4"
          >
            <UploadIcon size={15} className="shrink-0" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`dr-scroll relative flex-1 overflow-y-auto px-4 pb-10 sm:px-6 ${
          dragOver ? "ring-2 ring-accent ring-inset" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(Array.from(e.dataTransfer.files));
        }}
      >
        {query && (
          <div className="px-0.5 py-3 text-[13px] text-slate-500">
            {pluralize(items.length, "result")} for &ldquo;{search}&rdquo;
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="sticky top-0 z-5 hidden grid-cols-[minmax(0,1fr)_84px_96px_118px_40px] gap-2.5 border-b border-line-soft bg-canvas px-3.5 py-3 text-[11.5px] font-semibold tracking-wide text-slate-400 uppercase md:grid">
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Modified</span>
              <span />
            </div>
            {items.map((node) => (
              <ItemRow
                key={node.id}
                node={node}
                childCount={
                  node.type === "folder"
                    ? Object.values(nodes).filter((n) => n.parentId === node.id).length
                    : 0
                }
                pathLabel={
                  query ? pathOf(nodes, node.parentId).join(" / ") || room.name : undefined
                }
                menuOpen={openMenuId === node.id}
                onToggleMenu={() => setOpenMenuId((v) => (v === node.id ? null : node.id))}
                onCloseMenu={() => setOpenMenuId(null)}
                onOpen={() => openNode(node)}
                onRename={() => {
                  setOpenMenuId(null);
                  onRename(node.id);
                }}
                onMove={() => {
                  setOpenMenuId(null);
                  onMove(node.id);
                }}
                onDelete={() => {
                  setOpenMenuId(null);
                  onDelete(node.id);
                }}
              />
            ))}
          </>
        )}

        {items.length === 0 && !query && (
          <div className="animate-fade-in px-5 py-[70px] text-center">
            <div className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-[18px] bg-accent-soft">
              <FolderIcon size={36} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold">This folder is empty</h3>
            <p className="mx-auto mt-1.5 max-w-[340px] text-sm leading-normal text-slate-500">
              Create a subfolder to organize documents, or upload PDFs to get started. You can also
              drag &amp; drop PDF files here.
            </p>
            <div className="mt-5 flex justify-center gap-2.5">
              <button
                onClick={onNewFolder}
                className="h-10 cursor-pointer rounded-[10px] border border-[#e2e7f0] bg-white px-4 text-[13.5px] font-semibold text-slate-700 hover:border-[#c3ccdc]"
              >
                New Folder
              </button>
              <button
                onClick={onUploadClick}
                className="h-10 cursor-pointer rounded-[10px] bg-accent px-4 text-[13.5px] font-semibold text-white hover:bg-accent-dark"
              >
                Upload PDF
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && query && (
          <div className="px-5 py-[70px] text-center">
            <div className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-[18px] bg-[#f1f4f9]">
              <SearchIcon size={34} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">No matches for &ldquo;{search}&rdquo;</h3>
            <p className="mt-1.5 text-sm text-slate-500">Try a different name or clear the search.</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 h-[38px] cursor-pointer rounded-[10px] border border-[#e2e7f0] bg-white px-4 text-[13.5px] font-semibold hover:border-[#c3ccdc]"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
