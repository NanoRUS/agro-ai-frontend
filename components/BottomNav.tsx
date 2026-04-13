'use client'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  /** Which tab is currently active */
  active: 'home' | 'scan' | 'history'
  /** Called when the Scan tab is tapped — caller owns the camera trigger */
  onScan: () => void
}

export default function BottomNav({ active, onScan }: BottomNavProps) {
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

        {/* Home */}
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

        {/* Scan — action, not a route */}
        <button
          onClick={onScan}
          className="flex flex-col items-center gap-[5px] px-4 transition-all duration-150 active:scale-[0.93]"
          style={{ color: '#9ca3af' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
               stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span style={{ fontSize: 9.5 }} className="font-medium">Сканер</span>
        </button>

        {/* История */}
        <button
          onClick={() => router.push('/history')}
          className="flex flex-col items-center gap-[5px] px-4"
          style={{ color: active === 'history' ? '#16a34a' : '#9ca3af' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
               stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
          <span style={{ fontSize: 9.5 }} className="font-medium">История</span>
        </button>

      </div>
    </div>
  )
}
