import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, type Criterio, type CriterioInput } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'
import Icon from '@/components/Icon'

const schema = z.object({
  nombre_criterio: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  descripcion:     z.string().optional(),
  puntaje_maximo:  z.coerce.number().min(1).max(10),
})

const COLUMNS: Column[] = [
  { key: 'id_criterio',     label: 'ID',      className: 'w-16 text-white/35 font-mono text-xs' },
  { key: 'nombre_criterio', label: 'Criterio', className: 'font-medium text-white/85' },
  { key: 'descripcion',     label: 'Descripción', render: (v) => <span className="text-white/45 text-xs">{v ? String(v) : '—'}</span> },
  { key: 'puntaje_maximo',  label: 'Puntaje máx', render: (v) => <span className="font-semibold text-emerald-400">{String(v)}</span> },
]

function CriterioForm({ defaultValues, onSubmit, loading, onCancel }: {
  defaultValues?: Partial<CriterioInput>; onSubmit: (d: CriterioInput) => void
  loading: boolean; onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CriterioInput>({
    resolver: zodResolver(schema), defaultValues: defaultValues ?? { puntaje_maximo: 10 },
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Nombre del criterio</label>
        <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="Dominio del tema" {...register('nombre_criterio')} />
        {errors.nombre_criterio && <p className="text-[12px] text-red-400">{errors.nombre_criterio.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Descripción <span className="text-white/30">(opcional)</span></label>
        <textarea className="glass-input w-full rounded-xl px-3 py-2.5 text-sm resize-none" rows={3}
          placeholder="Descripción del criterio..." {...register('descripcion')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Puntaje máximo (1–10)</label>
        <input type="number" min={1} max={10} step={0.5} className="glass-input w-full h-10 rounded-xl px-3 text-sm" {...register('puntaje_maximo')} />
        {errors.puntaje_maximo && <p className="text-[12px] text-red-400">{errors.puntaje_maximo.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-10 rounded-xl text-sm text-white/55 border border-white/10 hover:bg-white/[0.06] transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          {loading ? <><Icon name="autorenew" className="text-[16px] animate-spin" />Guardando...</> : <><Icon name="save" className="text-[16px]" />Guardar</>}
        </button>
      </div>
    </form>
  )
}

export default function AdminCriterios() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState<Criterio | null>(null)
  const [deleteItem, setDeleteItem] = useState<Criterio | null>(null)

  const crud = useCrud<Criterio>({
    fetch: (page, search) => api.criterios.list({ page, size: 10, nombre_criterio: search || undefined }),
  })

  useEffect(() => { crud.load() }, [])

  const openEdit = (row: Record<string, unknown>) => { setEditItem(row as unknown as Criterio); setModalOpen(true) }

  const handleSubmit = async (data: CriterioInput) => {
    const ok = await crud.save(
      () => editItem ? api.criterios.update(editItem.id_criterio, data) : api.criterios.create(data),
      editItem ? 'Criterio actualizado' : 'Criterio creado',
    )
    if (ok) { setModalOpen(false); setEditItem(null) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.criterios.remove(deleteItem.id_criterio), 'Criterio eliminado')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Criterios" description="Rúbrica de evaluación de exposiciones" icon="checklist"
        onAdd={() => { setEditItem(null); setModalOpen(true) }} addLabel="Nuevo criterio" />

      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px] pointer-events-none" />
        <input
          className="glass-input w-full h-9 rounded-xl pl-9 pr-3 text-sm"
          placeholder="Buscar criterio..."
          value={crud.search}
          onChange={(e) => crud.changeSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={COLUMNS}
        data={(crud.data?.content ?? []) as unknown as Record<string, unknown>[]}
        loading={crud.loading}
        page={crud.data?.page ?? 0}
        totalPages={crud.data?.totalPages ?? 0}
        totalElements={crud.data?.totalElements ?? 0}
        size={crud.data?.size ?? 10}
        onPageChange={crud.changePage}
        onEdit={openEdit}
        onDelete={(row) => setDeleteItem(row as unknown as Criterio)}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar criterio' : 'Nuevo criterio'}>
        <CriterioForm defaultValues={editItem ?? undefined} onSubmit={handleSubmit} loading={crud.saving} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Eliminar criterio" description={`¿Eliminar "${deleteItem?.nombre_criterio}"? Fallará si está en uso en evaluaciones.`} loading={crud.deleting} />
    </div>
  )
}
