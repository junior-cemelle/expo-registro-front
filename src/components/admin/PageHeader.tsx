import Icon from '../Icon'

interface PageHeaderProps {
  title: string
  description?: string
  icon: string
  onAdd?: () => void
  addLabel?: string
}

export default function PageHeader({ title, description, icon, onAdd, addLabel = 'Agregar' }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20 border border-brand-600/30">
          <Icon name={icon} className="text-brand-400 text-[20px]" filled />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {description && <p className="text-[12px] text-white/40 mt-0.5">{description}</p>}
        </div>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98] flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}
        >
          <Icon name="add" className="text-[18px]" />
          {addLabel}
        </button>
      )}
    </div>
  )
}
