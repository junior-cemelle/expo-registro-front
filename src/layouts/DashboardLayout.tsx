import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/Sidebar'
import ConstellationCanvas from '@/components/ConstellationCanvas'
import RotatingBackground from '@/components/RotatingBackground'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  return (
    <div className="relative min-h-screen">
      {/* Base gradient (always visible) */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(160deg, #060d1f 0%, #0a1628 40%, #0d1a3a 70%, #08101e 100%)' }} />

      {/* Rotating landscape images */}
      <RotatingBackground />

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/88 via-slate-900/82 to-indigo-950/85" />

      <ConstellationCanvas options={{
        starColor: 'rgba(180,190,255,0.5)',
        lineColor: 'rgba(130,150,255,0.15)',
        length: 60,
        distance: 110,
        velocity: 0.08,
      }} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 flex flex-col min-h-screen lg:pl-64">
        <Navbar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 py-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
