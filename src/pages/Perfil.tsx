import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { api, type User } from '@/lib/api'
import Icon from '@/components/Icon'

const ROL_LABEL: Record<string, string> = { admin: 'Administrador', docente: 'Docente', alumno: 'Alumno' }
const ROL_COLOR: Record<string, string> = {
  admin:   'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  docente: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  alumno:  'bg-slate-500/20  text-slate-300  border border-slate-500/30',
}

const schema = z.object({
  nombre:   z.string().min(2, 'Mínimo 2 caracteres').max(60),
  apellido: z.string().min(2, 'Mínimo 2 caracteres').max(60),
  email:    z.string().email('Correo inválido').max(100),
  nueva_password:     z.string().min(8, 'Mínimo 8 caracteres').or(z.literal('')),
  confirmar_password: z.string().or(z.literal('')),
}).refine((d) => {
  if (d.nueva_password && d.nueva_password !== d.confirmar_password) return false
  return true
}, { message: 'Las contraseñas no coinciden', path: ['confirmar_password'] })

type Form = z.infer<typeof schema>

export default function Perfil() {
  const { user, setUser } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre:   user?.nombre   ?? '',
      apellido: user?.apellido ?? '',
      email:    user?.email    ?? '',
      nueva_password:     '',
      confirmar_password: '',
    },
  })

  const onSubmit = async (data: Form) => {
    if (!user) return
    const payload: Record<string, string> = {
      nombre:   data.nombre,
      apellido: data.apellido,
      email:    data.email,
    }
    if (data.nueva_password) payload.password = data.nueva_password

    try {
      const updated = await api.put<User>(`/alumnos/${user.id_alumno}`, payload)
      setUser(updated)
      reset({ nombre: updated.nombre, apellido: updated.apellido, email: updated.email, nueva_password: '', confirmar_password: '' })
      toast.success('Perfil actualizado correctamente')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al actualizar perfil')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Mi perfil</h1>
        <p className="text-white/40 text-sm mt-0.5">Actualiza tu información personal</p>
      </motion.div>

      {/* Read-only info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="h-14 w-14 rounded-full bg-brand-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {user.nombre[0]}{user.apellido[0]}
        </div>
        <div>
          <p className="font-semibold text-white">{user.nombre} {user.apellido}</p>
          <p className="text-[12px] font-mono text-white/40 mt-0.5">N° Control: {user.numero_control}</p>
          {user.rol && (
            <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROL_COLOR[user.rol]}`}>
              {ROL_LABEL[user.rol]}
            </span>
          )}
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl p-6 space-y-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Información general</p>

        {/* Nombre + Apellido */}
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

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/65">Correo electrónico</label>
          <input type="email" className="glass-input w-full h-10 rounded-xl px-3 text-sm" {...register('email')} />
          {errors.email && <p className="text-[12px] text-red-400">{errors.email.message}</p>}
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.07] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">Cambiar contraseña <span className="normal-case text-white/20 font-normal">(opcional)</span></p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-white/65">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="glass-input w-full h-10 rounded-xl px-3 pr-10 text-sm"
                  placeholder="Mínimo 8 caracteres"
                  {...register('nueva_password')}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  <Icon name={showPwd ? 'visibility_off' : 'visibility'} className="text-[17px]" />
                </button>
              </div>
              {errors.nueva_password && <p className="text-[12px] text-red-400">{errors.nueva_password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-white/65">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConf ? 'text' : 'password'}
                  className="glass-input w-full h-10 rounded-xl px-3 pr-10 text-sm"
                  placeholder="Repite la nueva contraseña"
                  {...register('confirmar_password')}
                />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  <Icon name={showConf ? 'visibility_off' : 'visibility'} className="text-[17px]" />
                </button>
              </div>
              {errors.confirmar_password && <p className="text-[12px] text-red-400">{errors.confirmar_password.message}</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
          >
            {isSubmitting
              ? <><Icon name="autorenew" className="text-[16px] animate-spin" />Guardando...</>
              : <><Icon name="save" className="text-[16px]" />Guardar cambios</>
            }
          </button>
        </div>
      </motion.form>
    </div>
  )
}
