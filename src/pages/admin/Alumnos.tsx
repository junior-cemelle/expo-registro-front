import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, type Alumno, type AlumnoInput } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'
import Icon from '@/components/Icon'

const ROL_BADGE: Record<string, string> = {
  admin:   'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  docente: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  alumno:  'bg-slate-500/20  text-slate-300  border border-slate-500/30',
}
const ROL_LABEL: Record<string, string> = { admin: 'Admin', docente: 'Docente', alumno: 'Alumno' }

const createSchema = z.object({
  numero_control: z.string().min(3, 'Requerido'),
  nombre:   z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rol:      z.enum(['admin', 'docente', 'alumno']),
})
const editSchema = createSchema.extend({ password: z.string().optional() })

const COLUMNS: Column[] = [
  { key: 'id_alumno',      label: 'ID',     className: 'w-12 text-white/35 font-mono text-xs' },
  { key: 'numero_control', label: 'N° Control', render: (v) => <span className="font-mono text-xs text-brand-300">{String(v)}</span> },
  { key: 'nombre',         label: 'Nombre', render: (_, r) => <span className="font-medium text-white/85">{r.nombre as string} {r.apellido as string}</span> },
  { key: 'email',          label: 'Correo', className: 'text-white/50 text-xs' },
  { key: 'rol',            label: 'Rol',    render: (v) => (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROL_BADGE[v as string]}`}>
      {ROL_LABEL[v as string]}
    </span>
  )},
]

type CreateForm = z.infer<typeof createSchema>
type EditForm   = z.infer<typeof editSchema>

function AlumnoForm({ editItem, onSubmit, loading, onCancel }: {
  editItem: Alumno | null; onSubmit: (d: AlumnoInput) => void
  loading: boolean; onCancel: () => void
}) {
  const schema = editItem ? editSchema : createSchema
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm | EditForm>({
    resolver: zodResolver(schema),
    defaultValues: editItem ? { ...editItem, password: '' } : { rol: 'alumno' },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d as AlumnoInput))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Nombre</label>
          <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="Juan" {...register('nombre')} />
          {errors.nombre && <p className="text-[12px] text-red-400">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Apellido</label>
          <input className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="García" {...register('apellido')} />
          {errors.apellido && <p className="text-[12px] text-red-400">{errors.apellido.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Número de control</label>
        <input className="glass-input w-full h-10 rounded-xl px-3 text-sm font-mono" placeholder="A20220001" {...register('numero_control')} />
        {errors.numero_control && <p className="text-[12px] text-red-400">{errors.numero_control.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-white/65">Correo electrónico</label>
        <input type="email" className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="alumno@mail.com" {...register('email')} />
        {errors.email && <p className="text-[12px] text-red-400">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">
            Contraseña {editItem && <span className="text-white/30">(vacío = sin cambio)</span>}
          </label>
          <input type="password" className="glass-input w-full h-10 rounded-xl px-3 text-sm" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-[12px] text-red-400">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Rol</label>
          <select className="glass-select w-full h-10 rounded-xl px-3 text-sm" {...register('rol')}>
            <option value="alumno">Alumno</option>
            <option value="docente">Docente</option>
            <option value="admin">Administrador</option>
          </select>
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

export default function AdminAlumnos() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState<Alumno | null>(null)
  const [deleteItem, setDeleteItem] = useState<Alumno | null>(null)
  const [rolFilter,  setRolFilter]  = useState('')

  const crud = useCrud<Alumno>({
    fetch: (page, search) => api.alumnos.list({ page, size: 10, nombre: search || undefined, rol: rolFilter || undefined }),
  })

  useEffect(() => { crud.load() }, [rolFilter])

  const openEdit = (row: Record<string, unknown>) => { setEditItem(row as unknown as Alumno); setModalOpen(true) }

  const handleSubmit = async (data: AlumnoInput) => {
    const payload = editItem && !data.password ? { ...data, password: undefined } : data
    const ok = await crud.save(
      () => editItem ? api.alumnos.update(editItem.id_alumno, payload) : api.alumnos.create(data),
      editItem ? 'Alumno actualizado' : 'Alumno creado',
    )
    if (ok) { setModalOpen(false); setEditItem(null) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.alumnos.remove(deleteItem.id_alumno), 'Alumno eliminado')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Alumnos" description="Usuarios registrados en el sistema" icon="person"
        onAdd={() => { setEditItem(null); setModalOpen(true) }} addLabel="Nuevo usuario" />

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px]" />
          <input className="glass-input w-full h-9 rounded-xl pl-9 pr-3 text-sm" placeholder="Buscar por nombre..."
            value={crud.search} onChange={(e) => crud.changeSearch(e.target.value)} />
        </div>
        <select className="glass-select h-9 rounded-xl px-3 text-sm" value={rolFilter}
          onChange={(e) => { setRolFilter(e.target.value); crud.changePage(0) }}>
          <option value="">Todos los roles</option>
          <option value="alumno">Alumno</option>
          <option value="docente">Docente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <DataTable columns={COLUMNS} data={(crud.data?.content ?? []) as unknown as Record<string, unknown>[]}
        loading={crud.loading} page={crud.data?.page ?? 0} totalPages={crud.data?.totalPages ?? 0}
        totalElements={crud.data?.totalElements ?? 0} size={crud.data?.size ?? 10}
        onPageChange={crud.changePage} onEdit={openEdit} onDelete={(row) => setDeleteItem(row as unknown as Alumno)} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar usuario' : 'Nuevo usuario'} maxWidth="max-w-xl">
        <AlumnoForm editItem={editItem} onSubmit={handleSubmit} loading={crud.saving} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Eliminar usuario" description={`¿Eliminar a "${deleteItem?.nombre} ${deleteItem?.apellido}"? Se eliminarán también sus evaluaciones.`} loading={crud.deleting} />
    </div>
  )
}
