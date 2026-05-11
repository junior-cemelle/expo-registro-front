import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { PaginatedResponse } from '@/lib/api'

interface UseCrudOptions<T> {
  fetch: (page: number, search: string) => Promise<PaginatedResponse<T>>
}

export function useCrud<T>({ fetch }: UseCrudOptions<T>) {
  const [data,    setData]    = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(0)
  const [search,  setSearch]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(false)

  const load = useCallback(async (p = page, s = search) => {
    setLoading(true)
    try { setData(await fetch(p, s)) }
    catch { toast.error('Error al cargar datos') }
    finally { setLoading(false) }
  }, [fetch, page, search])

  const changePage = (p: number) => { setPage(p); load(p, search) }
  const changeSearch = (s: string) => { setSearch(s); setPage(0); load(0, s) }

  async function save(action: () => Promise<unknown>, successMsg: string) {
    setSaving(true)
    try {
      await action()
      toast.success(successMsg)
      load(page, search)
      return true
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al guardar')
      return false
    } finally { setSaving(false) }
  }

  async function remove(action: () => Promise<unknown>, successMsg: string) {
    setDeleting(true)
    try {
      await action()
      toast.success(successMsg)
      load(page, search)
      return true
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'No se puede eliminar')
      return false
    } finally { setDeleting(false) }
  }

  return { data, loading, page, search, saving, deleting, load, changePage, changeSearch, save, remove }
}
