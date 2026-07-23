"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { deleteFileBlobs, putFileBlob } from "@/lib/idb";
import { seedData } from "@/lib/seed";
import { loadData, loadUser, saveData, saveUser } from "@/lib/storage";
import { descendantIds, generateId, uniqueName } from "@/lib/tree";
import type { DataRoom, FileNode, FolderNode, NodeMap, User } from "@/lib/types";

export type View = "auth" | "home" | "browser";

interface UploadProgress {
  fileName: string;
  extraCount: number;
}

interface DataRoomStore {
  ready: boolean;
  user: User | null;
  view: View;
  rooms: DataRoom[];
  nodes: NodeMap;
  currentRoomId: string | null;
  currentFolderId: string | null;
  search: string;
  uploading: UploadProgress | null;
  uploadError: string | null;

  signIn: () => void;
  signOut: () => void;
  goHome: () => void;
  openRoom: (id: string) => void;
  openFolder: (id: string | null) => void;
  setSearch: (value: string) => void;

  createRoom: (name: string) => void;
  createFolder: (name: string) => void;
  renameNode: (id: string, name: string) => void;
  moveNode: (id: string, newParentId: string | null) => void;
  deleteNode: (id: string) => void;
  uploadFiles: (files: File[]) => void;
  dismissUploadError: () => void;
}

const StoreContext = createContext<DataRoomStore | null>(null);

const DEMO_USER: User = { name: "Jordan Ellis", email: "j.ellis@acmecorp.com" };

export function DataRoomProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("auth");
  const [rooms, setRooms] = useState<DataRoom[]>([]);
  const [nodes, setNodes] = useState<NodeMap>({});
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Refs mirror state that async upload callbacks need without going stale.
  const nodesRef = useRef(nodes);
  const locationRef = useRef({ roomId: currentRoomId, folderId: currentFolderId });
  useEffect(() => {
    nodesRef.current = nodes;
    locationRef.current = { roomId: currentRoomId, folderId: currentFolderId };
  }, [nodes, currentRoomId, currentFolderId]);

  // Hydrate from browser storage after mount (SSR renders nothing stateful).
  /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from
     localStorage, which only exists after mount. */
  useEffect(() => {
    const data = loadData() ?? seedData();
    const savedUser = loadUser();
    setRooms(data.rooms);
    setNodes(data.nodes);
    if (savedUser) {
      setUser(savedUser);
      setView("home");
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (ready) saveData({ rooms, nodes });
  }, [ready, rooms, nodes]);

  const signIn = useCallback(() => {
    setUser(DEMO_USER);
    saveUser(DEMO_USER);
    setView("home");
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    saveUser(null);
    setView("auth");
    setCurrentRoomId(null);
    setCurrentFolderId(null);
    setSearch("");
  }, []);

  const goHome = useCallback(() => {
    setView("home");
    setCurrentRoomId(null);
    setCurrentFolderId(null);
    setSearch("");
  }, []);

  const openRoom = useCallback((id: string) => {
    setView("browser");
    setCurrentRoomId(id);
    setCurrentFolderId(null);
    setSearch("");
  }, []);

  const openFolder = useCallback((id: string | null) => {
    setCurrentFolderId(id);
    setSearch("");
  }, []);

  const createRoom = useCallback((name: string) => {
    const room: DataRoom = { id: generateId(), name, createdAt: Date.now() };
    setRooms((prev) => [...prev, room]);
    openRoom(room.id);
  }, [openRoom]);

  const createFolder = useCallback((name: string) => {
    const { roomId, folderId } = locationRef.current;
    if (!roomId) return;
    setNodes((prev) => {
      const now = Date.now();
      const folder: FolderNode = {
        id: generateId(),
        type: "folder",
        name: uniqueName(prev, roomId, folderId, name),
        parentId: folderId,
        roomId,
        createdAt: now,
        updatedAt: now,
      };
      return { ...prev, [folder.id]: folder };
    });
  }, []);

  const renameNode = useCallback((id: string, name: string) => {
    setNodes((prev) => {
      const node = prev[id];
      if (!node) return prev;
      let finalName = name;
      if (node.type === "file" && !/\.pdf$/i.test(finalName)) finalName += ".pdf";
      finalName = uniqueName(prev, node.roomId, node.parentId, finalName, id);
      return { ...prev, [id]: { ...node, name: finalName, updatedAt: Date.now() } };
    });
  }, []);

  const moveNode = useCallback((id: string, newParentId: string | null) => {
    setNodes((prev) => {
      const node = prev[id];
      if (!node || node.parentId === newParentId) return prev;
      // A folder cannot be moved into itself or one of its descendants.
      if (
        node.type === "folder" &&
        newParentId &&
        descendantIds(prev, id).includes(newParentId)
      ) {
        return prev;
      }
      const name = uniqueName(prev, node.roomId, newParentId, node.name, id);
      return { ...prev, [id]: { ...node, parentId: newParentId, name, updatedAt: Date.now() } };
    });
  }, []);

  const deleteNode = useCallback((id: string) => {
    const ids = descendantIds(nodesRef.current, id);
    setNodes((prev) => {
      const next = { ...prev };
      ids.forEach((nodeId) => delete next[nodeId]);
      return next;
    });
    // If the folder being viewed was deleted, fall back to the room root.
    if (ids.includes(locationRef.current.folderId ?? "")) setCurrentFolderId(null);
    const fileIds = ids.filter((nodeId) => nodesRef.current[nodeId]?.type === "file");
    void deleteFileBlobs(fileIds).catch(() => {});
  }, []);

  const uploadFiles = useCallback((files: File[]) => {
    const { roomId, folderId } = locationRef.current;
    if (!roomId || files.length === 0) return;

    const isPdf = (f: File) =>
      f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    const accepted = files.filter(isPdf);
    const rejected = files.filter((f) => !isPdf(f));

    if (rejected.length > 0) {
      setUploadError(
        `Only PDF files are supported. Skipped: ${rejected.map((f) => f.name).join(", ")}`,
      );
    }
    if (accepted.length === 0) return;

    setUploading({ fileName: accepted[0].name, extraCount: accepted.length - 1 });

    void (async () => {
      for (const file of accepted) {
        const id = generateId();
        try {
          await putFileBlob(id, file);
        } catch {
          setUploadError(`Could not store "${file.name}" — browser storage may be full.`);
          continue;
        }
        setNodes((prev) => {
          const now = Date.now();
          const name = uniqueName(
            prev,
            roomId,
            folderId,
            /\.pdf$/i.test(file.name) ? file.name : `${file.name}.pdf`,
          );
          const node: FileNode = {
            id,
            type: "file",
            name,
            parentId: folderId,
            roomId,
            size: file.size,
            hasData: true,
            createdAt: now,
            updatedAt: now,
          };
          return { ...prev, [id]: node };
        });
      }
      // Keep the toast visible long enough to register.
      setTimeout(() => setUploading(null), 500);
    })();
  }, []);

  const dismissUploadError = useCallback(() => setUploadError(null), []);

  const value = useMemo<DataRoomStore>(
    () => ({
      ready,
      user,
      view,
      rooms,
      nodes,
      currentRoomId,
      currentFolderId,
      search,
      uploading,
      uploadError,
      signIn,
      signOut,
      goHome,
      openRoom,
      openFolder,
      setSearch,
      createRoom,
      createFolder,
      renameNode,
      moveNode,
      deleteNode,
      uploadFiles,
      dismissUploadError,
    }),
    [
      ready, user, view, rooms, nodes, currentRoomId, currentFolderId, search,
      uploading, uploadError, signIn, signOut, goHome, openRoom, openFolder,
      createRoom, createFolder, renameNode, moveNode, deleteNode, uploadFiles, dismissUploadError,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDataRoom(): DataRoomStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useDataRoom must be used inside DataRoomProvider");
  return store;
}
