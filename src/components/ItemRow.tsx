"use client";

import { useEffect, useRef } from "react";
import { formatDate, formatSize, pluralize } from "@/lib/format";
import type { TreeNode } from "@/lib/types";
import {
  DotsIcon,
  EyeIcon,
  FolderIcon,
  MoveIcon,
  PdfFileIcon,
  PencilIcon,
  TrashIcon,
} from "./icons";

interface ItemRowProps {
  node: TreeNode;
  /** Number of direct children (folders only). */
  childCount: number;
  /** Breadcrumb-style location, shown during search. */
  pathLabel?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function ItemRow({
  node,
  childCount,
  pathLabel,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onOpen,
  onRename,
  onMove,
  onDelete,
}: ItemRowProps) {
  const isFolder = node.type === "folder";
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onCloseMenu();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen, onCloseMenu]);

  return (
    <div
      onClick={onOpen}
      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_84px_96px_118px_40px] items-center gap-2.5 rounded-[9px] border-b border-[#f1f4f9] px-3.5 py-3 transition-colors hover:bg-white"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${
            isFolder ? "bg-accent-soft text-accent" : "bg-red-50 text-red-600"
          }`}
        >
          {isFolder ? <FolderIcon size={19} /> : <PdfFileIcon size={18} />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-800">{node.name}</div>
          {pathLabel && (
            <div className="mt-0.5 truncate text-[11.5px] text-slate-400">{pathLabel}</div>
          )}
        </div>
      </div>
      <span className="text-[13px] text-slate-500">{isFolder ? "Folder" : "PDF"}</span>
      <span className="text-[13px] text-slate-500">
        {isFolder ? pluralize(childCount, "item") : formatSize(node.size)}
      </span>
      <span className="text-[13px] text-slate-500">{formatDate(node.updatedAt)}</span>

      <div ref={menuRef} className="relative flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu();
          }}
          aria-label={`Actions for ${node.name}`}
          className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] text-slate-400 transition-colors hover:bg-line-soft hover:text-slate-600"
        >
          <DotsIcon size={17} />
        </button>
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-[34px] right-0 z-30 w-[172px] animate-pop-in rounded-[11px] border border-line bg-white p-1 shadow-[0_20px_42px_-20px_rgba(15,23,42,.42)]"
          >
            <MenuButton onClick={onOpen} icon={isFolder ? <FolderIcon size={15} /> : <EyeIcon size={15} />}>
              Open
            </MenuButton>
            <MenuButton onClick={onRename} icon={<PencilIcon size={15} />}>
              Rename
            </MenuButton>
            <MenuButton onClick={onMove} icon={<MoveIcon size={15} />}>
              Move to…
            </MenuButton>
            <MenuButton onClick={onDelete} icon={<TrashIcon size={15} />} danger>
              Delete
            </MenuButton>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuButton({
  onClick,
  icon,
  danger,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-2 text-left text-[13px] font-medium ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-canvas"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
