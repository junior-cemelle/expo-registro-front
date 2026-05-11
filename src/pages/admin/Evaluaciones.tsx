import { useEffect, useState } from 'react'
import { api, type Evaluacion } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import DataTable, { type Column } from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PageHeader from '@/components/admin/PageHeader'

const COLUMNS: Column[] = [
  { key: 'id_evaluacion',       label: 'ID',         className: 'w-12 text-white/35 font-mono text-xs' },
  { key: 'id_exposicion',       label: 'Exposición', render: (v) => <span className="font-mono text-xs text-cyan-300">#{String(v)}</span> },
  { key: 'id_alumno_evaluador', label: 'Evaluador',  render: (v) => <span className="font-mono text-xs text-indigo-300">alumno #{String(v)}</span> },
  { key: 'fecha_evaluacion',    label: 'Fecha',      render: (v) => <span className="text-xs text-white/45">{new Date(String(v)).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span> },
  { key: 'promedio',            label: 'Promedio',   render: (v) => {
    const n = Number(v)
    const color = n >= 8 ? 'text-emerald-400' : n >= 6 ? 'text-amber-400' : 'text-red-400'
    return <span className={`font-semibold text-sm ${color}`}>{n.toFixed(2)}</span>
  }},
  { key: 'detalles', label: 'Criterios', render: (v) => {
    const arr = v as unknown[]
    return <span className="text-xs text-white/35">{arr?.length ?? 0} criterio(s)</span>
  }},
]

export default function AdminEvaluaciones() {
  const [deleteItem, setDeleteItem] = useState<Evaluacion | null>(null)

  const crud = useCrud<Evaluacion>({
    fetch: (page) => api.evaluaciones.list({ page, size: 10 }),
  })

  useEffect(() => { crud.load() }, [])

  const handleDelete = async () => {
    if (!deleteItem) return
    const ok = await crud.remove(() => api.evaluaciones.remove(deleteItem.id_evaluacion), 'Evaluación eliminada')
    if (ok) setDeleteItem(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Evaluaciones" description="Registro de evaluaciones por alumno — solo lectura y eliminación" icon="star" />

      <DataTable
        columns={COLUMNS}
        data={(crud.data?.content ?? []) as unknown as Record<string, unknown>[]}
        loading={crud.loading}
        page={crud.data?.page ?? 0}
        totalPages={crud.data?.totalPages ?? 0}
        totalElements={crud.data?.totalElements ?? 0}
        size={crud.data?.size ?? 10}
        onPageChange={crud.changePage}
        onDelete={(row) => setDeleteItem(row as unknown as Evaluacion)}
      />

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Eliminar evaluación"
        description={`¿Eliminar la evaluación #${deleteItem?.id_evaluacion}? Se borrarán también todos sus detalles.`}
        loading={crud.deleting}
      />
    </div>
  )
}
