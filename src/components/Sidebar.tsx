import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as Avatar from '@radix-ui/react-avatar'
import { useAuthStore } from '@/stores/auth'
import Icon from './Icon'

const NAV_BASE = [
  { to: '/dashboard',    label: 'Dashboard',    icon: 'dashboard'      },
  { to: '/materias',     label: 'Materias',     icon: 'menu_book'      },
  { to: '/grupos',       label: 'Grupos',       icon: 'groups'         },
  { to: '/alumnos',      label: 'Alumnos',      icon: 'person'         },
  { to: '/equipos',      label: 'Equipos',      icon: 'diversity_3'    },
  { to: '/exposiciones', label: 'Exposiciones', icon: 'present_to_all' },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: 'star'           },
]

const NAV_ADMIN = [
  { to: '/criterios', label: 'Criterios',    icon: 'checklist'            },
  { to: '/admin',     label: 'Administrar',  icon: 'admin_panel_settings' },
]

const ROL_LABEL: Record<string, string> = { admin: 'Administrador', docente: 'Docente', alumno: 'Alumno' }
const ROL_COLOR: Record<string, string> = {
  admin:   'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  docente: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  alumno:  'bg-slate-500/20  text-slate-300  border border-slate-500/30',
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { pathname }     = useLocation()
  const navigate         = useNavigate()
  const isAdmin          = user?.rol === 'admin'
  const initials         = user ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase() : '?'

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="sb-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 z-50 h-full w-72 flex flex-col lg:hidden"
            style={{
              background:           'rgba(6, 10, 24, 0.96)',
              backdropFilter:       'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight:          '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.07] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/40">
                  <Icon name="school" className="text-white text-[18px]" filled />
                </div>
                <span className="text-[15px] font-semibold text-white tracking-tight">
                  Expo<span className="text-brand-400">Registro</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <Icon name="close" className="text-[22px]" />
              </button>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                Navegación
              </p>

              {NAV_BASE.map(({ to, label, icon }) => {
                const active = isActive(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={[
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-brand-600/20 text-brand-300'
                        : 'text-white/55 hover:bg-white/[0.06] hover:text-white',
                    ].join(' ')}
                  >
                    <Icon name={icon} className="text-[20px] flex-shrink-0" filled={active} />
                    {label}
                  </Link>
                )
              })}

              {/* Admin section */}
              {isAdmin && (
                <>
                  <div className="pt-5 pb-2">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-violet-400/50">
                      Administración
                    </p>
                  </div>
                  {NAV_ADMIN.map(({ to, label, icon }) => {
                    const active = isActive(to)
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={[
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                          active
                            ? 'bg-violet-600/20 text-violet-300'
                            : 'text-white/55 hover:bg-violet-500/[0.07] hover:text-violet-300',
                        ].join(' ')}
                      >
                        <Icon name={icon} className="text-[20px] flex-shrink-0" filled={active} />
                        {label}
                      </Link>
                    )
                  })}
                </>
              )}
            </nav>

            {/* ── User footer ── */}
            <div className="border-t border-white/[0.07] p-4 flex-shrink-0">
              <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/[0.04]">
                <Avatar.Root className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
                  <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {initials}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {user ? `${user.nombre} ${user.apellido}` : '—'}
                  </p>
                  <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
                  {user?.rol && (
                    <span className={`mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROL_COLOR[user.rol]}`}>
                      {ROL_LABEL[user.rol]}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Icon name="logout" className="text-[20px]" />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
