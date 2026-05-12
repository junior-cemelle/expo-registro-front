import { useState, useEffect, useCallback } from 'react'
import { alumnoApi, type GrupoAlumno, type EquipoAlumno } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export function useStudentData() {
  const user = useAuthStore((s) => s.user)
  const [grupos,  setGrupos]  = useState<GrupoAlumno[]>([])
  const [equipos, setEquipos] = useState<EquipoAlumno[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [g, e] = await Promise.all([
        alumnoApi.misGrupos(user.id_alumno),
        alumnoApi.misEquipos(user.id_alumno),
      ])
      setGrupos(g)
      setEquipos(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  // Devuelve el equipo del alumno en un grupo dado
  const myTeamInGroup = (id_grupo: number) =>
    equipos.find((e) => e.id_grupo === id_grupo)

  // IDs de compañeros de equipo (en todos los equipos)
  const teammateIds = new Set(
    equipos.flatMap((e) => e.alumnos.map((a) => a.id_alumno))
  )

  return { user, grupos, equipos, loading, load, myTeamInGroup, teammateIds }
}
