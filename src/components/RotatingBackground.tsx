import { useState, useEffect, useRef } from 'react'

// Add landscape images to /public/resources/ named landscape-1.jpg … landscape-4.jpg
// The component skips any image that fails to load (falls back to gradient overlay).
const DEFAULT_IMAGES = [
  '/resources/bg-dashboard.jpg',
  '/resources/landscape-1.jpg',
  '/resources/landscape-2.jpg',
  '/resources/landscape-3.jpg',
  '/resources/landscape-4.jpg',
]

interface Props {
  images?: string[]
}

export default function RotatingBackground({ images = DEFAULT_IMAGES }: Props) {
  const [ready, setReady] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [nextIdx, setNextIdx] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preload images; only rotate through those that successfully loaded
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image()
      img.onload = () => setReady((prev) => (prev.includes(src) ? prev : [...prev, src]))
      img.src = src
    })
  }, []) // intentionally run once

  // Rotate every 10 seconds among successfully loaded images
  useEffect(() => {
    if (ready.length <= 1) return
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      const next = (currentIdx + 1) % ready.length
      setNextIdx(next)
      setTimeout(() => setTransitioning(true), 50)
      setTimeout(() => {
        setCurrentIdx(next)
        setNextIdx(null)
        setTransitioning(false)
      }, 1600)
    }, 10000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIdx, ready.length])

  if (ready.length === 0) return null

  return (
    <div className="fixed inset-0">
      {/* Current layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${ready[currentIdx]})`,
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out',
          transform: 'scale(1.04)',
        }}
      />
      {/* Next layer (crossfades in) */}
      {nextIdx !== null && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${ready[nextIdx]})`,
            opacity: transitioning ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            transform: 'scale(1.04)',
          }}
        />
      )}
    </div>
  )
}
