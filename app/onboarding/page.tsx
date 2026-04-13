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
      <div className="flex-1 px-5 pt-8 pb-40">

        {/* Header */}
        <div className="mb-7">
          <h1
            className="font-black text-gray-900 mb-2"
            style={{ fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.15 }}
          >
            Кто вы?
          </h1>
          <p
            className="text-gray-500 leading-snug"
            style={{ fontSize: 14.5 }}
          >
            Это поможет дать более точный диагноз и рекомендации
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {USER_TYPES.map((type) => {
            const active = selected === type.value
            return (
              <button
                key={type.value}
                onClick={() => setSelected(type.value)}
                className="relative flex flex-col items-center text-center rounded-[18px] px-4 pt-6 pb-5 transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: active ? '#f0fdf4' : '#ffffff',
                  border: `2px solid ${active ? '#16a34a' : 'rgba(0,0,0,0.07)'}`,
                  boxShadow: active
                    ? '0 4px 20px rgba(22,163,74,0.15), 0 1px 4px rgba(0,0,0,0.04)'
                    : '0 2px 12px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Check icon — top right */}
                {active && (
                  <span
                    className="absolute top-3 right-3 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                    style={{ background: '#16a34a' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.5 2.5L9 3" stroke="#fff" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}

                {/* Emoji */}
                <span style={{ fontSize: 36, lineHeight: 1 }}>{type.emoji}</span>

                {/* Title */}
                <span
                  className="mt-3 font-bold leading-tight"
                  style={{
                    fontSize: 14,
                    color: active ? '#16a34a' : '#111827',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {type.label}
                </span>

                {/* Description */}
                <span
                  className="mt-1.5 leading-snug"
                  style={{
                    fontSize: 11.5,
                    color: active ? '#16a34a99' : '#6b7280',
                    lineHeight: 1.4,
                  }}
                >
                  {type.description}
                </span>
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
          Продолжить
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
