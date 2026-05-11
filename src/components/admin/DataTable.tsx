import Icon from '../Icon'

export interface Column {
  key: string
  label: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
  className?: string
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  loading?: boolean
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onEdit?: (row: Record<string, unknown>) => void
  onDelete?: (row: Record<string, unknown>) => void
}

function Skeleton() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-lg bg-white/[0.06] animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable({
  columns, data, loading, page, totalPages, totalElements, size, onPageChange, onEdit, onDelete,
}: DataTableProps) {
  const from = totalElements === 0 ? 0 : page * size + 1
  const to   = Math.min((page + 1) * size, totalElements)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/35 ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white/35">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-16 text-center">
                    <Icon name="inbox" className="text-[40px] text-white/15 block mx-auto mb-3" />
                    <p className="text-sm text-white/30">Sin registros</p>
                  </td>
                </tr>
              )
              : data.map((row, i) => (
                <tr
                  key={i}
                  className="group transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-sm text-white/70 ${col.className ?? ''}`}>
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-brand-600/20 hover:text-brand-300 transition-colors"
                            title="Editar"
                          >
                            <Icon name="edit" className="text-[16px]" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Icon name="delete" className="text-[16px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[12px] text-white/30">
          {totalElements === 0 ? '0 registros' : `${from}–${to} de ${totalElements}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(0)}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Icon name="first_page" className="text-[18px]" />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Icon name="chevron_left" className="text-[18px]" />
          </button>
          <span className="px-2 text-[12px] text-white/50">{page + 1} / {Math.max(totalPages, 1)}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Icon name="chevron_right" className="text-[18px]" />
          </button>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Icon name="last_page" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
