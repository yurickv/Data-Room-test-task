# Acme Corp. Data Room

A virtual Data Room MVP for due-diligence: organized folders, PDF uploads, and an intuitive
Google-Drive-style browsing experience. Built as a single-page application with
**Next.js (App Router) / React / TypeScript / Tailwind CSS**.

## Features

- **Mock authentication** — sign in with a demo account (Google button or email form); the
  session survives reloads, sign-out returns to the auth screen.
- **Data Rooms** — create any number of top-level repositories, each with its own folder tree.
- **Folders** — create, rename, delete (cascade: all nested folders and files are removed),
  nest to any depth. The sidebar shows the full folder tree with the active folder highlighted.
- **Files** — upload PDFs (file picker or **drag & drop** into the folder area), view them
  inline in a full-screen viewer, rename, delete.
- **Move** — relocate any file or folder via "Move to…" in its row menu; a tree picker
  shows the whole room with invalid destinations disabled.
- **Search** — filters the whole current room by name (files and folders), with each result
  showing its folder path.
- **Persistence** — everything survives a page reload with no backend.
- **Responsive** — on small screens the sidebar becomes a slide-in drawer (hamburger in the
  top bar, auto-closes on navigation), table columns collapse into a meta line under each
  name, and action buttons shrink to icons.

### Edge cases handled

- **Duplicate names** are resolved case-insensitively per folder: `Report.pdf` →
  `Report (2).pdf` → `Report (3).pdf` (extension preserved).
- **Non-PDF uploads** are rejected with an explanatory toast; valid PDFs in the same batch
  still upload.
- **Renaming a file** keeps/forces the `.pdf` extension and re-checks name collisions
  (excluding the node itself, so renaming to the same name is a no-op, not `name (2)`).
- **Name validation** — empty names, over-long names, and slashes are rejected inline
  in the modal.
- **Move guards** — a folder can't be moved into itself or its own descendant (those
  targets are disabled in the picker, and the store re-checks); name collisions at the
  destination get the same ` (2)` suffix treatment.
- **Deleting the folder you're standing in** (found via search, deleted from the list)
  navigates back to the room root instead of stranding you on a dead id.
- **Empty states** — distinct UI for an empty folder vs. an empty search result.
- **Storage failures** — quota errors on write are caught; the app keeps working in memory.
- Modals close on `Escape`/backdrop click and confirm on `Enter`; menus close on outside click.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

No environment variables or backend required. The app seeds itself with a demo room
("Project Atlas — Acquisition") on first launch. Seed files carry metadata only, so the viewer
shows a placeholder for them — upload your own PDF to see full inline rendering.

## Design decisions

### Data model

```
DataRoom { id, name, createdAt }
TreeNode = FolderNode | FileNode
  { id, roomId, parentId, name, createdAt, updatedAt, type }
  FileNode adds { size, pages?, hasData? }
```

Nodes live in a **flat `id → node` map** with parent links (`parentId: string | null`),
not a nested tree:

- Rename/delete/move are O(1) lookups — no tree walking to find a node.
- Listing a folder, building the sidebar tree, and cascade-deleting are simple filters
  over the map — and React state updates stay shallow (`{ ...nodes, [id]: next }`).
- It mirrors how a relational backend would store this (a `nodes` table with a
  `parent_id` FK), so swapping the mock for a real API later is mechanical.

### Storage: localStorage + IndexedDB split

- **Metadata** (rooms, node tree) → `localStorage`: tiny, synchronous, trivial to hydrate.
- **PDF binaries** → `IndexedDB` (as `Blob`s, keyed by node id): localStorage caps out around
  5 MB *total* and stores only strings (base64 inflates files by ~33%). IndexedDB stores
  binary blobs natively with a far larger quota, so multi-megabyte uploads work.

The viewer streams the blob back through `URL.createObjectURL` (revoked on close), and
cascade-delete also purges the blobs of every removed file.

### State management

One React context (`DataRoomProvider`) owns the domain state (rooms, nodes, current
location, search) and exposes typed actions (`createFolder`, `renameNode`, `deleteNode`,
`uploadFiles`, …). Purely visual state — which row menu is open, which modal is showing —
stays in the components that own it. For an app this size a context beats Redux/Zustand on
simplicity, and the pure tree logic (`uniqueName`, `descendantIds`, `pathOf`, sorting) is
extracted into `src/lib/tree.ts` as dependency-free functions that are easy to unit-test.

### Component structure

```
src/
  app/            layout (fonts, metadata), page, global theme
  components/     AuthScreen, Sidebar, Topbar, HomeView, BrowserView,
                  ItemRow, PdfViewer, Toasts, modals/ (ModalShell, InputModal, DeleteModal)
  lib/            types, tree logic, formatting, seed data, storage adapters (localStorage, IndexedDB)
  store/          data-room-context (state + actions)
```

`InputModal` is one reusable component driving all three name flows (new room, new folder,
rename) — same validation, same keyboard handling. `ModalShell` centralizes backdrop,
escape handling, and a11y attributes.

### UX details

- Folders sort before files, then alphabetically (case-insensitive) — matching every major
  file manager.
- Search shows each hit's folder path so results are actionable, and clears when you
  navigate — stale filters never hide content silently.
- Delete confirmation states exactly how many nested items will be removed.
- Upload shows a progress toast; rejected files show a separate dismissible error toast.
- Only implemented features are visible: no dead buttons or placeholder menus.

## Limitations / next steps

- Storage is per-browser (mocked backend by design). The storage adapters in `src/lib` are
  the seam where a real API + blob storage (e.g. S3 presigned uploads) would plug in.
- Auth is a demo stub; a real deployment would use NextAuth/Clerk with room-level ACLs.
- Search matches names only; content search would need server-side text extraction.
- Moving is menu-driven ("Move to…" + tree picker); drag-and-drop moving would layer on
  top of the same `moveNode` action as a progressive enhancement.
