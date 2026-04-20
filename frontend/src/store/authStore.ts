import { create } from 'zustand'

interface AuthState {
  token: string | null

  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // On page refresh, read token from localStorage so user stays logged in
  token: localStorage.getItem('access_token'),

  setToken: (token) => {
    localStorage.setItem('access_token', token)  // persist across page refreshes
    set({ token })
  },

  logout: () => {
    localStorage.removeItem('access_token')  // clear from storage
    set({ token: null })
  },
}))
