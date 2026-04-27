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
      onPointerDown={() => { setPressed(true); setTimeout(onClick, 110) }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: isActive ? '#f8faf8' : 'rgba(27,67,50,0.50)',
        userSelect: 'none', WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none' as any, touchAction: 'manipulation',
        transform: pressed ? 'scale(0.86)' : 'scale(1)',
        transition: pressed
          ? 'transform 60ms ease-out'
          : 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        padding: '8px 14px', borderRadius: 9999,
        background: isActive ? '#1b4332' : 'transparent',
        boxShadow: isActive ? '0 2px 10px rgba(27,67,50,0.35)' : 'none',
      }}>
        {icon}
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const }}>
          {label}
        </span>
      </div>
    </button>
  )
}

export default function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()
  const tabs = [
    { key: 'home' as const, label: 'Обзор', path: '/upload', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { key: 'history' as const, label: 'История', path: '/history', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> },
    { key: 'profile' as const, label: 'Профиль', path: '/profile', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto" style={{
      background: 'rgba(248,250,248,0.88)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 -1px 0 rgba(0,0,0,0.04)',
    }}>
      <div className="flex items-center justify-around px-4 pt-2"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        {tabs.map(({ key, label, path, icon }) => (
          <Tab key={key} label={label} icon={icon} isActive={active === key} onClick={() => router.push(path)} />
        ))}
      </div>
    </div>
  )
}
