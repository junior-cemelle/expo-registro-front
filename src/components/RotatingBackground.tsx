import { useState, useEffect, useRef } from 'react'

// Place landscape images in /public/resources/ named landscape-1.jpg … landscape-4.jpg
const DEFAULT_IMAGES = [
  '/resources/bg-dashboard.jpg',
  '/resources/landscape-1.jpg',
  '/resources/landscape-2.jpg',
  '/resources/landscape-3.jpg',
  '/resources/landscape-4.jpg',
]

interface Props { images?: string[] }

/**
 * Two permanent layers (slots 0 and 1) alternate as foreground/background.
 *
 * The trick that prevents the re-fade bug:
 *   - At transition END we swap which slot is "fg" and clear "fading".
 *   - Because slot-fg was already at opacity 1 AND slot-bg was already at opacity 0
 *     (the fade finished), the opacity VALUES don't change on that render —
 *     so the CSS transition never fires a second time.
 */
export default function RotatingBackground({ images = DEFAULT_IMAGES }: Props) {
  // ready[i] = URL of a successfully pre-loaded image
  const [ready, setReady] = useState<string[]>([])

  // Each slot holds an index into `ready`
  const [slots, setSlots] = useState<[number, number]>([0, 0])
  // Which slot is the foreground (opacity 1)
  const [fg, setFg] = useState<0 | 1>(0)
  // True while the crossfade CSS transition is running
  const [fading, setFading] = useState(false)

  // Refs so interval callback always sees fresh values (avoids stale closures)
  const fgRef          = useRef<0 | 1>(0)
  const readyRef       = useRef<string[]>([])
  const currentIdxRef  = useRef(0)
  const inProgress     = useRef(false)

  // ── Preload images ───────────────────────────────────────────────
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image()
      img.onload = () => {
        readyRef.current = readyRef.current.includes(src)
          ? readyRef.current
          : [...readyRef.current, src]
        setReady((prev) => (prev.includes(src) ? prev : [...prev, src]))
      }
      img.src = src
    })
  }, []) // run once

  // ── Start rotation once ≥2 images loaded ────────────────────────
  const hasEnough = ready.length >= 2
  useEffect(() => {
    if (!hasEnough) return

    const interval = setInterval(() => {
      if (inProgress.current) return
      const total = readyRef.current.length
      if (total < 2) return

      const nextIdx  = (currentIdxRef.current + 1) % total
      const bgSlot   = fgRef.current === 0 ? 1 : 0 as 0 | 1

      // 1. Load next image into the invisible background slot
      //    (opacity is 0 → no visual change)
      setSlots((prev) => {
        const next: [number, number] = [prev[0], prev[1]]
        next[bgSlot] = nextIdx
        return next
      })

      // 2. Let React paint the new backgroundImage, then start the CSS fade
      inProgress.current = true
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFading(true) // fg fades OUT, bg fades IN

          setTimeout(() => {
            // 3. Transition finished. Swap fg designation.
            //    Opacity values are ALREADY correct (fg=1, bg=0) so no second fade.
            fgRef.current     = bgSlot as 0 | 1
            currentIdxRef.current = nextIdx
            setFg(bgSlot as 0 | 1)
            setFading(false)
            inProgress.current = false
          }, 1500)
        })
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [hasEnough]) // only registers/unregisters when we first have ≥2 images

  if (ready.length === 0) return null

  // Opacity for each slot:
  //  • Not fading: fg=1, bg=0
  //  • Fading:     fg fades to 0, bg fades to 1
  const opacity = (slot: 0 | 1): number => {
    const isFg = slot === fg
    if (!fading) return isFg ? 1 : 0
    return isFg ? 0 : 1
  }

  return (
    <div className="fixed inset-0">
      {([0, 1] as const).map((slot) => (
        <div
          key={slot}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: ready[slots[slot]] ? `url(${ready[slots[slot]]})` : undefined,
            opacity:    opacity(slot),
            transition: 'opacity 1.5s ease-in-out',
            transform:  'scale(1.04)',
          }}
        />
      ))}
    </div>
  )
}
