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

  // SSO token 登入（Portal → EX 跳轉後的接收點）
  // Mock 版：token 為 base64(JSON) 格式，解出 subsystemUserId 對應本地 user
  // 正式版：需串 Portal 驗 token API 或 JWT 驗章
  loginBySsoToken: (token) => {
    try {
      const payload = JSON.parse(atob(token));
      // payload: { portalUserId, username, role, companyId, tenantId, subsystemUserId, iat }
      const data = db.read();
      // 優先用 subsystemUserId 對應本地 user id；退而用 email
      const user = data.users.find((u) => u.id === payload.subsystemUserId)
                || data.users.find((u) => u.email?.toLowerCase() === payload.username?.toLowerCase());
      if (!user) return { ok: false, error: "使用者不存在於 EX 系統" };
      // tenant guard：確認租戶一致（super-admin 可跨）
      if (user.role !== "super-admin" && user.companyId !== payload.companyId) {
        return { ok: false, error: "租戶身份不符" };
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ user });
      return { ok: true, user };
    } catch (err) {
      return { ok: false, error: "Token 格式錯誤" };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ user: null });
  },
}));

export const ROLE_NAMES = {
  "portal-admin": "Portal 超級管理員",
  "super-admin":  "EX 系統維運",
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
