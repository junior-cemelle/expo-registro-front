import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, type Grupo, type GrupoInput, type Materia } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'
import Icon from '@/components/Icon'

const schema = z.object({
  nombre_grupo:  z.string().min(2, 'Mínimo 2 caracteres').max(60),
  ciclo_escolar: z.string().min(2, 'Requerido').max(20),
  id_materia:    z.coerce.number().min(1, 'Selecciona una materia'),
})

const COLUMNS: Column[] = [
  { key: 'id_grupo',       label: 'ID',     className: 'w-12 text-white/35 font-mono text-xs' },
  { key: 'nombre_grupo',   label: 'Grupo',  className: 'font-medium text-white/85' },
  { key: 'ciclo_escolar',  label: 'Ciclo',  render: (v) => <span className="text-xs font-mono text-amber-300">{String(v)}</span> },
  { key: 'nombre_materia', label: 'Materia', render: (v) => <span className="text-white/55 text-xs">{String(v ?? '—')}</span> },
]

function GrupoForm({ defaultValues, materias, onSubmit, loading, onCancel }: {
  defaultValues?: Partial<GrupoInput>; materias: Materia[]
  onSubmit: (d: GrupoInput) => void; loading: boolean; onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<GrupoInput>({
    resolver: zodResolver(schema), defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Nombre del grupo</label>
          <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="Grupo A" {...register('nombre_grupo')} />
          {errors.nombre_grupo && <p className="text-[12px] text-red-400">{errors.nombre_grupo.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Ciclo escolar</label>
          <input className="glass-input w-full h-10 rounded-xl px-3 text-sm font-mono" placeholder="2025-A" {...register('ciclo_escolar')} />
          {errors.ciclo_escolar && <p className="text-[12px] text-red-400">{errors.ciclo_escolar.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Materia</label>
        <select className="glass-select w-full h-10 rounded-xl px-3 text-sm" {...register('id_materia')}>
          <option value="">— Seleccionar materia —</option>
          {materias.map((m) => <option key={m.id_materia} value={m.id_materia}>{m.clave_materia} · {m.nombre_materia}</option>)}
        </select>
        {errors.id_materia && <p className="text-[12px] text-red-400">{errors.id_materia.message}</p>}
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

export default function AdminGrupos() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState<Grupo | null>(null)
  const [deleteItem, setDeleteItem] = useState<Grupo | null>(null)
  const [materias,   setMaterias]   = useState<Materia[]>([])

  const crud = useCrud<Grupo>({
    fetch: (page, search) => api.grupos.list({ page, size: 10, nombre_grupo: search || undefined }),
  })

  useEffect(() => {
    crud.load()
    api.materias.list({ size: 100 }).then((r) => setMaterias(r.content))
  }, [])

  const openEdit = (row: Record<string, unknown>) => { setEditItem(row as unknown as Grupo); setModalOpen(true) }

  const handleSubmit = async (data: GrupoInput) => {
    const ok = await crud.save(
      () => editItem ? api.grupos.update(editItem.id_grupo, data) : api.grupos.create(data),
      editItem ? 'Grupo actualizado' : 'Grupo creado',
    )
    if (ok) { setModalOpen(false); setEditItem(null) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.grupos.remove(deleteItem.id_grupo), 'Grupo eliminado')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Grupos" description="Grupos escolares por materia y ciclo" icon="groups"
        onAdd={() => { setEditItem(null); setModalOpen(true) }} addLabel="Nuevo grupo" />

      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px] pointer-events-none" />
        <input
          className="glass-input w-full h-9 rounded-xl pl-9 pr-3 text-sm"
          placeholder="Buscar grupo..."
          value={crud.search}
          onChange={(e) => crud.changeSearch(e.target.value)}
        />
      </div>

      <DataTable columns={COLUMNS} data={(crud.data?.content ?? []) as unknown as Record<string, unknown>[]}
        loading={crud.loading} page={crud.data?.page ?? 0} totalPages={crud.data?.totalPages ?? 0}
        totalElements={crud.data?.totalElements ?? 0} size={crud.data?.size ?? 10}
        onPageChange={crud.changePage} onEdit={openEdit} onDelete={(row) => setDeleteItem(row as unknown as Grupo)} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar grupo' : 'Nuevo grupo'}>
        <GrupoForm defaultValues={editItem ? { nombre_grupo: editItem.nombre_grupo, ciclo_escolar: editItem.ciclo_escolar, id_materia: editItem.id_materia } : undefined}
          materias={materias} onSubmit={handleSubmit} loading={crud.saving} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Eliminar grupo" description={`¿Eliminar "${deleteItem?.nombre_grupo}"? Fallará si tiene equipos asociados.`} loading={crud.deleting} />
    </div>
  )
}
