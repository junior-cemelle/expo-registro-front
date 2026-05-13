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

function NavLinks({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation()
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')
  const { user } = useAuthStore()
  const isAdmin = user?.rol === 'admin'

  return (
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
  )
}

function UserFooter({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const initials = user ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase() : '?'

  const handleLogout = () => {
    logout()
    onClose?.()
    navigate('/login', { replace: true })
  }

  return (
    <div className="border-t border-white/[0.07] p-4 flex-shrink-0">
      <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/[0.04]">
        <Avatar.Root className="h-9 w-9 overflow-hidden rounded-full flex-shrink-0">
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
  )
}

const PANEL_STYLE = {
  background:           'rgba(6, 10, 24, 0.97)',
  backdropFilter:       'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRight:          '1px solid rgba(255,255,255,0.08)',
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Desktop: always-visible persistent sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-30" style={PANEL_STYLE}>
        {/* Desktop top spacer — aligns with navbar height */}
        <div className="h-16 border-b border-white/[0.07] flex items-center px-5 flex-shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/20">Menú</p>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>

      {/* ── Mobile: slide-in overlay ── */}
      <aside
        className={[
          'lg:hidden fixed left-0 top-0 z-50 h-full w-72 flex flex-col',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={PANEL_STYLE}
      >
        {/* Mobile header — app name + close button */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.07] flex-shrink-0">
          <span className="text-[15px] font-semibold text-white tracking-tight">
            Expo<span className="text-brand-400">Registro</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>
        <NavLinks onClose={onClose} />
        <UserFooter onClose={onClose} />
      </aside>
    </>
  )
}
