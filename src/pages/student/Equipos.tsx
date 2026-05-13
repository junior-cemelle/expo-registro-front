import { useEffect, useState } from 'react'
import { api, type Equipo } from '@/lib/api'
import { useStudentData } from '@/hooks/useStudentData'
import Icon from '@/components/Icon'

export default function StudentEquipos() {
  const { grupos, equipos: misEquipos, loading: base } = useStudentData()
  const [grupoEquipos, setGrupoEquipos] = useState<Record<number, Equipo[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (base || grupos.length === 0) return
    const fetchAll = async () => {
      setLoading(true)
      const results = await Promise.all(
        grupos.map(async (g) => {
          const res = await api.equipos.list({ id_grupo: g.id_grupo, size: 100 })
          return [g.id_grupo, res.content] as [number, Equipo[]]
        })
      )
      setGrupoEquipos(Object.fromEntries(results))
      setLoading(false)
    }
    fetchAll()
  }, [grupos, base])

  const myEquipoIds = new Set(misEquipos.map((e) => e.id_equipo))

  if (loading || base) return <Skeleton />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Equipos</h1>
        <p className="text-white/40 text-sm mt-0.5">Equipos de todos tus grupos — el tuyo resaltado</p>
      </div>

      {grupos.length > 0 && (
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar equipo por nombre..." />
      )}

      {grupos.map((g) => {
        const q = search.toLowerCase()
        const allEquipos = grupoEquipos[g.id_grupo] ?? []
        const equipos = search
          ? allEquipos.filter((e) => e.nombre_equipo.toLowerCase().includes(q))
          : allEquipos
        return (
          <section key={g.id_grupo}>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="groups" className="text-violet-400 text-[18px]" filled />
              <h2 className="text-sm font-semibold text-white/80">{g.nombre_grupo}</h2>
              <span className="text-[10px] font-mono text-amber-300/70 bg-amber-500/10 px-2 py-0.5 rounded-full">{g.ciclo_escolar}</span>
              <span className="text-[10px] text-white/30">{g.nombre_materia}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipos.map((e) => {
                const isMine = myEquipoIds.has(e.id_equipo)
                return (
                  <div
                    key={e.id_equipo}
                    className={`rounded-2xl p-4 space-y-3 ${isMine ? 'ring-1 ring-emerald-500/35' : ''}`}
                    style={{
                      background: isMine ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isMine ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    {/* Header equipo */}
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isMine ? 'bg-emerald-500/20' : 'bg-white/[0.06]'}`}>
                        <Icon name="diversity_3" className={`text-[17px] ${isMine ? 'text-emerald-400' : 'text-white/40'}`} filled={isMine} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isMine ? 'text-emerald-300' : 'text-white/80'}`}>{e.nombre_equipo}</p>
                        {isMine && (
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Tu equipo</span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/30">{(e.alumnos ?? []).length} miembro(s)</span>
                    </div>

                    {/* Miembros */}
                    <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                      {(e.alumnos ?? []).length === 0 ? (
                        <p className="text-[12px] text-white/25 italic">Sin miembros asignados</p>
                      ) : (
                        (e.alumnos ?? []).map((a) => (
                          <div key={a.id_alumno} className="flex items-center gap-2">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isMine ? 'bg-emerald-600' : 'bg-slate-700'} text-white`}>
                              {a.nombre[0]}{a.apellido[0]}
                            </div>
                            <span className="text-[12px] text-white/60 truncate">{a.nombre} {a.apellido}</span>
                            <span className="text-[10px] font-mono text-white/25 ml-auto">{a.numero_control}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px] pointer-events-none" />
      <input
        className="glass-input w-full h-9 rounded-xl pl-9 pr-9 text-sm"
        placeholder={placeholder ?? 'Buscar...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
          <Icon name="close" className="text-[16px]" />
        </button>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1,2].map(i => (
        <div key={i}>
          <div className="h-5 w-48 rounded bg-white/[0.08] mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(j => <div key={j} className="h-40 rounded-2xl bg-white/[0.04]" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
