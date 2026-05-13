import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import ConstellationCanvas from '@/components/ConstellationCanvas'
import RotatingBackground from '@/components/RotatingBackground'
import Icon from '@/components/Icon'

const schema = z.object({
  email:    z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type Form = z.infer<typeof schema>

const itemVariant = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0  },
}

export default function Login() {
  const [showPwd, setShowPwd] = useState(false)
  const [apiErr, setApiErr]   = useState<string | null>(null)
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setApiErr(null)
    try {
      const res  = await api.auth.login(data.email, data.password)
      const user = await api.auth.me(res.token)   // token explícito — Zustand aún no lo persistió
      setAuth(res.token, user)
      toast.success(`Bienvenido, ${user.nombre}`)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Credenciales inválidas'
      setApiErr(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Base gradient */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1340 35%, #1a0a2e 65%, #0f172a 100%)' }} />
      {/* Rotating images */}
      <RotatingBackground />
      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/82 via-indigo-950/65 to-slate-900/78" />

      {/* Constelaciones */}
      <ConstellationCanvas options={{ length: 80, distance: 130, velocity: 0.12 }} />

      {/* Tarjeta glass */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background:     'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border:     '1px solid rgba(255,255,255,0.13)',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Header tarjeta */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-white/[0.08]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-xl shadow-brand-600/40 mb-4 animate-float"
          >
            <Icon name="school" className="text-white text-[28px]" filled />
          </motion.div>
          <h1 className="text-xl font-semibold text-white tracking-tight">ExpoRegistro</h1>
          <p className="text-sm text-white/45 mt-1">Sistema de gestión de exposiciones académicas</p>
        </div>

        {/* Formulario */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="px-8 py-7 space-y-5"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="show"
        >
          {/* Email */}
          <motion.div variants={itemVariant} className="space-y-1.5">
            <label className="block text-[13px] font-medium text-white/70">
              Correo electrónico
            </label>
            <div className="relative">
              <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 text-[18px]" />
              <input
                type="email"
                placeholder="usuario@correo.com"
                className="glass-input w-full h-11 rounded-xl pl-10 pr-4 text-sm focus:ring-0 transition-all"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-[12px] text-red-400 flex items-center gap-1">
                <Icon name="error" className="text-[14px]" /> {errors.email.message}
              </p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariant} className="space-y-1.5">
            <label className="block text-[13px] font-medium text-white/70">Contraseña</label>
            <div className="relative">
              <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 text-[18px]" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                className="glass-input w-full h-11 rounded-xl pl-10 pr-11 text-sm focus:ring-0 transition-all"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
              >
                <Icon name={showPwd ? 'visibility_off' : 'visibility'} className="text-[18px]" />
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px] text-red-400 flex items-center gap-1">
                <Icon name="error" className="text-[14px]" /> {errors.password.message}
              </p>
            )}
          </motion.div>

          {/* Error API */}
          {apiErr && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
            >
              <Icon name="warning" className="text-[16px] flex-shrink-0" filled />
              {apiErr}
            </motion.div>
          )}

          {/* Botón */}
          <motion.div variants={itemVariant}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: isSubmitting
                  ? 'rgba(79,70,229,0.6)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Icon name="autorenew" className="text-[18px] animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Icon name="login" className="text-[18px]" />
                  Iniciar sesión
                </>
              )}
            </button>
          </motion.div>
        </motion.form>

        {/* Footer tarjeta */}
        <div className="px-8 pb-7 text-center space-y-2">
          <p className="text-[13px] text-white/40">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Regístrate
            </Link>
          </p>
          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} ExpoRegistro · Sistema Académico
          </p>
        </div>
      </motion.div>
    </div>
  )
}
