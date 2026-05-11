import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { api, type Materia, type MateriaInput } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'
import Icon from '@/components/Icon'

const schema = z.object({
  clave_materia:  z.string().min(1, 'Requerido').max(20),
  nombre_materia: z.string().min(2, 'Mínimo 2 caracteres').max(100),
})

const COLUMNS: Column[] = [
  { key: 'id_materia',     label: 'ID',     className: 'w-16 text-white/35 font-mono text-xs' },
  { key: 'clave_materia',  label: 'Clave',  render: (v) => <span className="font-mono text-brand-300 text-xs">{String(v)}</span> },
  { key: 'nombre_materia', label: 'Nombre', className: 'font-medium text-white/85' },
]

function MateriaForm({ defaultValues, onSubmit, loading, onCancel }: {
  defaultValues?: Partial<MateriaInput>; onSubmit: (d: MateriaInput) => void
  loading: boolean; onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<MateriaInput>({
    resolver: zodResolver(schema), defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Clave de materia</label>
        <input className="glass-input w-full h-10 rounded-xl px-3 text-sm font-mono" placeholder="PROG-01" {...register('clave_materia')} />
        {errors.clave_materia && <p className="text-[12px] text-red-400">{errors.clave_materia.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Nombre de materia</label>
        <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="Programación Web" {...register('nombre_materia')} />
        {errors.nombre_materia && <p className="text-[12px] text-red-400">{errors.nombre_materia.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-10 rounded-xl text-sm text-white/55 border border-white/10 hover:bg-white/[0.06] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          {loading ? <><Icon name="autorenew" className="text-[16px] animate-spin" />Guardando...</> : <><Icon name="save" className="text-[16px]" />Guardar</>}
        </button>
      </div>
    </form>
  )
}

export default function AdminMaterias() {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editItem,    setEditItem]    = useState<Materia | null>(null)
  const [deleteItem,  setDeleteItem]  = useState<Materia | null>(null)

  const crud = useCrud<Materia>({
    fetch: (page, search) => api.materias.list({ page, size: 10, nombre: search || undefined }),
  })

  useEffect(() => { crud.load() }, [])

  const openAdd  = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (row: Record<string, unknown>) => { setEditItem(row as unknown as Materia); setModalOpen(true) }

  const handleSubmit = async (data: MateriaInput) => {
    const ok = await crud.save(
      () => editItem ? api.materias.update(editItem.id_materia, data) : api.materias.create(data),
      editItem ? 'Materia actualizada' : 'Materia creada',
    )
    if (ok) { setModalOpen(false); setEditItem(null) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.materias.remove(deleteItem.id_materia), 'Materia eliminada')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Materias" description="Catálogo de materias académicas" icon="menu_book" onAdd={openAdd} addLabel="Nueva materia" />

      {/* Filtro */}
      <div className="relative max-w-xs">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px]" />
        <input
          className="glass-input w-full h-9 rounded-xl pl-9 pr-3 text-sm"
          placeholder="Buscar por nombre..."
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
        onDelete={(row) => setDeleteItem(row as unknown as Materia)}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar materia' : 'Nueva materia'}>
        <MateriaForm
          defaultValues={editItem ?? undefined}
          onSubmit={handleSubmit}
          loading={crud.saving}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Eliminar materia"
        description={`¿Eliminar "${deleteItem?.nombre_materia}"? No se puede deshacer y fallará si tiene grupos asociados.`}
        loading={crud.deleting}
      />
    </div>
  )
}
