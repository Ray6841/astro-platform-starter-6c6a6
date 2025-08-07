import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF'
export type User = { id: string; email: string; role: Role }

type State = {
  token: string | null
  user: User | null
}

type Actions = {
  login: (payload: { token: string; user: User }) => void
  logout: () => void
}

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'wms_auth' }
  )
)