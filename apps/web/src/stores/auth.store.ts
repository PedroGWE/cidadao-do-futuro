import { create } from 'zustand'

export interface AuthUser {
  id: string
  name: string
  email: string
  tenantId: string
}

interface AuthState {
  user: AuthUser | null
  tenantSlug: string | null
  setAuth: (user: AuthUser, tenantSlug: string) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantSlug: null,
  setAuth: (user, tenantSlug) => set({ user, tenantSlug }),
  clear: () => set({ user: null, tenantSlug: null }),
}))
