'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MoreVertical, ArrowRight } from 'lucide-react'

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
    description: 'Огород и выращивание для себя',
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
    <div style={{ background: '#f8faf8', color: '#191c1b', minHeight: 'max(884px, 100dvh)' }}>

      {/* TopAppBar — fixed, from code.html header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6"
        style={{ height: 64, background: '#f8faf8', maxWidth: 448, margin: '0 auto' }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full transition-colors active:scale-95"
          style={{ color: '#012d1d' }}
        >
          <X size={24} strokeWidth={2} />
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            color: '#012d1d',
            letterSpacing: '-0.01em',
          }}
        >
          Диагностика
        </h1>
        <button className="p-2 rounded-full" style={{ color: '#012d1d' }}>
          <MoreVertical size={24} strokeWidth={2} />
        </button>
      </header>

      {/* Main — pt-24 pb-32 px-6 max-w-2xl mx-auto from code.html */}
      <main className="px-6" style={{ paddingTop: 96, paddingBottom: 128 }}>

        {/* Header section — mb-12 from code.html */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: '#012d1d',
              marginBottom: 12,
            }}
          >
            Кто вы?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(65,72,68,0.80)', lineHeight: 1.5 }}>
            Это поможет дать более точные рекомендации
          </p>
        </section>

        {/* Cards — grid-cols-1 gap-6 from code.html (md:grid-cols-2 omitted — layout is max-w-md) */}
        <div className="grid grid-cols-1" style={{ gap: 24 }}>
          {USER_TYPES.map((type) => {
            const active = selected === type.value
            return (
              <div
                key={type.value}
                onClick={() => setSelected(type.value)}
                className="group relative cursor-pointer transition-all duration-200"
                style={{
                  background: '#ffffff',
                  padding: 32,
                  borderRadius: '3rem',
                  border: active ? '2px solid #2c694e' : '1px solid rgba(193,200,194,0.10)',
                  boxShadow: active
                    ? '0 0 0 2px #2c694e, 0 16px 48px rgba(25,28,27,0.08)'
                    : '0px 4px 12px rgba(25,28,27,0.04)',
                }}
              >
                {/* Check badge — absolute top-4 right-4 from code.html */}
                {active && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      top: 16, right: 16,
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: '#2c694e',
                      color: '#ffffff',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* flex flex-col gap-6 from code.html */}
                <div className="flex flex-col" style={{ gap: 24 }}>
                  {/* Icon — w-14 h-14 rounded-full from code.html */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: active ? '#aeeecb' : '#f2f4f2',
                      fontSize: 28,
                      flexShrink: 0,
                    }}
                  >
                    {type.emoji}
                  </div>

                  {/* Text block */}
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: 20,
                        color: '#012d1d',
                        marginBottom: 4,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                      }}
                    >
                      {type.label}
                    </h3>
                    <p style={{ fontSize: 14, color: '#414844', lineHeight: 1.5 }}>
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Decorative image — mt-12 rounded-xl h-48 from code.html */}
        <div
          style={{
            marginTop: 48,
            borderRadius: '1rem',
            overflow: 'hidden',
            height: 192,
            position: 'relative',
          }}
        >
          <img
            src="/categories/fungal.jpg"
            alt="Органическая текстура листьев растения"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(1,45,29,0.40), transparent)',
            }}
          />
        </div>
      </main>

      {/* Sticky footer CTA — fixed bottom-0 from code.html */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          padding: 24,
          background: 'rgba(248,250,248,0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          maxWidth: 448,
          margin: '0 auto',
        }}
      >
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-3 transition-all active:scale-95 duration-200"
          style={{
            height: 64,
            borderRadius: '1rem',
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            background: selected ? '#1b4332' : '#e1e3e1',
            color: selected ? '#b1f0ce' : '#717973',
            boxShadow: selected ? '0 8px 24px rgba(0,0,0,0.28)' : 'none',
            cursor: selected ? 'pointer' : 'default',
          }}
        >
          Продолжить
          <ArrowRight size={22} strokeWidth={2} />
        </button>
      </footer>
    </div>
  )
}
