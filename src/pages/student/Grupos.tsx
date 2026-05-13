import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStudentData } from '@/hooks/useStudentData'
import Icon from '@/components/Icon'

export default function StudentGrupos() {
  const { grupos, equipos, loading } = useStudentData()
  const [search, setSearch] = useState('')

  const q = search.toLowerCase()
  const filtered = search
    ? grupos.filter((g) =>
        g.nombre_grupo.toLowerCase().includes(q) ||
        g.nombre_materia?.toLowerCase().includes(q) ||
        g.ciclo_escolar.toLowerCase().includes(q)
      )
    : grupos

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2].map(i => <div key={i} className="h-32 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Mis Grupos</h1>
        <p className="text-white/40 text-sm mt-0.5">Grupos escolares en los que estás inscrito</p>
      </div>

      {grupos.length > 0 && (
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por grupo, materia o ciclo..." />
      )}

      {grupos.length === 0 ? (
        <Empty text="No estás inscrito en ningún grupo" />
      ) : filtered.length === 0 ? (
        <Empty text={`Sin resultados para "${search}"`} />
      ) : (
        <div className="space-y-4">
          {filtered.map((g, i) => {
            const equipo = equipos.find((e) => e.id_grupo === g.id_grupo)
            return (
              <motion.div
                key={g.id_grupo}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/25">
                      <Icon name="groups" className="text-violet-400 text-[18px]" filled />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{g.nombre_grupo}</p>
                      <p className="text-[11px] text-white/40">{g.nombre_materia} · <span className="font-mono text-amber-300">{g.ciclo_escolar}</span></p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-2 py-1 rounded-lg">{g.clave_materia}</span>
                </div>

                {/* Equipo info */}
                <div className="px-5 py-4">
                  {equipo ? (
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="diversity_3" className="text-emerald-400 text-[16px]" filled />
                          <span className="text-sm font-semibold text-emerald-300">{equipo.nombre_equipo}</span>
                          <span className="text-[10px] text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Tu equipo</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {equipo.alumnos.map((a) => (
                            <div key={a.id_alumno} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                              <div className="h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                                {a.nombre[0]}{a.apellido[0]}
                              </div>
                              <span className="text-[12px] text-white/65">{a.nombre} {a.apellido}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/30 italic flex items-center gap-2">
                      <Icon name="warning" className="text-amber-400/60 text-[16px]" />
                      No estás asignado a ningún equipo en este grupo
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-16 text-center">
      <Icon name="groups" className="text-[48px] text-white/15 block mx-auto mb-3" />
      <p className="text-white/30 text-sm">{text}</p>
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
