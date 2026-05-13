import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/api'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user:  null,
      setAuth: (token, user) => {
        document.cookie = `auth-token=${token}; path=/; max-age=86400; samesite=lax`
        set({ token, user })
      },
      setUser: (user) => set({ user }),
      logout: () => {
        document.cookie = 'auth-token=; path=/; max-age=0'
        set({ token: null, user: null })
      },
    }),
    { name: 'auth-storage' },
  ),
)
