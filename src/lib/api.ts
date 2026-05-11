const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'
const STORAGE_KEY = 'auth-storage'
const COOKIE_NAME = 'auth-token'

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
    if (!opts.skipAuthRedirect) clearAuth()  // solo redirige en rutas protegidas
    const data = await res.json().catch(() => ({}))
    throw data
  }
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}

export interface LoginResponse {
  token: string; expiresIn: number; tipo: string; id_alumno: number; rol: string
}
export interface User {
  id_alumno: number; numero_control: string; nombre: string
  apellido: string; email: string; rol: 'admin' | 'docente' | 'alumno'
}

export const api = {
  get:    <T>(path: string)               => request<T>(path),
  post:   <T>(path: string, body: unknown)=> request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)=> request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path: string)                  => request<void>(path, { method: 'DELETE' }),
  auth: {
    // skipAuthRedirect: 401 lanza el error al caller sin redireccionar (credenciales inválidas)
    login: (email: string, password: string) =>
      request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, { skipAuthRedirect: true }),
    // token explícito: se llama justo después del login, antes de que Zustand persista en localStorage
    me: (token?: string) =>
      request<User>('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    register: (body: { numero_control: string; nombre: string; apellido: string; email: string; password: string }) =>
      request<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, { skipAuthRedirect: true }),
  },
}
