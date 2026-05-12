import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api, type Evaluacion, type Exposicion } from '@/lib/api'
import { useStudentData } from '@/hooks/useStudentData'
import Icon from '@/components/Icon'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

function scoreColor(n: number) {
  if (n >= 8) return 'text-emerald-400'
  if (n >= 6) return 'text-amber-400'
  return 'text-red-400'
}

export default function StudentEvaluaciones() {
  const { user, equipos: misEquipos, loading: base } = useStudentData()
  const [misEvals,   setMisEvals]   = useState<Evaluacion[]>([])
  const [recibidasByExpo, setRecibidas] = useState<Record<number, Evaluacion[]>>({})
  const [misExpos,   setMisExpos]   = useState<Exposicion[]>([])
  const [loading, setLoading] = useState(true)
  const [expandEval, setExpandEval] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (base || !user) return
    setLoading(true)
    try {
      // Mis evaluaciones realizadas
      const evalRes = await api.evaluaciones.list({ id_alumno_evaluador: user.id_alumno, size: 100 })
      setMisEvals(evalRes.content)

      // Exposiciones de mis equipos + evaluaciones recibidas
      const expos: Exposicion[] = []
      for (const equipo of misEquipos) {
        const r = await api.exposiciones.list({ id_equipo: equipo.id_equipo, size: 100 })
        expos.push(...r.content)
      }
      setMisExpos(expos)

      const recibidas: Record<number, Evaluacion[]> = {}
      await Promise.all(expos.map(async (e) => {
        recibidas[e.id_exposicion] = await api.evaluaciones.byExposicion(e.id_exposicion)
      }))
      setRecibidas(recibidas)
    } finally { setLoading(false) }
  }, [base, user, misEquipos])

  useEffect(() => { load() }, [load])

  if (loading || base) return <Skeleton />

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-white">Mis Evaluaciones</h1>
        <p className="text-white/40 text-sm mt-0.5">Evaluaciones que realizaste y cómo evaluaron a tu equipo</p>
      </div>

      {/* ── Evaluaciones realizadas ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <Icon name="rate_review" className="text-brand-400 text-[18px]" filled />
          Evaluaciones que realicé
          <span className="ml-1 text-[11px] text-white/30 font-normal">({misEvals.length})</span>
        </h2>

        {misEvals.length === 0 ? (
          <Empty text="Aún no has evaluado ninguna exposición" />
        ) : (
          <div className="space-y-3">
            {misEvals.map((ev) => {
              const open = expandEval === ev.id_evaluacion
              return (
                <motion.div
                  key={ev.id_evaluacion}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                    onClick={() => setExpandEval(open ? null : ev.id_evaluacion)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="present_to_all" className="text-brand-400 text-[18px]" filled />
                      <div>
                        <p className="text-sm font-medium text-white/80">Exposición #{ev.id_exposicion}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">{new Date(ev.fecha_evaluacion).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${scoreColor(ev.promedio)}`}>{ev.promedio.toFixed(2)}</span>
                      <Icon name={open ? 'expand_less' : 'expand_more'} className="text-white/30 text-[20px]" />
                    </div>
                  </button>

                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 border-t border-white/[0.06]"
                    >
                      <div className="pt-3 space-y-2">
                        {ev.detalles.map((d) => (
                          <div key={d.id_criterio} className="flex items-center gap-3">
                            <span className="text-[12px] text-white/50 min-w-0 flex-1 truncate">{d.nombre_criterio ?? `Criterio ${d.id_criterio}`}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="w-24 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(d.calificacion / 10) * 100}%` }} />
                              </div>
                              <span className={`text-xs font-semibold w-8 text-right ${scoreColor(d.calificacion)}`}>{d.calificacion}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Cómo evaluaron mi equipo ── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <Icon name="analytics" className="text-violet-400 text-[18px]" filled />
          Cómo evaluaron mi equipo
        </h2>

        {misExpos.length === 0 ? (
          <Empty text="Tu equipo no tiene exposiciones registradas" />
        ) : (
          <div className="space-y-6">
            {misExpos.map((expo) => {
              const evals = recibidasByExpo[expo.id_exposicion] ?? []
              if (evals.length === 0) return (
                <div key={expo.id_exposicion} className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-sm font-medium text-white/70">{expo.tema}</p>
                  <p className="text-[11px] text-white/30 mt-1">Sin evaluaciones recibidas aún</p>
                </div>
              )

              // Promedio general y por criterio
              const promedioGeneral = evals.reduce((s, e) => s + e.promedio, 0) / evals.length
              const criterioMap: Record<string, number[]> = {}
              for (const ev of evals) {
                for (const d of ev.detalles) {
                  const name = d.nombre_criterio ?? `C${d.id_criterio}`
                  if (!criterioMap[name]) criterioMap[name] = []
                  criterioMap[name].push(d.calificacion)
                }
              }
              const radarData = Object.entries(criterioMap).map(([name, vals]) => ({
                criterio: name.length > 18 ? name.slice(0, 16) + '…' : name,
                promedio: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
              }))

              return (
                <div key={expo.id_exposicion} className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white/85">{expo.tema}</p>
                      <p className="text-[11px] text-white/35 mt-0.5 font-mono">{expo.fecha} · {expo.nombre_equipo}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-bold ${scoreColor(promedioGeneral)}`}>{promedioGeneral.toFixed(2)}</p>
                      <p className="text-[10px] text-white/30">{evals.length} evaluador(es)</p>
                    </div>
                  </div>

                  {/* Radar chart + criterios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="criterio" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                          <Radar dataKey="promedio" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                            formatter={(v) => [typeof v === 'number' ? v.toFixed(2) : v, 'Promedio']}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-3">Promedio por criterio</p>
                      {radarData.map((d) => (
                        <div key={d.criterio} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-white/55 truncate">{d.criterio}</span>
                            <span className={`text-xs font-bold ${scoreColor(d.promedio)}`}>{d.promedio}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${(d.promedio / 10) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-10 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon name="inbox" className="text-[40px] text-white/15 block mx-auto mb-2" />
      <p className="text-white/30 text-sm">{text}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1,2].map(i => (
        <div key={i}>
          <div className="h-5 w-48 rounded bg-white/[0.08] mb-4" />
          <div className="space-y-3">{[1,2].map(j => <div key={j} className="h-16 rounded-2xl bg-white/[0.04]" />)}</div>
        </div>
      ))}
    </div>
  )
}
