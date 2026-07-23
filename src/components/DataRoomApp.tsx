"use client";

import { useRef, useState } from "react";
import { descendantIds } from "@/lib/tree";
import type { FileNode } from "@/lib/types";
import { useDataRoom } from "@/store/data-room-context";
import { AuthScreen } from "./AuthScreen";
import { BrowserView } from "./BrowserView";
import { HomeView } from "./HomeView";
import { PdfViewer } from "./PdfViewer";
import { Sidebar } from "./Sidebar";
import { UploadErrorToast, UploadToast } from "./Toasts";
import { Topbar } from "./Topbar";
import { DeleteModal } from "./modals/DeleteModal";
import { InputModal } from "./modals/InputModal";
import { MoveModal } from "./modals/MoveModal";

type ModalState =
  | { kind: "newRoom" }
  | { kind: "newFolder" }
  | { kind: "rename"; nodeId: string }
  | { kind: "move"; nodeId: string }
  | { kind: "delete"; nodeId: string }
  | null;

export function DataRoomApp() {
  const store = useDataRoom();
  const {
    ready,
    view,
    rooms,
    nodes,
    currentRoomId,
    createRoom,
    createFolder,
    renameNode,
    moveNode,
    deleteNode,
    uploadFiles,
  } = store;

  const [modal, setModal] = useState<ModalState>(null);
  const [openedFile, setOpenedFile] = useState<FileNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!ready) {
    return <div className="h-screen w-full bg-canvas" />;
  }

  if (view === "auth") {
    return (
      <div className="h-screen min-h-[640px] w-full overflow-hidden">
        <AuthScreen />
      </div>
    );
  }

  const closeModal = () => setModal(null);
  const renameTarget = modal?.kind === "rename" ? nodes[modal.nodeId] : null;
  const moveTarget = modal?.kind === "move" ? nodes[modal.nodeId] : null;
  const deleteTarget = modal?.kind === "delete" ? nodes[modal.nodeId] : null;
  const deleteDescription = (() => {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "folder") {
      const inside = descendantIds(nodes, deleteTarget.id).length - 1;
      return `“${deleteTarget.name}” and its ${inside} nested item${
        inside === 1 ? "" : "s"
      } will be permanently deleted. This cannot be undone.`;
    }
    return `“${deleteTarget.name}” will be permanently deleted. This cannot be undone.`;
  })();

  return (
    <div className="grid h-screen min-h-[640px] w-full grid-cols-[270px_1fr] bg-canvas">
      <Sidebar />

      <main className="relative flex flex-col overflow-hidden">
        <Topbar onUploadClick={() => fileInputRef.current?.click()} />

        {view === "home" && <HomeView onNewRoom={() => setModal({ kind: "newRoom" })} />}
        {view === "browser" && (
          <BrowserView
            onNewFolder={() => setModal({ kind: "newFolder" })}
            onUploadClick={() => fileInputRef.current?.click()}
            onRename={(nodeId) => setModal({ kind: "rename", nodeId })}
            onMove={(nodeId) => setModal({ kind: "move", nodeId })}
            onDelete={(nodeId) => setModal({ kind: "delete", nodeId })}
            onOpenFile={setOpenedFile}
          />
        )}

        <UploadToast />
        <UploadErrorToast />
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          uploadFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {modal?.kind === "newRoom" && (
        <InputModal
          title="Create Data Room"
          description="Name the top-level repository for this transaction."
          placeholder="e.g. Project Titan — Acquisition"
          confirmLabel="Create"
          onConfirm={(name) => {
            createRoom(name);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === "newFolder" && (
        <InputModal
          title="New Folder"
          description="Create a folder in the current location to organize documents."
          placeholder="Folder name"
          confirmLabel="Create"
          onConfirm={(name) => {
            createFolder(name);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {renameTarget && (
        <InputModal
          title={`Rename ${renameTarget.type === "folder" ? "folder" : "file"}`}
          description="Enter a new name."
          placeholder="New name"
          confirmLabel="Save"
          initialValue={renameTarget.name}
          onConfirm={(name) => {
            renameNode(renameTarget.id, name);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {moveTarget && (
        <MoveModal
          node={moveTarget}
          nodes={nodes}
          roomName={rooms.find((r) => r.id === currentRoomId)?.name ?? "Data Room"}
          onConfirm={(newParentId) => {
            moveNode(moveTarget.id, newParentId);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          kind={deleteTarget.type}
          description={deleteDescription}
          onConfirm={() => {
            deleteNode(deleteTarget.id);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {openedFile && <PdfViewer file={openedFile} onClose={() => setOpenedFile(null)} />}
    </div>
  );
}
