import { Outlet } from 'react-router-dom'
import Navbar from '@/components/navbar'
import ConstellationCanvas from '@/components/ConstellationCanvas'

// Imagen local opcional: coloca tu foto en public/resources/bg-dashboard.jpg
const BG_LOCAL = '/resources/bg-dashboard.jpg'

export default function DashboardLayout() {
  return (
    <div className="relative min-h-screen">
      {/* Fondo: gradiente base + imagen local opcional */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          background: 'linear-gradient(160deg, #060d1f 0%, #0a1628 40%, #0d1a3a 70%, #08101e 100%)',
          backgroundImage: `url(${BG_LOCAL})`,
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-indigo-950/82" />

      {/* Constelaciones suaves */}
      <ConstellationCanvas options={{
        starColor: 'rgba(180,190,255,0.5)',
        lineColor: 'rgba(130,150,255,0.15)',
        length: 60,
        distance: 110,
        velocity: 0.08,
      }} />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 py-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
