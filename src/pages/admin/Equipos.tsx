import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, type Equipo, type EquipoInput, type Grupo } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'
import Icon from '@/components/Icon'

const schema = z.object({
  nombre_equipo: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  id_grupo:      z.coerce.number().min(1, 'Selecciona un grupo'),
})

const COLUMNS: Column[] = [
  { key: 'id_equipo',     label: 'ID',      className: 'w-12 text-white/35 font-mono text-xs' },
  { key: 'nombre_equipo', label: 'Equipo',  className: 'font-medium text-white/85' },
  { key: 'nombre_grupo',  label: 'Grupo',   render: (v) => <span className="text-white/55 text-xs">{String(v ?? '—')}</span> },
  { key: 'alumnos',       label: 'Miembros', render: (v) => {
    const arr = v as { nombre: string }[] | undefined
    return <span className="text-[11px] text-white/40">{arr?.length ?? 0} alumno(s)</span>
  }},
]

function EquipoForm({ defaultValues, grupos, onSubmit, loading, onCancel }: {
  defaultValues?: Partial<EquipoInput>; grupos: Grupo[]
  onSubmit: (d: EquipoInput) => void; loading: boolean; onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<EquipoInput>({
    resolver: zodResolver(schema), defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Nombre del equipo</label>
        <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="Equipo Alpha" {...register('nombre_equipo')} />
        {errors.nombre_equipo && <p className="text-[12px] text-red-400">{errors.nombre_equipo.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Grupo</label>
        <select className="glass-select w-full h-10 rounded-xl px-3 text-sm" {...register('id_grupo')}>
          <option value="">— Seleccionar grupo —</option>
          {grupos.map((g) => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo} · {g.ciclo_escolar}</option>)}
        </select>
        {errors.id_grupo && <p className="text-[12px] text-red-400">{errors.id_grupo.message}</p>}
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

export default function AdminEquipos() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState<Equipo | null>(null)
  const [deleteItem, setDeleteItem] = useState<Equipo | null>(null)
  const [grupos,     setGrupos]     = useState<Grupo[]>([])

  const crud = useCrud<Equipo>({
    fetch: (page) => api.equipos.list({ page, size: 10 }),
  })

  useEffect(() => {
    crud.load()
    api.grupos.list({ size: 100 }).then((r) => setGrupos(r.content))
  }, [])

  const openEdit = (row: Record<string, unknown>) => { setEditItem(row as unknown as Equipo); setModalOpen(true) }

  const handleSubmit = async (data: EquipoInput) => {
    const ok = await crud.save(
      () => editItem ? api.equipos.update(editItem.id_equipo, data) : api.equipos.create(data),
      editItem ? 'Equipo actualizado' : 'Equipo creado',
    )
    if (ok) { setModalOpen(false); setEditItem(null) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.equipos.remove(deleteItem.id_equipo), 'Equipo eliminado')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Equipos" description="Equipos de trabajo dentro de cada grupo" icon="diversity_3"
        onAdd={() => { setEditItem(null); setModalOpen(true) }} addLabel="Nuevo equipo" />

      <DataTable columns={COLUMNS} data={(crud.data?.content ?? []) as unknown as Record<string, unknown>[]}
        loading={crud.loading} page={crud.data?.page ?? 0} totalPages={crud.data?.totalPages ?? 0}
        totalElements={crud.data?.totalElements ?? 0} size={crud.data?.size ?? 10}
        onPageChange={crud.changePage} onEdit={openEdit} onDelete={(row) => setDeleteItem(row as unknown as Equipo)} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar equipo' : 'Nuevo equipo'}>
        <EquipoForm defaultValues={editItem ? { nombre_equipo: editItem.nombre_equipo, id_grupo: editItem.id_grupo } : undefined}
          grupos={grupos} onSubmit={handleSubmit} loading={crud.saving} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Eliminar equipo" description={`¿Eliminar "${deleteItem?.nombre_equipo}"? Fallará si tiene exposiciones asignadas.`} loading={crud.deleting} />
    </div>
  )
}
