import { create } from "zustand";
import { api, setToken, clearToken, getToken } from "../lib/api";

const USER_KEY = "ex.user";

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function saveUser(u) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

export const useAuth = create((set, get) => ({
  user: loadUser(),
  loading: false,
  error: null,

  // 真實登入：POST /auth/login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const r = await api.post("/auth/login", { email, password });
      setToken(r.token);
      saveUser(r.user);
      set({ user: r.user, loading: false });
      return { ok: true, user: r.user };
    } catch (err) {
      set({ loading: false, error: err.body?.error || err.message });
      return { ok: false, error: err.body?.error || err.message };
    }
  },

  // 業主 Portal SSO 接收：B4 階段串接，目前 stub
  loginBySsoToken: async (portalToken) => {
    set({ loading: true, error: null });
    try {
      const r = await api.post("/auth/sso", { token: portalToken });
      setToken(r.token);
      saveUser(r.user);
      set({ user: r.user, loading: false });
      return { ok: true, user: r.user };
    } catch (err) {
      set({ loading: false, error: err.body?.error || err.message });
      return { ok: false, error: err.body?.error || err.message };
    }
  },

  // 從 server 重新拉自己資料（refresh）
  refresh: async () => {
    if (!getToken()) return null;
    try {
      const u = await api.get("/auth/me");
      saveUser(u);
      set({ user: u });
      return u;
    } catch {
      // 401 已被 api 清 token
      saveUser(null);
      set({ user: null });
      return null;
    }
  },

  logout: () => {
    clearToken();
    saveUser(null);
    set({ user: null, error: null });
  },
}));

export const ROLE_NAMES = {
  "portal-admin":  "Portal 超級管理員",
  "super-admin":   "EX 系統維運",
  "company-admin": "租戶管理員",
  "event-manager": "活動管理員",
  member:          "租戶成員",
};

export const ROLE_HOME = {
  "portal-admin":  "/portal/admin",
  "super-admin":   "/admin",
  "company-admin": "/company",
  "event-manager": "/event",
  member:          "/company",
};
