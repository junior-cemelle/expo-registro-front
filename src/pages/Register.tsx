import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import ConstellationCanvas from '@/components/ConstellationCanvas'
import RotatingBackground from '@/components/RotatingBackground'
import Icon from '@/components/Icon'

const schema = z.object({
  nombre:         z.string().min(2,  'Mínimo 2 caracteres'),
  apellido:       z.string().min(2,  'Mínimo 2 caracteres'),
  numero_control: z.string().min(3,  'Número de control requerido'),
  email:          z.string().email('Correo inválido'),
  password:       z.string().min(8,  'Mínimo 8 caracteres'),
  confirm:        z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
})
type Form = z.infer<typeof schema>

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

function Field({
  label, icon, error, children,
}: { label: string; icon: string; error?: string; children: React.ReactNode }) {
  return (
    <motion.div variants={item} className="space-y-1.5">
      <label className="block text-[13px] font-medium text-white/70">{label}</label>
      <div className="relative">
        <Icon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 text-[18px] pointer-events-none" />
        {children}
      </div>
      {error && (
        <p className="text-[12px] text-red-400 flex items-center gap-1">
          <Icon name="error" className="text-[14px]" /> {error}
        </p>
      )}
    </motion.div>
  )
}

export default function Register() {
  const [showPwd,  setShowPwd]  = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [apiErr,   setApiErr]   = useState<string | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setApiErr(null)
    try {
      const { confirm: _, ...payload } = data
      await api.auth.register(payload)
      toast.success('Cuenta creada correctamente. Inicia sesión.')
      navigate('/login')
    } catch (err: unknown) {
      const e = err as { message?: string }
      const msg = e?.message ?? 'Error al registrar la cuenta'
      setApiErr(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-8">
      {/* Fondo */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1340 35%, #1a0a2e 65%, #0f172a 100%)' }} />
      <RotatingBackground />
      <div className="fixed inset-0 bg-black/62" />
      <div className="fixed inset-0" style={{ background: 'linear-gradient(135deg, rgba(6,10,24,0.55) 0%, rgba(13,19,58,0.35) 50%, rgba(15,23,42,0.50) 100%)' }} />
      <ConstellationCanvas options={{ length: 70, distance: 120, velocity: 0.1 }} />

      {/* Tarjeta */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5 text-center border-b border-white/[0.08]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-xl shadow-brand-600/40 mb-3">
            <Icon name="person_add" className="text-white text-[24px]" filled />
          </div>
          <h1 className="text-lg font-semibold text-white">Crear cuenta</h1>
          <p className="text-sm text-white/40 mt-0.5">Registro de alumno</p>
        </div>

        {/* Formulario */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="px-8 py-6 space-y-4"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="show"
        >
          {/* Nombre + Apellido en grid */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" icon="badge" error={errors.nombre?.message}>
              <input
                placeholder="Juan"
                className="glass-input w-full h-10 rounded-xl pl-9 pr-3 text-sm"
                {...register('nombre')}
              />
            </Field>
            <Field label="Apellido" icon="badge" error={errors.apellido?.message}>
              <input
                placeholder="García"
                className="glass-input w-full h-10 rounded-xl pl-9 pr-3 text-sm"
                {...register('apellido')}
              />
            </Field>
          </div>

          <Field label="Número de control" icon="tag" error={errors.numero_control?.message}>
            <input
              placeholder="A20220001"
              className="glass-input w-full h-10 rounded-xl pl-9 pr-3 text-sm font-mono"
              {...register('numero_control')}
            />
          </Field>

          <Field label="Correo electrónico" icon="mail" error={errors.email?.message}>
            <input
              type="email"
              placeholder="usuario@correo.com"
              className="glass-input w-full h-10 rounded-xl pl-9 pr-3 text-sm"
              {...register('email')}
            />
          </Field>

          <Field label="Contraseña" icon="lock" error={errors.password?.message}>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              className="glass-input w-full h-10 rounded-xl pl-9 pr-10 text-sm"
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
              <Icon name={showPwd ? 'visibility_off' : 'visibility'} className="text-[18px]" />
            </button>
          </Field>

          <Field label="Confirmar contraseña" icon="lock_reset" error={errors.confirm?.message}>
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              className="glass-input w-full h-10 rounded-xl pl-9 pr-10 text-sm"
              {...register('confirm')}
            />
            <button type="button" onClick={() => setShowConf(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
              <Icon name={showConf ? 'visibility_off' : 'visibility'} className="text-[18px]" />
            </button>
          </Field>

          {apiErr && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
            >
              <Icon name="warning" className="text-[16px] flex-shrink-0" filled />
              {apiErr}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{
              background: isSubmitting ? 'rgba(79,70,229,0.6)' : 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            {isSubmitting ? (
              <><Icon name="autorenew" className="text-[18px] animate-spin" />Registrando...</>
            ) : (
              <><Icon name="person_add" className="text-[18px]" />Crear cuenta</>
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <div className="px-8 pb-7 text-center">
          <p className="text-[13px] text-white/40">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
