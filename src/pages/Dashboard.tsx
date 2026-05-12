import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { useStudentData } from '@/hooks/useStudentData'
import { api, type Evaluacion } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import Icon from '@/components/Icon'

// ── Dashboard Admin ──────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuthStore()
  const SECTIONS = [
    { to: '/admin/materias',     label: 'Materias',     icon: 'menu_book',      color: '#6366f1' },
    { to: '/admin/grupos',       label: 'Grupos',       icon: 'groups',         color: '#8b5cf6' },
    { to: '/admin/alumnos',      label: 'Usuarios',     icon: 'person',         color: '#06b6d4' },
    { to: '/admin/equipos',      label: 'Equipos',      icon: 'diversity_3',    color: '#10b981' },
    { to: '/admin/exposiciones', label: 'Exposiciones', icon: 'present_to_all', color: '#f59e0b' },
    { to: '/criterios',          label: 'Criterios',    icon: 'checklist',      color: '#ec4899' },
    { to: '/admin/evaluaciones', label: 'Evaluaciones', icon: 'star',           color: '#ef4444' },
  ]
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-white/40 text-sm">Panel de administración</p>
        <h1 className="text-2xl font-semibold text-white mt-0.5">Hola, <span className="text-brand-400">{user?.nombre}</span></h1>
      </motion.div>
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {SECTIONS.map(({ to, label, icon, color }) => (
          <motion.div key={to} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <Link to={to} className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${color}22`, boxShadow: `0 4px 12px ${color}33` }}>
                <span className="material-symbols-rounded text-[20px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <p className="font-semibold text-white/80 text-sm group-hover:text-white transition-colors">{label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ── Dashboard Alumno/Docente ─────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuthStore()
  const { grupos, equipos, loading: base } = useStudentData()
  const [misEvals,  setMisEvals]  = useState<Evaluacion[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (base || !user) return
    setLoading(true)
    try {
      const r = await api.evaluaciones.list({ id_alumno_evaluador: user.id_alumno, size: 100 })
      setMisEvals(r.content)
    } finally { setLoading(false) }
  }, [base, user])

  useEffect(() => { load() }, [load])

  // Estadísticas
  const totalGrupos  = grupos.length
  const totalEquipos = equipos.length
  const totalEvals   = misEvals.length
  const promedioEvals = totalEvals
    ? parseFloat((misEvals.reduce((s, e) => s + e.promedio, 0) / totalEvals).toFixed(2))
    : 0

  // Promedio por criterio (de mis evaluaciones)
  const criterioMap: Record<string, number[]> = {}
  for (const ev of misEvals) {
    for (const d of ev.detalles) {
      const name = d.nombre_criterio ?? `C${d.id_criterio}`
      if (!criterioMap[name]) criterioMap[name] = []
      criterioMap[name].push(d.calificacion)
    }
  }
  const barData = Object.entries(criterioMap).map(([name, vals]) => ({
    name: name.length > 14 ? name.slice(0, 12) + '…' : name,
    promedio: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
  }))

  const STATS = [
    { label: 'Grupos', value: totalGrupos,  icon: 'groups',      color: '#8b5cf6', to: '/grupos'  },
    { label: 'Equipos', value: totalEquipos, icon: 'diversity_3', color: '#10b981', to: '/equipos' },
    { label: 'Evaluaciones', value: totalEvals, icon: 'rate_review', color: '#6366f1', to: '/evaluaciones' },
    { label: 'Mi promedio', value: promedioEvals, icon: 'analytics', color: '#f59e0b', to: '/evaluaciones' },
  ]

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-white/40 text-sm">Panel del estudiante</p>
        <h1 className="text-2xl font-semibold text-white mt-0.5">
          Hola, <span className="text-brand-400">{user?.nombre}</span>
        </h1>
        <p className="text-white/30 text-sm mt-1">N° Control: <span className="font-mono text-white/55">{user?.numero_control}</span></p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {STATS.map(({ label, value, icon, color, to }) => (
          <motion.div key={label} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <Link to={to} className="block rounded-2xl p-4 group transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/40 font-medium">{label}</span>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <span className="material-symbols-rounded text-[15px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{loading || base ? '—' : value}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Mis equipos */}
      {equipos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
            <Icon name="diversity_3" className="text-emerald-400 text-[17px]" filled />
            Mis equipos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {equipos.map((e) => (
              <div key={e.id_equipo} className="rounded-2xl p-4"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-emerald-300">{e.nombre_equipo}</p>
                  <span className="text-[10px] text-white/30 font-mono">{e.clave_materia}</span>
                </div>
                <p className="text-[11px] text-white/40">{e.nombre_materia} · {e.nombre_grupo} · <span className="text-amber-300/60">{e.ciclo_escolar}</span></p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.alumnos.map((a) => (
                    <span key={a.id_alumno} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">
                      {a.nombre} {a.apellido}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gráfica de criterios */}
      {barData.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
            <Icon name="bar_chart" className="text-brand-400 text-[17px]" filled />
            Promedio por criterio en mis evaluaciones
          </h2>
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(v) => [typeof v === 'number' ? v.toFixed(2) : v, 'Promedio']}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${230 + i * 25}, 70%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Últimas evaluaciones */}
      {misEvals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
            <Icon name="history" className="text-white/30 text-[17px]" />
            Evaluaciones recientes
          </h2>
          <div className="space-y-2">
            {misEvals.slice(0, 5).map((ev) => (
              <div key={ev.id_evaluacion} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <Icon name="star" className="text-brand-400 text-[17px]" filled />
                  <div>
                    <p className="text-sm text-white/75">Exposición #{ev.id_exposicion}</p>
                    <p className="text-[11px] text-white/35">{new Date(ev.fecha_evaluacion).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
                <span className={`text-base font-bold ${ev.promedio >= 8 ? 'text-emerald-400' : ev.promedio >= 6 ? 'text-amber-400' : 'text-red-400'}`}>
                  {ev.promedio.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Switcher por rol ─────────────────────────────────────────────
export default function Dashboard() {
  const rol = useAuthStore((s) => s.user?.rol)
  if (rol === 'admin') return <AdminDashboard />
  return <StudentDashboard />
}
