import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout'

// Pages comunes
import Dashboard from '@/pages/Dashboard'
import Login     from '@/pages/Login'
import Register  from '@/pages/Register'

// Admin CRUD
import AdminMaterias     from '@/pages/admin/Materias'
import AdminGrupos       from '@/pages/admin/Grupos'
import AdminAlumnos      from '@/pages/admin/Alumnos'
import AdminEquipos      from '@/pages/admin/Equipos'
import AdminExposiciones from '@/pages/admin/Exposiciones'
import AdminCriterios    from '@/pages/admin/Criterios'
import AdminEvaluaciones from '@/pages/admin/Evaluaciones'

// Student views
import StudentMaterias     from '@/pages/student/Materias'
import StudentGrupos       from '@/pages/student/Grupos'
import StudentAlumnos      from '@/pages/student/Alumnos'
import StudentEquipos      from '@/pages/student/Equipos'
import StudentExposiciones from '@/pages/student/Exposiciones'
import StudentEvaluaciones from '@/pages/student/Evaluaciones'

// ── Guardias ──────────────────────────────────────────────────────
function PublicRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />
}
function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return user.rol === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />
}

// Muestra vista admin o alumno según rol
function RoleSwitch({ admin: A, student: S }: { admin: React.ReactNode; student: React.ReactNode }) {
  const rol = useAuthStore((s) => s.user?.rol)
  return rol === 'admin' ? <>{A}</> : <>{S}</>
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-rounded text-5xl text-white/15 block mb-4">construction</span>
      <h2 className="text-lg font-semibold text-white/50">{title}</h2>
      <p className="text-white/25 text-sm mt-1">Próximamente</p>
    </div>
  )
}

// Panel de admin acceso rápido
function AdminHome() {
  const LINKS = [
    { to: '/admin/materias',     label: 'Materias',     icon: 'menu_book',      c: '#6366f1' },
    { to: '/admin/grupos',       label: 'Grupos',       icon: 'groups',         c: '#8b5cf6' },
    { to: '/admin/alumnos',      label: 'Usuarios',     icon: 'person',         c: '#06b6d4' },
    { to: '/admin/equipos',      label: 'Equipos',      icon: 'diversity_3',    c: '#10b981' },
    { to: '/admin/exposiciones', label: 'Exposiciones', icon: 'present_to_all', c: '#f59e0b' },
    { to: '/criterios',          label: 'Criterios',    icon: 'checklist',      c: '#ec4899' },
    { to: '/admin/evaluaciones', label: 'Evaluaciones', icon: 'star',           c: '#ef4444' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Panel de Administración</h1>
        <p className="text-white/40 text-sm mt-0.5">Gestión completa del sistema</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {LINKS.map(({ to, label, icon, c }) => (
          <a key={to} href={to} className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${c}22`, boxShadow: `0 4px 12px ${c}33` }}>
              <span className="material-symbols-rounded text-[20px]" style={{ color: c, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <p className="font-semibold text-white/80 text-sm group-hover:text-white transition-colors">{label}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" theme="dark" />
      <Routes>
        {/* Públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Vistas con switcher admin/alumno */}
            <Route path="/materias"     element={<RoleSwitch admin={<AdminMaterias />}     student={<StudentMaterias />} />} />
            <Route path="/grupos"       element={<RoleSwitch admin={<AdminGrupos />}       student={<StudentGrupos />} />} />
            <Route path="/alumnos"      element={<RoleSwitch admin={<AdminAlumnos />}      student={<StudentAlumnos />} />} />
            <Route path="/equipos"      element={<RoleSwitch admin={<AdminEquipos />}      student={<StudentEquipos />} />} />
            <Route path="/exposiciones" element={<RoleSwitch admin={<AdminExposiciones />} student={<StudentExposiciones />} />} />
            <Route path="/evaluaciones" element={<RoleSwitch admin={<AdminEvaluaciones />} student={<StudentEvaluaciones />} />} />

            {/* Solo admin */}
            <Route element={<AdminRoute />}>
              <Route path="/criterios"          element={<AdminCriterios />} />
              <Route path="/admin"              element={<AdminHome />} />
              <Route path="/admin/materias"     element={<AdminMaterias />} />
              <Route path="/admin/grupos"       element={<AdminGrupos />} />
              <Route path="/admin/alumnos"      element={<AdminAlumnos />} />
              <Route path="/admin/equipos"      element={<AdminEquipos />} />
              <Route path="/admin/exposiciones" element={<AdminExposiciones />} />
              <Route path="/admin/evaluaciones" element={<AdminEvaluaciones />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
