import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../Icon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden`}
            style={{
              background:           'rgba(10, 15, 30, 0.95)',
              backdropFilter:       'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border:               '1px solid rgba(255,255,255,0.1)',
              boxShadow:            '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
              <h2 className="text-[15px] font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
