import { create } from "zustand";
import { db } from "../lib/db";

const AUTH_KEY = "exhibition-os.auth.v1";

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export const useAuth = create((set) => ({
  user: loadAuth(),

  loginAs: (userId) => {
    const data = db.read();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return false;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    set({ user });
    return true;
  },

  loginByEmail: (email) => {
    const data = db.read();
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    set({ user });
    return true;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ user: null });
  },
}));

export const ROLE_NAMES = {
  "super-admin": "超級管理員",
  "company-admin": "公司管理者",
  "event-manager": "活動管理者",
  member: "公司成員",
};

export const ROLE_HOME = {
  "super-admin": "/admin",
  "company-admin": "/company",
  "event-manager": "/event",
  member: "/company",
};
