'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, ChevronRight, Trash2, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import PaywallModal from '@/components/paywall/PaywallModal'
import { getHistory } from '@/lib/history'
import type { HistoryEntry } from '@/lib/history'

const USER_TYPE_META: Record<string, { label: string; emoji: string }> = {
  home:   { label: 'Домашний цветовод', emoji: '🌸' },
  dacha:  { label: 'Дачник',            emoji: '🌱' },
  garden: { label: 'Садовод',           emoji: '🌿' },
  farm:   { label: 'Фермер',            emoji: '🚜' },
}

export default function ProfilePage() {
  const router = useRouter()

  const [userType,    setUserType]    = useState<string | null>(null)
  const [farmerCrops, setFarmerCrops] = useState<string[]>([])
  const [farmerField, setFarmerField] = useState<string>('')
  const [history,     setHistory]     = useState<HistoryEntry[]>([])
  const [paywallOpen, setPaywallOpen] = useState(false)

  useEffect(() => {
    setUserType(localStorage.getItem('userType'))
    setHistory(getHistory())
    try {
      const crops = JSON.parse(sessionStorage.getItem('agro_farmer_crops') || '[]') as string[]
      const field = JSON.parse(sessionStorage.getItem('agro_farmer_field') || '{}') as { name?: string }
      setFarmerCrops(crops)
      setFarmerField(field.name ?? '')
    } catch {}
  }, [])

  function handleClearData() {
    localStorage.removeItem('agro_history')
    localStorage.removeItem('userType')
    sessionStorage.removeItem('agro_farmer_crops')
    sessionStorage.removeItem('agro_farmer_field')
    router.replace('/onboarding')
  }

  const isFarmer   = userType === 'farm'
  const typeMeta   = USER_TYPE_META[userType ?? ''] ?? null
  const recent     = history.slice(0, 3)

  return (
    <div style={{ background: '#f8faf8', color: '#191c1b', minHeight: 'max(884px, 100dvh)' }}>

      {/* TopAppBar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6"
        style={{ height: 64, background: '#f8faf8', maxWidth: 448, margin: '0 auto' }}
      >
        <div style={{ width: 40 }} />
        <h1
          style={{
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            color: '#012d1d',
            letterSpacing: '-0.01em',
          }}
        >
          Профиль
        </h1>
        <button className="p-2 rounded-full" style={{ color: '#012d1d' }}>
          <MoreVertical size={24} strokeWidth={2} />
        </button>
      </header>

      <main className="px-5" style={{ paddingTop: 88, paddingBottom: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Карточка пользователя ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1.5rem',
              padding: 24,
              boxShadow: '0 2px 16px rgba(25,28,27,0.07)',
              border: '1px solid rgba(193,200,194,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: isFarmer && farmerCrops.length > 0 ? 20 : 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#aeeecb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {typeMeta?.emoji ?? '🌱'}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#012d1d',
                    letterSpacing: '-0.02em',
                    marginBottom: 2,
                  }}
                >
                  {typeMeta?.label ?? 'Пользователь'}
                </p>
                <p style={{ fontSize: 13, color: '#717973' }}>Тип профиля</p>
              </div>
            </div>

            {/* Farmer context: crops + field */}
            {isFarmer && farmerCrops.length > 0 && (
              <div
                style={{
                  background: '#f2f4f2',
                  borderRadius: '1rem',
                  padding: '14px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {farmerCrops.map((c) => (
                    <span
                      key={c}
                      style={{
                        background: '#1b4332',
                        color: '#aeeecb',
                        borderRadius: 9999,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {farmerField && (
                  <p style={{ fontSize: 13, color: '#414844' }}>
                    Поле: <strong style={{ color: '#012d1d' }}>{farmerField}</strong>
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => router.push('/onboarding')}
              className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                height: 44,
                borderRadius: '0.75rem',
                background: '#f2f4f2',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: '#012d1d',
              }}
            >
              Изменить профиль
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* ── История диагностик ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1.5rem',
              padding: 24,
              boxShadow: '0 2px 16px rgba(25,28,27,0.07)',
              border: '1px solid rgba(193,200,194,0.12)',
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#717973',
                marginBottom: 16,
              }}
            >
              История диагностик
            </p>

            {recent.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
                Пока нет диагностик
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {recent.map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {entry.thumbnail ? (
                      <img
                        src={entry.thumbnail}
                        alt=""
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '0.625rem',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '0.625rem',
                          background: '#f2f4f2',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: '#012d1d',
                          marginBottom: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.topIssueTitle ?? 'Здоровое растение'}
                      </p>
                      <p style={{ fontSize: 12, color: '#717973' }}>{entry.cropLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push('/history')}
              className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                height: 44,
                borderRadius: '0.75rem',
                background: '#f2f4f2',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: '#012d1d',
              }}
            >
              Открыть историю
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* ── Разбор от агронома (монетизация) ── */}
          <div
            style={{
              background: '#1b4332',
              borderRadius: '1.5rem',
              padding: 24,
              boxShadow: '0 4px 24px rgba(27,67,50,0.28)',
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(174,238,203,0.65)',
                marginBottom: 10,
              }}
            >
              Разбор от агронома
            </p>
            <p
              style={{
                fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                fontWeight: 800,
                fontSize: 22,
                color: '#f8faf8',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: 6,
              }}
            >
              Персональные рекомендации
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(248,250,248,0.60)',
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              По вашей конкретной ситуации
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {(isFarmer
                ? [
                    'Анализ ситуации на поле',
                    'Что делать в ближайшие дни',
                    'Как снизить риск потерь',
                  ]
                : [
                    'Почему растение болеет',
                    'Как его восстановить',
                    'Как избежать повторения',
                  ]
              ).map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#aeeecb',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 15, color: 'rgba(248,250,248,0.85)', lineHeight: 1.4 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setPaywallOpen(true)}
              className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{
                height: 56,
                borderRadius: '0.875rem',
                background: '#aeeecb',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#012d1d',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              }}
            >
              Получить разбор
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* ── Действия ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(25,28,27,0.07)',
              border: '1px solid rgba(193,200,194,0.12)',
            }}
          >
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full flex items-center justify-between transition-all active:bg-gray-50"
              style={{
                height: 56,
                padding: '0 20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(193,200,194,0.15)',
              }}
            >
              <span style={{ fontSize: 15, color: '#191c1b' }}>Сменить тип пользователя</span>
              <ChevronRight size={16} strokeWidth={2} style={{ color: '#9ca3af' }} />
            </button>
            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-between transition-all active:bg-red-50"
              style={{
                height: 56,
                padding: '0 20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 15, color: '#dc2626' }}>Очистить все данные</span>
              <Trash2 size={16} strokeWidth={2} style={{ color: '#dc2626' }} />
            </button>
          </div>

        </div>
      </main>

      <BottomNav active="profile" />

      {paywallOpen && (
        <PaywallModal
          mode="video"
          onClose={() => setPaywallOpen(false)}
        />
      )}
    </div>
  )
}
