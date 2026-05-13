import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Avatar from '@radix-ui/react-avatar'
import { useAuthStore } from '@/stores/auth'
import Icon from './Icon'

const ROL_LABEL: Record<string, string> = { admin: 'Administrador', docente: 'Docente', alumno: 'Alumno' }
const ROL_COLOR: Record<string, string> = {
  admin:   'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  docente: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  alumno:  'bg-slate-500/20  text-slate-300  border border-slate-500/30',
}

interface NavbarProps {
  onMenuOpen: () => void
}

export default function Navbar({ onMenuOpen }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const initials         = user ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase() : '?'

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'auth-storage' && !e.newValue) navigate('/login', { replace: true })
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [navigate])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <header className="sticky top-0 z-30 glass-dark border-b border-white/[0.07]">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden flex-shrink-0 rounded-xl p-2 text-white/50 hover:bg-white/[0.08] hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <Icon name="menu" className="text-[24px]" />
        </button>

        {/* Logo — visible on all screen sizes */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
          <img
            src="/resources/logo_lince.png"
            alt="Lince"
            className="h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(99,102,241,0.4)]"
          />
          <span className="text-[15px] font-semibold tracking-tight text-white hidden sm:block">
            Expo<span className="text-brand-400">Registro</span>
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Profile dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.07] focus:outline-none"
              aria-label="Perfil de usuario"
            >
              <Avatar.Root className="h-8 w-8 overflow-hidden rounded-full">
                <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[13px] font-medium text-white">
                  {user ? `${user.nombre} ${user.apellido}` : '—'}
                </span>
                <span className="text-[11px] text-white/40 mt-0.5">{user?.email}</span>
              </div>
              <Icon name="expand_more" className="text-white/35 text-[18px] hidden sm:block" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl"
            >
              {/* User info */}
              <div className="px-3 py-3 mb-1">
                <div className="flex items-center gap-3">
                  <Avatar.Root className="h-11 w-11 overflow-hidden rounded-full flex-shrink-0">
                    <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {initials}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user ? `${user.nombre} ${user.apellido}` : '—'}
                    </p>
                    <p className="text-xs text-white/45 mt-0.5 truncate">{user?.email}</p>
                    {user?.rol && (
                      <span className={`mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROL_COLOR[user.rol]}`}>
                        {ROL_LABEL[user.rol]}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-white/35 font-mono">
                  N° Control: <span className="text-white/65">{user?.numero_control ?? '—'}</span>
                </p>
              </div>

              <div className="h-px bg-white/[0.07] mx-1 mb-1" />

              <DropdownMenu.Item asChild>
                <Link
                  to="/perfil"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/65 outline-none cursor-pointer hover:bg-white/[0.07] hover:text-white transition-colors"
                >
                  <Icon name="manage_accounts" className="text-[18px] text-white/35" />
                  Mi perfil
                </Link>
              </DropdownMenu.Item>

              <div className="h-px bg-white/[0.07] mx-1 my-1" />

              <DropdownMenu.Item
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-400 outline-none cursor-pointer hover:bg-red-500/10 transition-colors"
              >
                <Icon name="logout" className="text-[18px]" />
                Cerrar sesión
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
