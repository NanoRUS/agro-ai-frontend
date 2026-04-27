'use client'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  active?: 'home' | 'history' | 'profile'
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
        background: 'rgba(248,250,248,0.94)',
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
        {tabs.map(({ key, label, path, icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => router.push(path)}
              className="flex flex-col items-center gap-[5px] transition-all duration-150 active:scale-[0.93]"
              style={{ color: isActive ? '#1a4a30' : 'rgba(27,67,50,0.42)' }}
            >
              <div
                className="flex flex-col items-center gap-[5px] px-3 py-2 rounded-full"
                style={isActive ? {
                  background: 'rgba(255,255,255,0.70)',
                  border: '1px solid rgba(27,67,50,0.28)',
                  boxShadow: '0 0 11px rgba(27,67,50,0.18), 0 2px 6px rgba(27,67,50,0.10), inset 0 1px 0 rgba(255,255,255,0.80)',
                } : {
                  background: 'rgba(255,255,255,0.28)',
                  border: '1px solid transparent',
                  boxShadow: 'none',
                }}
              >
                {icon}
                <span style={{
                  fontSize: 9.5, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase' as const,
                }}>
                  {label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
