'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const USER_TYPES = [
  { value: 'home',   emoji: '🌸', label: 'Домашний\nцветовод' },
  { value: 'dacha',  emoji: '🌱', label: 'Дачник' },
  { value: 'garden', emoji: '🌿', label: 'Садовод' },
  { value: 'farm',   emoji: '🚜', label: 'Фермер' },
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
      className="min-h-screen flex flex-col max-w-md mx-auto px-5"
      style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 60%)' }}
    >
      {/* Header */}
      <div className="pt-16 pb-10 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
          style={{ background: '#dcfce7', boxShadow: '0 4px 16px rgba(22,163,74,0.15)' }}
        >
          <span style={{ fontSize: 30 }}>🌿</span>
        </div>
        <h1
          className="font-bold text-gray-900 mb-2"
          style={{ fontSize: 26, fontFamily: 'Inter, sans-serif', letterSpacing: -0.5 }}
        >
          Кто вы?
        </h1>
        <p className="text-gray-500 text-sm">
          Выберите, чтобы мы точнее помогали вам
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {USER_TYPES.map((type) => {
          const active = selected === type.value
          return (
            <button
              key={type.value}
              onClick={() => setSelected(type.value)}
              className="flex flex-col items-center justify-center rounded-2xl py-6 px-3 transition-all duration-150 active:scale-[0.97]"
              style={{
                background: active ? '#f0fdf4' : '#ffffff',
                border: `2px solid ${active ? '#16a34a' : '#e5e7eb'}`,
                boxShadow: active
                  ? '0 4px 20px rgba(22,163,74,0.14)'
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: 36, lineHeight: 1 }}>{type.emoji}</span>
              <span
                className="mt-3 text-center font-semibold whitespace-pre-line"
                style={{
                  fontSize: 14,
                  color: active ? '#16a34a' : '#374151',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.3,
                }}
              >
                {type.label}
              </span>
              {active && (
                <span
                  className="mt-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#16a34a' }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Continue button */}
      <div className="py-8">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 active:scale-[0.98]"
          style={{
            fontFamily: 'Inter, sans-serif',
            background: selected ? '#16a34a' : '#e5e7eb',
            color: selected ? '#ffffff' : '#9ca3af',
            boxShadow: selected ? '0 4px 20px rgba(22,163,74,0.30)' : 'none',
            cursor: selected ? 'pointer' : 'default',
          }}
        >
          Продолжить
        </button>
      </div>
    </div>
  )
}
