import { useEffect, useState } from 'react'
import { api, type Alumno } from '@/lib/api'
import { useStudentData } from '@/hooks/useStudentData'
import Icon from '@/components/Icon'

export default function StudentAlumnos() {
  const { user, grupos, equipos, loading: baseLoading } = useStudentData()
  const [grupoAlumnos, setGrupoAlumnos] = useState<Record<number, Alumno[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (baseLoading || grupos.length === 0) return
    const fetchAll = async () => {
      setLoading(true)
      const results = await Promise.all(
        grupos.map(async (g) => {
          const res = await api.get<Alumno[]>(`/grupos/${g.id_grupo}/alumnos`)
          return [g.id_grupo, res] as [number, Alumno[]]
        })
      )
      setGrupoAlumnos(Object.fromEntries(results))
      setLoading(false)
    }
    fetchAll()
  }, [grupos, baseLoading])

  // IDs de compañeros de equipo
  const teammateIds = new Set(
    equipos.flatMap((e) => e.alumnos.map((a) => a.id_alumno))
  )
  const myId = user?.id_alumno

  if (loading || baseLoading) return <Skeleton />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Alumnos</h1>
        <p className="text-white/40 text-sm mt-0.5">Compañeros en tus grupos</p>
      </div>

      {grupos.map((g) => {
        const alumnos = grupoAlumnos[g.id_grupo] ?? []
        const myEquipo = equipos.find((e) => e.id_grupo === g.id_grupo)

        return (
          <section key={g.id_grupo}>
            {/* Encabezado sección */}
            <div className="flex items-center gap-2 mb-4">
              <Icon name="groups" className="text-violet-400 text-[18px]" filled />
              <h2 className="text-sm font-semibold text-white/80">{g.nombre_grupo}</h2>
              <span className="text-[10px] font-mono text-amber-300/70 bg-amber-500/10 px-2 py-0.5 rounded-full">{g.ciclo_escolar}</span>
              <span className="text-[10px] text-white/30">{g.nombre_materia}</span>
              <span className="ml-auto text-[11px] text-white/30">{alumnos.length} alumno(s)</span>
            </div>

            {alumnos.length === 0 ? (
              <p className="text-white/30 text-sm pl-4">Sin alumnos en este grupo</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alumnos.map((a) => {
                  const isMe       = a.id_alumno === myId
                  const isTeammate = teammateIds.has(a.id_alumno)
                  const teamName   = myEquipo?.alumnos.some(m => m.id_alumno === a.id_alumno)
                    ? myEquipo.nombre_equipo : null

                  return (
                    <div
                      key={a.id_alumno}
                      className={`rounded-xl p-3.5 flex items-center gap-3 transition-all ${isMe ? 'ring-1 ring-brand-500/40' : ''}`}
                      style={{
                        background: isMe
                          ? 'rgba(99,102,241,0.1)'
                          : isTeammate
                          ? 'rgba(16,185,129,0.06)'
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isMe ? 'rgba(99,102,241,0.25)' : isTeammate ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >
                      {/* Avatar */}
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMe ? 'bg-brand-600' : isTeammate ? 'bg-emerald-600' : 'bg-slate-700'} text-white`}>
                        {a.nombre[0]}{a.apellido[0]}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-white/85 truncate">{a.nombre} {a.apellido}</p>
                          {isMe && <span className="text-[9px] font-bold text-brand-300 bg-brand-600/20 px-1.5 py-0.5 rounded-full flex-shrink-0">Tú</span>}
                        </div>
                        <p className="text-[11px] font-mono text-white/35 mt-0.5">{a.numero_control}</p>
                        {teamName && (
                          <span className="mt-1 inline-block text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {teamName}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1,2].map(i => (
        <div key={i}>
          <div className="h-5 w-48 rounded bg-white/[0.08] mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(j => <div key={j} className="h-16 rounded-xl bg-white/[0.04]" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
