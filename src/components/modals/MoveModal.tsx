"use client";

import { useMemo, useState } from "react";
import { descendantIds, flattenFolderTree } from "@/lib/tree";
import type { NodeMap, TreeNode } from "@/lib/types";
import { FolderIcon, HomeIcon } from "../icons";
import { ModalShell } from "./ModalShell";

interface MoveModalProps {
  node: TreeNode;
  nodes: NodeMap;
  roomName: string;
  onConfirm: (newParentId: string | null) => void;
  onClose: () => void;
}

/**
 * Folder picker for "Move to…". Invalid destinations — the node itself, its
 * descendants (for folders), and its current parent — are shown but disabled.
 */
export function MoveModal({ node, nodes, roomName, onConfirm, onClose }: MoveModalProps) {
  // `undefined` = nothing picked yet; `null` = room root picked.
  const [selected, setSelected] = useState<string | null | undefined>(undefined);

  const tree = useMemo(() => flattenFolderTree(nodes, node.roomId), [nodes, node.roomId]);
  const blockedIds = useMemo(
    () => new Set(node.type === "folder" ? descendantIds(nodes, node.id) : [node.id]),
    [nodes, node],
  );

  const isDisabled = (targetId: string | null) =>
    (targetId !== null && blockedIds.has(targetId)) || targetId === node.parentId;

  const options: Array<{ id: string | null; name: string; depth: number }> = [
    { id: null, name: roomName, depth: 0 },
    ...tree.map(({ folder, depth }) => ({ id: folder.id, name: folder.name, depth: depth + 1 })),
  ];

  return (
    <ModalShell onClose={onClose}>
      <h3 className="text-lg font-semibold tracking-tight">
        Move &ldquo;{node.name}&rdquo;
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-normal text-slate-500">
        Choose a destination folder. The current location is greyed out.
      </p>

      <div className="dr-scroll mt-4.5 max-h-[300px] overflow-y-auto rounded-[10px] border border-line-input bg-[#fbfcfe] p-1.5">
        {options.map(({ id, name, depth }) => {
          const disabled = isDisabled(id);
          const active = selected === id;
          return (
            <button
              key={id ?? "root"}
              disabled={disabled}
              onClick={() => setSelected(id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : disabled
                    ? "cursor-not-allowed text-slate-300"
                    : "cursor-pointer text-slate-700 hover:bg-white"
              }`}
              style={{ paddingLeft: 10 + depth * 18 }}
            >
              {id === null ? (
                <HomeIcon size={15} className="shrink-0" />
              ) : (
                <FolderIcon size={15} className="shrink-0" />
              )}
              <span className="truncate">{name}</span>
              {id === node.parentId && (
                <span className="ml-auto shrink-0 text-[11px] font-normal text-slate-400">
                  Current location
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-[42px] cursor-pointer rounded-[10px] border border-[#e2e7f0] bg-white px-4.5 text-sm font-semibold text-slate-600 hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          disabled={selected === undefined}
          onClick={() => selected !== undefined && onConfirm(selected)}
          className="h-[42px] rounded-[10px] bg-accent px-5 text-sm font-semibold text-white transition-colors enabled:cursor-pointer enabled:hover:bg-accent-dark disabled:opacity-40"
        >
          Move here
        </button>
      </div>
    </ModalShell>
  );
}
