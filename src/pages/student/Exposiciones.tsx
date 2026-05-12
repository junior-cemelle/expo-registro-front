import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { api, type Exposicion, type Criterio, type Evaluacion } from '@/lib/api'
import { useStudentData } from '@/hooks/useStudentData'
import Icon from '@/components/Icon'

// ── Modal de evaluación ──────────────────────────────────────────
function EvaluarModal({
  exposicion, studentId, criterios, onClose, onDone,
}: {
  exposicion: Exposicion; studentId: number; criterios: Criterio[]
  onClose: () => void; onDone: () => void
}) {
  const [scores, setScores] = useState<Record<number, number>>(
    Object.fromEntries(criterios.map((c) => [c.id_criterio, 5]))
  )
  const [saving, setSaving] = useState(false)

  const promedio = criterios.length
    ? criterios.reduce((s, c) => s + (scores[c.id_criterio] ?? 5), 0) / criterios.length
    : 0

  const submit = async () => {
    setSaving(true)
    try {
      await api.evaluaciones.create({
        id_exposicion: exposicion.id_exposicion,
        id_alumno_evaluador: studentId,
        detalles: criterios.map((c) => ({ id_criterio: c.id_criterio, calificacion: scores[c.id_criterio] ?? 5 })),
      })
      toast.success('Evaluación registrada correctamente')
      onDone()
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al registrar')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'rgba(8,12,28,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1">Evaluando exposición</p>
              <h3 className="text-[15px] font-semibold text-white leading-tight">{exposicion.tema}</h3>
              <p className="text-[12px] text-white/40 mt-0.5">{exposicion.nombre_equipo} · {exposicion.fecha}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-white/35 hover:bg-white/[0.08] hover:text-white transition-colors flex-shrink-0">
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Criterios */}
        <div className="px-6 py-5 space-y-5 max-h-[55vh] overflow-y-auto">
          {criterios.map((c) => (
            <div key={c.id_criterio} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">{c.nombre_criterio}</p>
                  {c.descripcion && <p className="text-[11px] text-white/35 mt-0.5">{c.descripcion}</p>}
                </div>
                <span className="text-xl font-bold text-brand-300 min-w-[2.5rem] text-right">
                  {(scores[c.id_criterio] ?? 5).toFixed(1)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range" min={0} max={10} step={0.5}
                  value={scores[c.id_criterio] ?? 5}
                  onChange={(e) => setScores((s) => ({ ...s, [c.id_criterio]: parseFloat(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6366f1 ${((scores[c.id_criterio] ?? 5) / 10) * 100}%, rgba(255,255,255,0.1) 0%)`,
                    accentColor: '#6366f1',
                  }}
                />
                <div className="flex justify-between text-[9px] text-white/20 mt-1">
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-white/40">Promedio: </span>
            <span className="font-bold text-lg text-brand-300">{promedio.toFixed(2)}</span>
            <span className="text-white/25"> / 10</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="h-9 px-4 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/[0.06] transition-colors">
              Cancelar
            </button>
            <button onClick={submit} disabled={saving}
              className="h-9 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}
            >
              {saving ? <><Icon name="autorenew" className="text-[16px] animate-spin" />Enviando...</> : <><Icon name="send" className="text-[16px]" />Enviar evaluación</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function StudentExposiciones() {
  const { user, grupos, equipos: misEquipos, loading: base } = useStudentData()
  const [data, setData]       = useState<Record<number, { equipo: string; expos: Exposicion[] }[]>>({})
  const [criterios, setCriterios] = useState<Criterio[]>([])
  const [evalSet, setEvalSet] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [target, setTarget]   = useState<Exposicion | null>(null)

  const myEquipoIds = new Set(misEquipos.map((e) => e.id_equipo))

  const loadData = useCallback(async () => {
    if (base || grupos.length === 0 || !user) return
    setLoading(true)
    try {
      const [criteriosRes, evalRes, ...equipoResults] = await Promise.all([
        api.criterios.list({ size: 100 }),
        api.evaluaciones.list({ id_alumno_evaluador: user.id_alumno, size: 100 }),
        ...grupos.map((g) => api.equipos.list({ id_grupo: g.id_grupo, size: 100 }).then((r) => ({ g, equipos: r.content }))),
      ])
      setCriterios(criteriosRes.content)
      setEvalSet(new Set((evalRes.content).map((e: Evaluacion) => e.id_exposicion)))

      const byGrupo: typeof data = {}
      for (const { g, equipos } of equipoResults as { g: typeof grupos[0]; equipos: Awaited<ReturnType<typeof api.equipos.list>>['content'] }[]) {
        const sections = await Promise.all(
          equipos.map(async (eq) => {
            const expos = await api.exposiciones.list({ id_equipo: eq.id_equipo, size: 100 })
            return { equipo: eq.nombre_equipo, id_equipo: eq.id_equipo, expos: expos.content }
          })
        )
        byGrupo[g.id_grupo] = sections
      }
      setData(byGrupo)
    } finally { setLoading(false) }
  }, [base, grupos, user])

  useEffect(() => { loadData() }, [loadData])

  if (loading || base) return <Skeleton />

  return (
    <>
      <div className="space-y-10">
        <div>
          <h1 className="text-xl font-semibold text-white">Exposiciones</h1>
          <p className="text-white/40 text-sm mt-0.5">Todas las exposiciones de tus grupos — evalúa las de otros equipos</p>
        </div>

        {grupos.map((g) => {
          const sections = data[g.id_grupo] ?? []
          return (
            <section key={g.id_grupo} className="space-y-5">
              {/* Header grupo */}
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.07]">
                <Icon name="groups" className="text-violet-400 text-[18px]" filled />
                <h2 className="text-sm font-semibold text-white/80">{g.nombre_grupo}</h2>
                <span className="text-[10px] font-mono text-amber-300/70 bg-amber-500/10 px-2 py-0.5 rounded-full">{g.ciclo_escolar}</span>
                <span className="text-[11px] text-white/30">{g.nombre_materia}</span>
              </div>

              {sections.length === 0 ? (
                <p className="text-sm text-white/25 pl-2">Sin exposiciones registradas en este grupo</p>
              ) : (
                sections.map((sec) => {
                  const isMine = myEquipoIds.has((sec as unknown as { id_equipo: number }).id_equipo)
                  if (sec.expos.length === 0) return null
                  return (
                    <div key={sec.equipo} className="space-y-3">
                      {/* Sub-header equipo */}
                      <div className="flex items-center gap-2">
                        <Icon name="diversity_3" className={`text-[15px] ${isMine ? 'text-emerald-400' : 'text-white/30'}`} filled={isMine} />
                        <span className={`text-[13px] font-semibold ${isMine ? 'text-emerald-300' : 'text-white/55'}`}>{sec.equipo}</span>
                        {isMine && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">Tu equipo</span>}
                      </div>

                      {/* Exposiciones del equipo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                        {sec.expos.map((expo) => {
                          const evaluated = evalSet.has(expo.id_exposicion)
                          return (
                            <motion.div
                              key={expo.id_exposicion}
                              className="rounded-xl p-4 space-y-2"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              <p className="text-sm font-medium text-white/85 leading-tight">{expo.tema}</p>
                              <p className="text-[11px] font-mono text-cyan-300/70">{expo.fecha}</p>
                              <div className="pt-2">
                                {isMine ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-white/35 bg-white/[0.05] px-2.5 py-1 rounded-lg">
                                    <Icon name="lock" className="text-[13px]" />
                                    No puedes evaluarte
                                  </span>
                                ) : evaluated ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                    <Icon name="check_circle" className="text-[13px]" filled />
                                    Evaluado
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setTarget(expo)}
                                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-3 py-1.5 rounded-lg transition-all active:scale-[0.97]"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 3px 10px rgba(99,102,241,0.35)' }}
                                  >
                                    <Icon name="star" className="text-[14px]" />
                                    Evaluar
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </section>
          )
        })}
      </div>

      {/* Modal de evaluación */}
      <AnimatePresence>
        {target && user && (
          <EvaluarModal
            exposicion={target}
            studentId={user.id_alumno}
            criterios={criterios}
            onClose={() => setTarget(null)}
            onDone={() => {
              setEvalSet((s) => new Set([...s, target.id_exposicion]))
              setTarget(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1,2].map(i => (
        <div key={i}>
          <div className="h-5 w-48 rounded bg-white/[0.08] mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(j => <div key={j} className="h-28 rounded-xl bg-white/[0.04]" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
