'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const USER_TYPES = [
  {
    value: 'home',
    emoji: '🌸',
    label: 'Домашний цветовод',
    description: 'Комнатные растения и уход за ними',
  },
  {
    value: 'dacha',
    emoji: '🌱',
    label: 'Дачник',
    description: 'Огород и растения для себя',
  },
  {
    value: 'garden',
    emoji: '🌿',
    label: 'Садовод',
    description: 'Сад, ягоды и регулярный уход',
  },
  {
    value: 'farm',
    emoji: '🚜',
    label: 'Фермер',
    description: 'Поля и коммерческое выращивание',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    localStorage.setItem('userType', selected)
    router.push('/upload')
  }

  return (
    /* Full viewport background */
    <div className="min-h-screen w-full" style={{ background: '#f0f2f5', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col">

        {/* Scrollable content */}
        <div className="flex-1 px-4 pt-12 pb-44">

          {/* Header */}
          <div className="mb-8 px-1">
            <h1
              className="font-black text-gray-900 mb-3"
              style={{ fontSize: 34, letterSpacing: '-0.04em', lineHeight: 1.05 }}
            >
              Кто вы?
            </h1>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.5 }}>
              Это поможет дать более точные рекомендации
            </p>
          </div>

          {/* Vertical list */}
          <div className="flex flex-col gap-3">
            {USER_TYPES.map((type) => {
              const active = selected === type.value
              return (
                <button
                  key={type.value}
                  onClick={() => setSelected(type.value)}
                  className="relative w-full flex flex-row items-center gap-4 text-left transition-all duration-150 active:scale-[0.985]"
                  style={{
                    minHeight: 100,
                    padding: '20px 20px',
                    borderRadius: 20,
                    background: active ? '#f0fdf4' : '#ffffff',
                    border: `2px solid ${active ? '#16a34a' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: active
                      ? '0 8px 28px rgba(22,163,74,0.18), 0 2px 8px rgba(0,0,0,0.06)'
                      : '0 2px 16px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Icon square */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: active ? 'rgba(22,163,74,0.12)' : '#f3f4f6',
                      fontSize: 28,
                    }}
                  >
                    {type.emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold"
                      style={{
                        fontSize: 17,
                        color: active ? '#16a34a' : '#111827',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.3,
                      }}
                    >
                      {type.label}
                    </p>
                    <p
                      className="mt-1"
                      style={{
                        fontSize: 13.5,
                        color: active ? '#16a34aaa' : '#9ca3af',
                        lineHeight: 1.4,
                      }}
                    >
                      {type.description}
                    </p>
                  </div>

                  {/* Check */}
                  {active && (
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#16a34a',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 6.5l3 3 5-5" stroke="#fff" strokeWidth="2.2"
                              strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sticky CTA */}
        <div
          className="fixed bottom-0 left-1/2 w-full max-w-[430px] px-4 pt-4 pb-8"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 -4px 28px rgba(0,0,0,0.07)',
          }}
        >
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full font-black transition-all duration-150 active:scale-[0.98] active:brightness-95"
            style={{
              height: 56,
              borderRadius: 16,
              fontSize: 16,
              letterSpacing: '0.01em',
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              background: selected
                ? 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)'
                : '#e5e7eb',
              color: selected ? '#022c17' : '#9ca3af',
              boxShadow: selected
                ? '0 8px 28px rgba(34,197,94,0.45), 0 2px 6px rgba(0,0,0,0.12)'
                : 'none',
              cursor: selected ? 'pointer' : 'default',
            }}
          >
            Продолжить →
          </button>
          <p className="text-center mt-2.5" style={{ fontSize: 12, color: '#b0b7c3' }}>
            Вы сможете изменить выбор позже
          </p>
        </div>

      </div>
    </div>
  )
}
