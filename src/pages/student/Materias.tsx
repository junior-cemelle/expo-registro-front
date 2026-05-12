import { motion } from 'framer-motion'
import { useStudentData } from '@/hooks/useStudentData'
import Icon from '@/components/Icon'

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function StudentMaterias() {
  const { grupos, equipos, loading } = useStudentData()

  // Deduplica materias (un alumno puede estar en 2 grupos de la misma materia en distintos ciclos)
  const materias = grupos.map((g) => {
    const equipo = equipos.find((e) => e.id_grupo === g.id_grupo)
    return { ...g, equipo }
  })

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Mis Materias</h1>
        <p className="text-white/40 text-sm mt-0.5">Materias en las que tienes registro activo</p>
      </div>

      {materias.length === 0 ? (
        <Empty text="No estás registrado en ninguna materia" />
      ) : (
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {materias.map((m) => (
            <motion.div
              key={m.id_grupo}
              variants={item}
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Encabezado materia */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20 border border-brand-600/25 flex-shrink-0">
                  <Icon name="menu_book" className="text-brand-400 text-[20px]" filled />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm leading-tight">{m.nombre_materia}</p>
                  <p className="text-[11px] font-mono text-brand-300 mt-0.5">{m.clave_materia}</p>
                </div>
              </div>

              {/* Detalles */}
              <div className="space-y-2">
                <InfoRow icon="groups" label="Grupo" value={m.nombre_grupo} />
                <InfoRow icon="calendar_month" label="Ciclo" value={m.ciclo_escolar} mono />
                {m.equipo
                  ? <InfoRow icon="diversity_3" label="Tu equipo" value={m.equipo.nombre_equipo} accent />
                  : <InfoRow icon="diversity_3" label="Equipo" value="Sin asignar" muted />
                }
              </div>

              {/* Miembros del equipo */}
              {m.equipo && m.equipo.alumnos.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Compañeros</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.equipo.alumnos.map((a) => (
                      <span key={a.id_alumno} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/55">
                        {a.nombre} {a.apellido}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value, mono, accent, muted }: {
  icon: string; label: string; value: string; mono?: boolean; accent?: boolean; muted?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} className="text-white/25 text-[15px] flex-shrink-0" />
      <span className="text-[11px] text-white/35 min-w-[52px]">{label}</span>
      <span className={`text-[12px] truncate ${mono ? 'font-mono' : ''} ${accent ? 'text-emerald-300 font-medium' : muted ? 'text-white/25 italic' : 'text-white/65'}`}>
        {value}
      </span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl p-5 animate-pulse space-y-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-3"><div className="h-10 w-10 rounded-xl bg-white/[0.08]" /><div className="flex-1 space-y-2"><div className="h-4 rounded bg-white/[0.08]" /><div className="h-3 w-20 rounded bg-white/[0.06]" /></div></div>
          <div className="space-y-2">{[1,2,3].map(j => <div key={j} className="h-3 rounded bg-white/[0.06]" />)}</div>
        </div>
      ))}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-16 text-center">
      <Icon name="inbox" className="text-[48px] text-white/15 block mx-auto mb-3" />
      <p className="text-white/30 text-sm">{text}</p>
    </div>
  )
}
