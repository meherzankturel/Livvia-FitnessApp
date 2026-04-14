import { create } from "zustand";

export interface AuthState {
  session: { user: { id: string; email: string } } | null;
  loading: boolean;
  setSession: (session: AuthState["session"]) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session, loading: false }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ session: null, loading: false }),
}));
