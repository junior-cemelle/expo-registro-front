import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, type Exposicion, type ExposicionInput, type Equipo } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'
import Icon from '@/components/Icon'

const schema = z.object({
  tema:      z.string().min(3, 'Mínimo 3 caracteres').max(200),
  fecha:     z.string().min(1, 'Requerido'),
  id_equipo: z.coerce.number().min(1, 'Selecciona un equipo'),
})

const COLUMNS: Column[] = [
  { key: 'id_exposicion', label: 'ID',    className: 'w-12 text-white/35 font-mono text-xs' },
  { key: 'tema',          label: 'Tema',  className: 'font-medium text-white/85 max-w-xs truncate' },
  { key: 'fecha',         label: 'Fecha', render: (v) => <span className="text-xs font-mono text-cyan-300">{String(v)}</span> },
  { key: 'nombre_equipo', label: 'Equipo', render: (v) => <span className="text-white/55 text-xs">{String(v ?? '—')}</span> },
]

function ExposicionForm({ defaultValues, equipos, onSubmit, loading, onCancel }: {
  defaultValues?: Partial<ExposicionInput>; equipos: Equipo[]
  onSubmit: (d: ExposicionInput) => void; loading: boolean; onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ExposicionInput>({
    resolver: zodResolver(schema), defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Tema</label>
        <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="Arquitecturas de Microservicios" {...register('tema')} />
        {errors.tema && <p className="text-[12px] text-red-400">{errors.tema.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Fecha</label>
          <input type="date" className="glass-input w-full h-10 rounded-xl px-3 text-sm" {...register('fecha')} />
          {errors.fecha && <p className="text-[12px] text-red-400">{errors.fecha.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Equipo</label>
          <select className="glass-select w-full h-10 rounded-xl px-3 text-sm" {...register('id_equipo')}>
            <option value="">— Seleccionar —</option>
            {equipos.map((e) => <option key={e.id_equipo} value={e.id_equipo}>{e.nombre_equipo}</option>)}
          </select>
          {errors.id_equipo && <p className="text-[12px] text-red-400">{errors.id_equipo.message}</p>}
        </div>
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

export default function AdminExposiciones() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState<Exposicion | null>(null)
  const [deleteItem, setDeleteItem] = useState<Exposicion | null>(null)
  const [equipos,    setEquipos]    = useState<Equipo[]>([])

  const crud = useCrud<Exposicion>({
    fetch: (page, search) => api.exposiciones.list({ page, size: 10, tema: search || undefined }),
  })

  useEffect(() => {
    crud.load()
    api.equipos.list({ size: 100 }).then((r) => setEquipos(r.content))
  }, [])

  const openEdit = (row: Record<string, unknown>) => { setEditItem(row as unknown as Exposicion); setModalOpen(true) }

  const handleSubmit = async (data: ExposicionInput) => {
    const ok = await crud.save(
      () => editItem ? api.exposiciones.update(editItem.id_exposicion, data) : api.exposiciones.create(data),
      editItem ? 'Exposición actualizada' : 'Exposición creada',
    )
    if (ok) { setModalOpen(false); setEditItem(null) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.exposiciones.remove(deleteItem.id_exposicion), 'Exposición eliminada')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Exposiciones" description="Temas y fechas de exposición por equipo" icon="present_to_all"
        onAdd={() => { setEditItem(null); setModalOpen(true) }} addLabel="Nueva exposición" />

      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px] pointer-events-none" />
        <input
          className="glass-input w-full h-9 rounded-xl pl-9 pr-3 text-sm"
          placeholder="Buscar por tema..."
          value={crud.search}
          onChange={(e) => crud.changeSearch(e.target.value)}
        />
      </div>

      <DataTable columns={COLUMNS} data={(crud.data?.content ?? []) as unknown as Record<string, unknown>[]}
        loading={crud.loading} page={crud.data?.page ?? 0} totalPages={crud.data?.totalPages ?? 0}
        totalElements={crud.data?.totalElements ?? 0} size={crud.data?.size ?? 10}
        onPageChange={crud.changePage} onEdit={openEdit} onDelete={(row) => setDeleteItem(row as unknown as Exposicion)} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar exposición' : 'Nueva exposición'}>
        <ExposicionForm defaultValues={editItem ? { tema: editItem.tema, fecha: editItem.fecha, id_equipo: editItem.id_equipo } : undefined}
          equipos={equipos} onSubmit={handleSubmit} loading={crud.saving} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Eliminar exposición" description={`¿Eliminar "${deleteItem?.tema}"? Fallará si tiene evaluaciones registradas.`} loading={crud.deleting} />
    </div>
  )
}
