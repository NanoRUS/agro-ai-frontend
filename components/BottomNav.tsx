'use client'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

interface BottomNavProps {
  active?: 'home' | 'history' | 'profile'
}

interface Ripple { id: number; x: number; y: number }
let _id = 0

function LiquidTab({
  label, icon, isActive, onClick,
}: {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = ++_id
    setRipples(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 460)
  }, [])

  return (
    <button
      onPointerDown={handlePointerDown}
      onClick={onClick}
      className="flex flex-col items-center gap-[5px]"
      style={{
        color: isActive ? '#1b4332' : 'rgba(27,67,50,0.40)',
        transform: 'scale(1)',
        transition: 'transform 120ms cubic-bezier(0.2,0.8,0.2,1)',
      }}
      onPointerUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      <div
        className="flex flex-col items-center gap-[5px] px-3 py-2 rounded-full"
        style={{
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: isActive ? 'blur(14px) saturate(140%)' : 'blur(10px) saturate(130%)',
          WebkitBackdropFilter: isActive ? 'blur(14px) saturate(140%)' : 'blur(10px) saturate(130%)',
          ...(isActive ? {
            background: 'rgba(255,255,255,0.58)',
            border: '1px solid rgba(27,67,50,0.26)',
            boxShadow: [
              'inset 0 1.5px 0 rgba(255,255,255,0.92)',
              'inset 0 -1px 0 rgba(0,0,0,0.07)',
              '0 0 12px rgba(27,67,50,0.16)',
              '0 2px 8px rgba(0,0,0,0.07)',
            ].join(', '),
          } : {
            background: 'rgba(255,255,255,0.26)',
            border: '1px solid rgba(255,255,255,0.44)',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.72)',
              'inset 0 -1px 0 rgba(0,0,0,0.03)',
            ].join(', '),
          }),
        }}
      >
        {/* Specular arc */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '52%',
            background: isActive
              ? 'linear-gradient(to bottom, rgba(255,255,255,0.44), rgba(255,255,255,0))'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0))',
            borderRadius: '9999px 9999px 50% 50%',
            pointerEvents: 'none',
          }}
        />

        {/* Ripples */}
        {ripples.map(r => (
          <span
            key={r.id}
            aria-hidden
            style={{
              position: 'absolute',
              left: r.x, top: r.y,
              width: 10, height: 10,
              marginLeft: -5, marginTop: -5,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0) 68%)',
              animation: 'liquid-ripple 440ms cubic-bezier(0.2,0.8,0.2,1) forwards',
              pointerEvents: 'none',
            }}
          />
        ))}

        {icon}
        <span style={{
          fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase' as const,
          position: 'relative',
        }}>
          {label}
        </span>
      </div>
    </button>
  )
}

export default function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()

  const tabs = [
    {
      key: 'home' as const,
      label: 'Обзор',
      path: '/upload',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
             stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      key: 'history' as const,
      label: 'История',
      path: '/history',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
             stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      ),
    },
    {
      key: 'profile' as const,
      label: 'Профиль',
      path: '/profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
             stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <style>{`
        @keyframes liquid-ripple {
          from { transform: scale(0); opacity: 0.38; }
          to   { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
      <div
        className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto"
        style={{
          background: 'rgba(248,250,248,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -4px 12px rgba(25,28,27,0.04)',
        }}
      >
        <div
          className="flex items-center justify-around px-6 pt-2"
          style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
        >
          {tabs.map(({ key, label, path, icon }) => (
            <LiquidTab
              key={key}
              label={label}
              icon={icon}
              isActive={active === key}
              onClick={() => router.push(path)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
