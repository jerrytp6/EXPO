import { create } from "zustand";

let counter = 0;

export const useToast = create((set, get) => ({
  toasts: [],
  push: (message, type = "success") => {
    const id = ++counter;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3500);
  },
  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (msg) => useToast.getState().push(msg, "success"),
  error: (msg) => useToast.getState().push(msg, "error"),
  info: (msg) => useToast.getState().push(msg, "info"),
};
