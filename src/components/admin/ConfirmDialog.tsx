import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../Icon'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  loading?: boolean
  confirmLabel?: string
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, description, loading = false, confirmLabel = 'Eliminar',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background:     'rgba(10, 15, 30, 0.97)',
              backdropFilter: 'blur(24px)',
              border:         '1px solid rgba(255,255,255,0.1)',
              boxShadow:      '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <div className="p-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 border border-red-500/25 mb-4">
                <Icon name="warning" className="text-[28px] text-red-400" filled />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{description}</p>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-10 rounded-xl text-sm font-medium text-white/60 border border-white/10 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' }}
              >
                {loading
                  ? <><Icon name="autorenew" className="text-[16px] animate-spin" />Eliminando...</>
                  : <><Icon name="delete" className="text-[16px]" />{confirmLabel}</>
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
