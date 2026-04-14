'use client'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  active: 'home' | 'history' | 'profile'
}

export default function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 24px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-around px-6 pt-2 pb-4">

        {/* Главная */}
        <button
          onClick={() => router.push('/upload')}
          className="flex flex-col items-center gap-[5px] px-4 relative"
        >
          <div
            className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
            style={{ background: active === 'home' ? '#ecfdf5' : 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                 stroke={active === 'home' ? '#16a34a' : '#9ca3af'}
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <span
            style={{ fontSize: 9.5 }}
            className={active === 'home' ? 'font-bold text-emerald-600' : 'font-medium text-gray-400'}
          >
            Главная
          </span>
          {active === 'home' && (
            <span className="absolute -bottom-0.5 w-[18px] h-[3px] rounded-full bg-emerald-500" />
          )}
        </button>

        {/* История */}
        <button
          onClick={() => router.push('/history')}
          className="flex flex-col items-center gap-[5px] px-4 relative"
        >
          <div
            className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
            style={{ background: active === 'history' ? '#ecfdf5' : 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                 stroke={active === 'history' ? '#16a34a' : '#9ca3af'}
                 strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <span
            style={{ fontSize: 9.5 }}
            className={active === 'history' ? 'font-bold text-emerald-600' : 'font-medium text-gray-400'}
          >
            История
          </span>
          {active === 'history' && (
            <span className="absolute -bottom-0.5 w-[18px] h-[3px] rounded-full bg-emerald-500" />
          )}
        </button>

        {/* Профиль */}
        <button
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center gap-[5px] px-4 relative"
        >
          <div
            className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
            style={{ background: active === 'profile' ? '#ecfdf5' : 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                 stroke={active === 'profile' ? '#16a34a' : '#9ca3af'}
                 strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <span
            style={{ fontSize: 9.5 }}
            className={active === 'profile' ? 'font-bold text-emerald-600' : 'font-medium text-gray-400'}
          >
            Профиль
          </span>
          {active === 'profile' && (
            <span className="absolute -bottom-0.5 w-[18px] h-[3px] rounded-full bg-emerald-500" />
          )}
        </button>

      </div>
    </div>
  )
}
