import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface ImageItem {
  src: string
  bg: string
  panel: string
}

const IMAGES: ImageItem[] = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
    panel: '#F79B7F',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
    panel: '#85CC92',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
    panel: '#ED9DC4',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
  },
]

type Role = 'center' | 'left' | 'right' | 'back'

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const ITEM_TRANSITION = `transform 650ms ${EASE}, filter 650ms ${EASE}, opacity 650ms ${EASE}, left 650ms ${EASE}`

const GRAIN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg'><filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#grain)' opacity='0.08'/></svg>"
const GRAIN_DATA_URI = `data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}`

function getRoleStyle(role: Role, isMobile: boolean): CSSProperties {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        bottom: isMobile ? '22%' : 0,
        height: isMobile ? '60%' : '92%',
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
      }
    case 'left':
      return {
        left: isMobile ? '20%' : '30%',
        bottom: isMobile ? '32%' : '12%',
        height: isMobile ? '16%' : '28%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
      }
    case 'right':
      return {
        left: isMobile ? '80%' : '70%',
        bottom: isMobile ? '32%' : '12%',
        height: isMobile ? '16%' : '28%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
      }
    case 'back':
      return {
        left: '50%',
        bottom: isMobile ? '32%' : '12%',
        height: isMobile ? '13%' : '22%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(4px)',
        opacity: 1,
        zIndex: 5,
      }
  }
}

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const unlockTimer = useRef<number | null>(null)

  useEffect(() => {
    IMAGES.forEach((image) => {
      const preload = new Image()
      preload.src = image.src
    })
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      if (unlockTimer.current !== null) window.clearTimeout(unlockTimer.current)
    }
  }, [])

  const navigate = (direction: 'next' | 'prev') => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (direction === 'next' ? (prev + 1) % 4 : (prev + 3) % 4))
    unlockTimer.current = window.setTimeout(() => {
      setIsAnimating(false)
    }, 650)
  }

  const center = activeIndex
  const left = (activeIndex + 3) % 4
  const right = (activeIndex + 1) % 4
  const back = (activeIndex + 2) % 4

  const roleOf = (i: number): Role => {
    if (i === center) return 'center'
    if (i === left) return 'left'
    if (i === right) return 'right'
    if (i === back) return 'back'
    return 'back'
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: `background-color 650ms ${EASE}`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div className="relative w-full h-screen overflow-hidden">
        {/* grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[50]"
          style={{
            backgroundImage: `url("${GRAIN_DATA_URI}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: 0.4,
          }}
        />

        {/* giant ghost text */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none uppercase z-[2]"
          style={{
            top: '18%',
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(90px, 28vw, 380px)',
            fontWeight: 900,
            color: '#ffffff',
            opacity: 1,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          3D SHAPE
        </div>

        {/* brand label */}
        <div
          className="absolute top-6 left-4 sm:left-8 text-xs font-semibold uppercase text-white opacity-90 z-[60]"
          style={{ letterSpacing: '0.18em' }}
        >
          TOONHUB
        </div>

        {/* carousel */}
        <div className="absolute inset-0 z-[3]">
          {IMAGES.map((image, i) => {
            const role = roleOf(i)
            const roleStyle = getRoleStyle(role, isMobile)
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  aspectRatio: '0.6 / 1',
                  transition: ITEM_TRANSITION,
                  willChange: 'transform, filter, opacity',
                  ...roleStyle,
                }}
              >
                <img
                  src={image.src}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* bottom-left text + nav buttons */}
        <div className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24 max-w-xs z-[60]">
          <p
            className="mb-2 sm:mb-3 text-base sm:text-[22px] font-bold uppercase text-white opacity-95"
            style={{ letterSpacing: '0.02em' }}
          >
            TOONHUB FIGURINES
          </p>
          <p
            className="hidden sm:block mb-4 sm:mb-5 text-xs sm:text-sm text-white"
            style={{ opacity: 0.85, lineHeight: 1.6 }}
          >
            The artwork is stunning, shipped fully prepared. The finish is a vision, the
            3D craft is flawless. Many thanks! Wishing you the win. Order now.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => navigate('prev')}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent border-2 border-white flex items-center justify-center transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/12"
            >
              <ArrowLeft size={26} strokeWidth={2.25} className="text-white" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => navigate('next')}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent border-2 border-white flex items-center justify-center transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/12"
            >
              <ArrowRight size={26} strokeWidth={2.25} className="text-white" />
            </button>
          </div>
        </div>

        {/* bottom-right link */}
        <a
          href="#"
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center gap-2 uppercase no-underline text-white opacity-95 hover:opacity-100 transition-opacity duration-200 z-[60]"
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(20px, 4vw, 56px)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          DISCOVER IT
          <ArrowRight strokeWidth={2.25} className="w-5 h-5 sm:w-8 sm:h-8" />
        </a>
      </div>
    </div>
  )
}
