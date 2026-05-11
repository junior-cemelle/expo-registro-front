import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/Icon'

const CARDS = [
  { to: '/materias',     label: 'Materias',     icon: 'menu_book',      color: '#6366f1', desc: 'Catálogo de materias académicas'  },
  { to: '/grupos',       label: 'Grupos',       icon: 'groups',         color: '#8b5cf6', desc: 'Grupos por materia y ciclo escolar' },
  { to: '/alumnos',      label: 'Alumnos',      icon: 'person',         color: '#06b6d4', desc: 'Registro y gestión de alumnos'    },
  { to: '/equipos',      label: 'Equipos',      icon: 'diversity_3',    color: '#10b981', desc: 'Equipos de trabajo por grupo'     },
  { to: '/exposiciones', label: 'Exposiciones', icon: 'present_to_all', color: '#f59e0b', desc: 'Temas y fechas de exposición'     },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: 'star',           color: '#ef4444', desc: 'Calificaciones y evaluaciones'    },
  { to: '/criterios',    label: 'Criterios',    icon: 'checklist',      color: '#ec4899', desc: 'Rúbrica de evaluación'            },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item      = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-semibold text-white">
          Hola, <span className="text-brand-400">{user?.nombre ?? 'Usuario'}</span>
        </h1>
        <p className="text-white/45 mt-1 text-sm">Panel de gestión de exposiciones académicas</p>
      </motion.div>

      {/* Cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CARDS.map(({ to, label, icon, color, desc }) => (
          <motion.div key={to} variants={item}>
            <Link
              to={to}
              className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
              style={{
                background:     'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border:         '1px solid rgba(255,255,255,0.08)',
                boxShadow:      '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${color}22`, boxShadow: `0 4px 12px ${color}33` }}
              >
                <Icon name={icon} className="text-[22px]" style={{ color }} filled />
              </div>
              <h3 className="font-semibold text-white text-[15px] group-hover:text-brand-300 transition-colors">{label}</h3>
              <p className="text-white/40 text-[12px] mt-1 leading-relaxed">{desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
