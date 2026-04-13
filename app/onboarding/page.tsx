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
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto"
      style={{ background: '#f0f2f5', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Scrollable content */}
      <div className="flex-1 px-5 pt-10 pb-44">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-black text-gray-900 mb-2"
            style={{ fontSize: 32, letterSpacing: '-0.04em', lineHeight: 1.1 }}
          >
            Кто вы?
          </h1>
          <p
            className="text-gray-500 leading-snug"
            style={{ fontSize: 15 }}
          >
            Это поможет дать более точные рекомендации
          </p>
        </div>

        {/* Vertical list */}
        <div className="flex flex-col gap-4">
          {USER_TYPES.map((type) => {
            const active = selected === type.value
            return (
              <button
                key={type.value}
                onClick={() => setSelected(type.value)}
                className="relative w-full flex flex-row items-center gap-4 rounded-[20px] px-5 py-5 text-left transition-all duration-150 active:scale-[0.98]"
                style={{
                  minHeight: 90,
                  background: active ? '#f0fdf4' : '#ffffff',
                  border: `2px solid ${active ? '#16a34a' : 'rgba(0,0,0,0.07)'}`,
                  boxShadow: active
                    ? '0 6px 24px rgba(22,163,74,0.16), 0 2px 8px rgba(0,0,0,0.05)'
                    : '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Icon in rounded square */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-[14px]"
                  style={{
                    width: 52,
                    height: 52,
                    background: active ? 'rgba(22,163,74,0.10)' : '#f3f4f6',
                    fontSize: 26,
                  }}
                >
                  {type.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold leading-tight"
                    style={{
                      fontSize: 16,
                      color: active ? '#16a34a' : '#111827',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {type.label}
                  </p>
                  <p
                    className="mt-1 leading-snug"
                    style={{
                      fontSize: 13,
                      color: active ? '#16a34a99' : '#6b7280',
                    }}
                  >
                    {type.description}
                  </p>
                </div>

                {/* Check icon — top right */}
                {active && (
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#16a34a' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pt-4 pb-8"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full font-black tracking-wide transition-all duration-150 active:scale-[0.98] active:brightness-95"
          style={{
            height: 54,
            borderRadius: 16,
            fontSize: 16,
            fontFamily: 'Inter, sans-serif',
            background: selected
              ? 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)'
              : '#e5e7eb',
            color: selected ? '#022c17' : '#9ca3af',
            boxShadow: selected
              ? '0 6px 24px rgba(34,197,94,0.40), 0 1px 4px rgba(0,0,0,0.12)'
              : 'none',
            cursor: selected ? 'pointer' : 'default',
            border: 'none',
          }}
        >
          Продолжить →
        </button>
        <p
          className="text-center mt-2.5"
          style={{ fontSize: 11.5, color: '#9ca3af' }}
        >
          Вы сможете изменить выбор позже
        </p>
      </div>
    </div>
  )
}
