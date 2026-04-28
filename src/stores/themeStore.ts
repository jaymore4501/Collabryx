import { create } from 'zustand'
import type { ThemeMode } from '@/types'

interface ThemeState {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme()
  return mode
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const stored = (typeof localStorage !== 'undefined'
  ? localStorage.getItem('collabryx-theme')
  : null) as ThemeMode | null

const initialMode: ThemeMode = stored || 'dark'
const initialResolved = resolveTheme(initialMode)

// Apply on load
if (typeof document !== 'undefined') {
  applyTheme(initialResolved)
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  resolved: initialResolved,
  setMode: (mode) => {
    const resolved = resolveTheme(mode)
    localStorage.setItem('collabryx-theme', mode)
    applyTheme(resolved)
    set({ mode, resolved })
  },
}))

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.mode === 'system') {
      const resolved = getSystemTheme()
      applyTheme(resolved)
      useThemeStore.setState({ resolved })
    }
  })
}
