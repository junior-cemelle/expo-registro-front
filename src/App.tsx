import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout'

// Pages
import Login    from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'

// Admin CRUD pages
import AdminMaterias     from '@/pages/admin/Materias'
import AdminGrupos       from '@/pages/admin/Grupos'
import AdminAlumnos      from '@/pages/admin/Alumnos'
import AdminEquipos      from '@/pages/admin/Equipos'
import AdminExposiciones from '@/pages/admin/Exposiciones'
import AdminCriterios    from '@/pages/admin/Criterios'
import AdminEvaluaciones from '@/pages/admin/Evaluaciones'

// ── Guardias ──────────────────────────────────────────────────────
function PublicRoute() {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// ── Placeholder para páginas aún no implementadas ─────────────────
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-rounded text-6xl text-white/15 block mb-4">construction</span>
      <h2 className="text-lg font-semibold text-white/50">{title}</h2>
      <p className="text-white/25 text-sm mt-1">Esta sección estará disponible próximamente</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" theme="dark" />
      <Routes>

        {/* Rutas públicas (redirigen al dashboard si hay sesión activa) */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rutas protegidas (requieren sesión) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Vistas compartidas — el componente decide qué mostrar según rol */}
            <Route path="/materias"     element={<Placeholder title="Materias — Vista alumno/docente" />} />
            <Route path="/grupos"       element={<Placeholder title="Grupos" />} />
            <Route path="/alumnos"      element={<Placeholder title="Alumnos" />} />
            <Route path="/equipos"      element={<Placeholder title="Equipos" />} />
            <Route path="/exposiciones" element={<Placeholder title="Exposiciones" />} />
            <Route path="/evaluaciones" element={<Placeholder title="Evaluaciones" />} />

            {/* Rutas exclusivas de administrador */}
            <Route element={<AdminRoute />}>
              <Route path="/criterios"         element={<AdminCriterios />} />
              <Route path="/admin"             element={<AdminDashboard />} />
              <Route path="/admin/materias"    element={<AdminMaterias />} />
              <Route path="/admin/grupos"      element={<AdminGrupos />} />
              <Route path="/admin/alumnos"     element={<AdminAlumnos />} />
              <Route path="/admin/equipos"     element={<AdminEquipos />} />
              <Route path="/admin/exposiciones"element={<AdminExposiciones />} />
              <Route path="/admin/evaluaciones"element={<AdminEvaluaciones />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Panel de administración — acceso rápido a todos los CRUDs
function AdminDashboard() {
  const SECTIONS = [
    { to: '/admin/materias',     label: 'Materias',     icon: 'menu_book',      color: '#6366f1', desc: 'Catálogo de materias' },
    { to: '/admin/grupos',       label: 'Grupos',       icon: 'groups',         color: '#8b5cf6', desc: 'Grupos por ciclo'     },
    { to: '/admin/alumnos',      label: 'Usuarios',     icon: 'person',         color: '#06b6d4', desc: 'Alumnos y docentes'   },
    { to: '/admin/equipos',      label: 'Equipos',      icon: 'diversity_3',    color: '#10b981', desc: 'Equipos de trabajo'   },
    { to: '/admin/exposiciones', label: 'Exposiciones', icon: 'present_to_all', color: '#f59e0b', desc: 'Temas y fechas'       },
    { to: '/criterios',          label: 'Criterios',    icon: 'checklist',      color: '#ec4899', desc: 'Rúbrica'              },
    { to: '/admin/evaluaciones', label: 'Evaluaciones', icon: 'star',           color: '#ef4444', desc: 'Registros'            },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Panel de Administración</h1>
        <p className="text-white/40 text-sm mt-0.5">Gestión completa de todas las entidades del sistema</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SECTIONS.map(({ to, label, icon, color, desc }) => (
          <a key={to} href={to}
            className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${color}20`, boxShadow: `0 4px 12px ${color}30` }}>
              <span className="material-symbols-rounded text-[20px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">{label}</h3>
            <p className="text-white/35 text-[12px] mt-1">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
