import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout'
import Login     from '@/pages/Login'
import Register  from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'

// Redirige al dashboard si ya está autenticado
function PublicRoute() {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// Redirige al login si no está autenticado
function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-rounded text-6xl text-white/20 mb-4">construction</span>
      <h2 className="text-xl font-semibold text-white/60">{title}</h2>
      <p className="text-white/30 text-sm mt-2">Esta sección se desarrollará próximamente</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" theme="dark" />
      <Routes>
        {/* Rutas públicas (redirigen al dashboard si ya hay sesión) */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/materias"     element={<Placeholder title="Materias" />} />
            <Route path="/grupos"       element={<Placeholder title="Grupos" />} />
            <Route path="/alumnos"      element={<Placeholder title="Alumnos" />} />
            <Route path="/equipos"      element={<Placeholder title="Equipos" />} />
            <Route path="/exposiciones" element={<Placeholder title="Exposiciones" />} />
            <Route path="/evaluaciones" element={<Placeholder title="Evaluaciones" />} />
            {/* Admin only */}
            <Route path="/criterios"    element={<Placeholder title="Criterios" />} />
            <Route path="/admin"        element={<Placeholder title="Panel de Administración" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
