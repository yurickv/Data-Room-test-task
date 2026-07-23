import type { PersistedData, User } from "./types";

const DATA_KEY = "acme_dataroom_v1";
const USER_KEY = "acme_dataroom_user_v1";

/** localStorage holds metadata only; PDF binaries live in IndexedDB (see idb.ts). */
export function loadData(): PersistedData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedData;
    if (!parsed.rooms || !parsed.nodes) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveData(data: PersistedData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or storage unavailable — the app keeps working in memory.
  }
}

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore — sign-in simply won't survive a reload.
  }
}
