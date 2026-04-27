'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface BottomNavProps {
  active?: 'home' | 'history' | 'profile'
}

function LiquidTab({
  label, icon, isActive, onClick,
}: {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={onClick}
      onPointerDown={() => isActive && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: isActive ? '#1b4332' : 'rgba(27,67,50,0.40)',
        userSelect: 'none',
        transform: pressed ? 'scale(0.96, 0.92)' : 'scale(1)',
        transition: pressed
          ? 'transform 80ms ease-out'
          : 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          padding: '8px 12px',
          borderRadius: 9999,
          ...(isActive ? {
            background: 'rgba(255,255,255,0.58)',
            backdropFilter: 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            border: '1px solid rgba(27,67,50,0.26)',
            boxShadow: pressed
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(0,0,0,0.07), 0 0 4px rgba(27,67,50,0.08), 0 1px 2px rgba(0,0,0,0.04)'
              : 'inset 0 1.5px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(0,0,0,0.07), 0 0 12px rgba(27,67,50,0.16), 0 2px 8px rgba(0,0,0,0.07)',
            transition: 'box-shadow 120ms ease',
          } : {
            background: 'none',
            border: 'none',
            boxShadow: 'none',
          }),
        }}
      >
        {isActive && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: pressed ? 3 : 0,
              left: 0, right: 0,
              height: '52%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.44), rgba(255,255,255,0))',
              borderRadius: '9999px 9999px 50% 50%',
              pointerEvents: 'none',
              transition: pressed ? 'top 80ms ease-out' : 'top 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        )}
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
  )
}
