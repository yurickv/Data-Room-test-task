import type { FolderNode, NodeMap, TreeNode } from "./types";

export interface FolderTreeEntry {
  folder: FolderNode;
  depth: number;
}

/** Depth-first list of a room's folders, for tree-shaped UI (sidebar, move picker). */
export function flattenFolderTree(
  nodes: NodeMap,
  roomId: string,
  parentId: string | null = null,
  depth = 0,
): FolderTreeEntry[] {
  return Object.values(nodes)
    .filter(
      (n): n is FolderNode =>
        n.type === "folder" && n.roomId === roomId && n.parentId === parentId,
    )
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .flatMap((folder) => [
      { folder, depth },
      ...flattenFolderTree(nodes, roomId, folder.id, depth + 1),
    ]);
}

/** Folders first, then alphabetical — the canonical listing order. */
export function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) =>
    a.type !== b.type
      ? a.type === "folder"
        ? -1
        : 1
      : a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function childrenOf(nodes: NodeMap, roomId: string, parentId: string | null): TreeNode[] {
  return sortNodes(
    Object.values(nodes).filter((n) => n.roomId === roomId && n.parentId === parentId),
  );
}

/** The node itself plus every nested descendant (used for cascade delete). */
export function descendantIds(nodes: NodeMap, id: string): string[] {
  const out = [id];
  for (const node of Object.values(nodes)) {
    if (node.parentId === id) out.push(...descendantIds(nodes, node.id));
  }
  return out;
}

/** Folder names from the room root down to `parentId`, for search result paths. */
export function pathOf(nodes: NodeMap, parentId: string | null): string[] {
  const names: string[] = [];
  let cursor = parentId;
  while (cursor) {
    const node = nodes[cursor];
    if (!node) break;
    names.unshift(node.name);
    cursor = node.parentId;
  }
  return names;
}

/**
 * Resolve duplicate names among siblings, case-insensitively:
 * "Report.pdf" → "Report (2).pdf" → "Report (3).pdf" …
 * `excludeId` skips the node being renamed so it never collides with itself.
 */
export function uniqueName(
  nodes: NodeMap,
  roomId: string,
  parentId: string | null,
  name: string,
  excludeId?: string,
): string {
  const siblings = new Set(
    Object.values(nodes)
      .filter((n) => n.roomId === roomId && n.parentId === parentId && n.id !== excludeId)
      .map((n) => n.name.toLowerCase()),
  );
  if (!siblings.has(name.toLowerCase())) return name;

  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 2;
  while (siblings.has(`${base} (${i})${ext}`.toLowerCase())) i++;
  return `${base} (${i})${ext}`;
}

/** Reserved characters that break paths/UX; keep validation light but explicit. */
export function validateName(raw: string): string | null {
  const name = raw.trim();
  if (!name) return "Please enter a name.";
  if (name.length > 120) return "Name is too long (max 120 characters).";
  if (/[/\\]/.test(name)) return "Name cannot contain slashes.";
  return null;
}

export function generateId(): string {
  return `n_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
