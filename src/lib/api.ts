const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'
const STORAGE_KEY = 'auth-storage'
const COOKIE_NAME  = 'auth-token'

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw)?.state?.token ?? null) : null
  } catch { return null }
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
  window.location.href = '/login'
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  opts: { skipAuthRedirect?: boolean } = {},
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 401) {
    if (!opts.skipAuthRedirect) clearAuth()
    const data = await res.json().catch(() => ({}))
    throw data
  }
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}

function qs(p: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== '') params.set(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

// ── Shared types ────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  content: T[]; page: number; size: number; totalElements: number; totalPages: number
}
export interface LoginResponse {
  token: string; expiresIn: number; tipo: string; id_alumno: number; rol: string
}
export interface User {
  id_alumno: number; numero_control: string; nombre: string
  apellido: string; email: string; rol: 'admin' | 'docente' | 'alumno'
}

// ── Entity types ─────────────────────────────────────────────────
export interface Materia { id_materia: number; clave_materia: string; nombre_materia: string }
export interface MateriaInput { clave_materia: string; nombre_materia: string }

export interface Grupo {
  id_grupo: number; nombre_grupo: string; ciclo_escolar: string
  id_materia: number; nombre_materia?: string
}
export interface GrupoInput { nombre_grupo: string; ciclo_escolar: string; id_materia: number }

export interface Alumno {
  id_alumno: number; numero_control: string; nombre: string
  apellido: string; email: string; rol: 'admin' | 'docente' | 'alumno'
}
export interface AlumnoInput {
  numero_control: string; nombre: string; apellido: string
  email: string; password?: string; rol: 'admin' | 'docente' | 'alumno'
}

export interface Equipo {
  id_equipo: number; nombre_equipo: string; id_grupo: number
  nombre_grupo?: string; alumnos?: Alumno[]
}
export interface EquipoInput { nombre_equipo: string; id_grupo: number }

export interface Exposicion {
  id_exposicion: number; tema: string; fecha: string; id_equipo: number; nombre_equipo?: string
}
export interface ExposicionInput { tema: string; fecha: string; id_equipo: number }

export interface Criterio {
  id_criterio: number; nombre_criterio: string; descripcion?: string; puntaje_maximo: number
}
export interface CriterioInput { nombre_criterio: string; descripcion?: string; puntaje_maximo: number }

export interface DetalleEvaluacion { id_criterio: number; nombre_criterio?: string; calificacion: number }
export interface Evaluacion {
  id_evaluacion: number; id_exposicion: number; id_alumno_evaluador: number
  fecha_evaluacion: string; detalles: DetalleEvaluacion[]; promedio: number
}

// ── API namespaces ───────────────────────────────────────────────
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, { skipAuthRedirect: true }),
    me: (token?: string) =>
      request<User>('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    register: (body: { numero_control: string; nombre: string; apellido: string; email: string; password: string }) =>
      request<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, { skipAuthRedirect: true }),
  },

  materias: {
    list: (p: { page?: number; size?: number; nombre?: string } = {}) =>
      request<PaginatedResponse<Materia>>(`/materias${qs(p)}`),
    create: (d: MateriaInput)              => request<Materia>('/materias',     { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: MateriaInput)  => request<Materia>(`/materias/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id: number)                   => request<void>(`/materias/${id}`, { method: 'DELETE' }),
  },

  grupos: {
    list: (p: { page?: number; size?: number; id_materia?: number; ciclo_escolar?: string } = {}) =>
      request<PaginatedResponse<Grupo>>(`/grupos${qs(p)}`),
    create: (d: GrupoInput)              => request<Grupo>('/grupos',     { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: GrupoInput)  => request<Grupo>(`/grupos/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id: number)                 => request<void>(`/grupos/${id}`, { method: 'DELETE' }),
  },

  alumnos: {
    list: (p: { page?: number; size?: number; nombre?: string; rol?: string } = {}) =>
      request<PaginatedResponse<Alumno>>(`/alumnos${qs(p)}`),
    create: (d: AlumnoInput)              => request<Alumno>('/alumnos',     { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: AlumnoInput)  => request<Alumno>(`/alumnos/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id: number)                  => request<void>(`/alumnos/${id}`, { method: 'DELETE' }),
  },

  equipos: {
    list: (p: { page?: number; size?: number; id_grupo?: number } = {}) =>
      request<PaginatedResponse<Equipo>>(`/equipos${qs(p)}`),
    create: (d: EquipoInput)              => request<Equipo>('/equipos',     { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: EquipoInput)  => request<Equipo>(`/equipos/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id: number)                  => request<void>(`/equipos/${id}`, { method: 'DELETE' }),
  },

  exposiciones: {
    list: (p: { page?: number; size?: number; id_equipo?: number } = {}) =>
      request<PaginatedResponse<Exposicion>>(`/exposiciones${qs(p)}`),
    create: (d: ExposicionInput)              => request<Exposicion>('/exposiciones',     { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: ExposicionInput)  => request<Exposicion>(`/exposiciones/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id: number)                      => request<void>(`/exposiciones/${id}`, { method: 'DELETE' }),
  },

  criterios: {
    list: (p: { page?: number; size?: number } = {}) =>
      request<PaginatedResponse<Criterio>>(`/criterios${qs(p)}`),
    create: (d: CriterioInput)              => request<Criterio>('/criterios',     { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: CriterioInput)  => request<Criterio>(`/criterios/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id: number)                    => request<void>(`/criterios/${id}`, { method: 'DELETE' }),
  },

  evaluaciones: {
    list: (p: { page?: number; size?: number; id_alumno_evaluador?: number } = {}) =>
      request<PaginatedResponse<Evaluacion>>(`/evaluaciones${qs(p)}`),
    remove: (id: number) => request<void>(`/evaluaciones/${id}`, { method: 'DELETE' }),
  },
}
