'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface BottomNavProps {
  active?: 'home' | 'history' | 'profile'
}

function Tab({ label, icon, isActive, onClick }: {
  label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void
}) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => { setPressed(true); setTimeout(onClick, 80) }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: isActive ? '#f8faf8' : 'rgba(27,67,50,0.40)',
        userSelect: 'none', WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none' as any, touchAction: 'manipulation',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        transition: pressed ? 'transform 80ms ease-out' : 'transform 200ms ease-out',
      }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        padding: '8px 14px', borderRadius: 9999,
        background: isActive ? '#1b4332' : 'transparent',
        boxShadow: isActive ? '0 2px 8px rgba(27,67,50,0.28)' : 'none',
        transition: 'background 150ms ease, box-shadow 150ms ease',
      }}>
        {icon}
        <span style={{
          fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase' as const,
          lineHeight: 1,
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
      key: 'home' as const, label: 'Обзор', path: '/upload',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    },
    {
      key: 'history' as const, label: 'История', path: '/history',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
    },
    {
      key: 'profile' as const, label: 'Профиль', path: '/profile',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto" style={{
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
    }}>
      <div className="flex items-center justify-around px-4 pt-2"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        {tabs.map(({ key, label, path, icon }) => (
          <Tab key={key} label={label} icon={icon}
            isActive={active === key}
            onClick={() => router.push(path)} />
        ))}
      </div>
    </div>
  )
}
