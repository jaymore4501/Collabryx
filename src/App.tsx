import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useThemeStore } from '@/stores/themeStore'
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import BoardPage from '@/pages/BoardPage'

export default function App() {
  const resolved = useThemeStore((s) => s.resolved)

  return (
    <div className="noise-overlay min-h-screen">
      <Toaster
        position="bottom-right"
        theme={resolved}
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/board/:id" element={<BoardPage />} />
      </Routes>
    </div>
  )
}
