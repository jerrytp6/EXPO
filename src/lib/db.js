// LocalStorage-based mock database
import { SEED } from "./seed";

const KEY = "exhibition-os.db.v8";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return structuredClone(SEED);
    }
    return JSON.parse(raw);
  } catch {
    return structuredClone(SEED);
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const db = {
  reset() {
    localStorage.removeItem(KEY);
    return load();
  },
  read() {
    return load();
  },
  write(updater) {
    const data = load();
    const next = updater(data) || data;
    save(next);
    return next;
  },
};

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
