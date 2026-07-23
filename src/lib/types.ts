/** A top-level repository (the "drive" of the app). */
export interface DataRoom {
  id: string;
  name: string;
  createdAt: number;
}

interface BaseNode {
  id: string;
  roomId: string;
  /** `null` means the node sits at the root of its room. */
  parentId: string | null;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface FolderNode extends BaseNode {
  type: "folder";
}

export interface FileNode extends BaseNode {
  type: "file";
  /** Size in bytes. */
  size: number;
  pages?: number;
  /** True when the PDF binary is stored in IndexedDB (seed files have none). */
  hasData?: boolean;
}

export type TreeNode = FolderNode | FileNode;

/** Flat id → node map. Parent/child relations live on `parentId`. */
export type NodeMap = Record<string, TreeNode>;

export interface User {
  name: string;
  email: string;
}

export interface PersistedData {
  rooms: DataRoom[];
  nodes: NodeMap;
}
