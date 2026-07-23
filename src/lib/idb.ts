/**
 * Minimal promise wrapper around IndexedDB for storing PDF blobs keyed by
 * node id. Blobs are kept out of localStorage so multi-megabyte uploads
 * don't blow the ~5 MB localStorage quota.
 */

const DB_NAME = "acme_dataroom_files";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export function putFileBlob(id: string, blob: Blob): Promise<IDBValidKey> {
  return withStore("readwrite", (s) => s.put(blob, id));
}

export function getFileBlob(id: string): Promise<Blob | undefined> {
  return withStore("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
}

export async function deleteFileBlobs(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
