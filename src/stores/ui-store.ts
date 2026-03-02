import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
