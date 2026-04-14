'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Trash2, ArrowRight, TrendingDown, Leaf, BarChart2, AlertTriangle } from 'lucide-react'
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

function urgencyMeta(level: string) {
  return ({
    critical: { label: 'Критично', color: '#dc2626', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.22)' },
    high:     { label: 'Срочно',   color: '#ea580c', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.22)' },
    medium:   { label: 'Внимание', color: '#d97706', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)' },
    low:      { label: 'Норма',    color: '#16a34a', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.20)'  },
  } as Record<string, { label: string; color: string; bg: string; border: string }>)[level]
    ?? { label: 'Норма', color: '#16a34a', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.20)' }
}

const FARMER_PLAN = [
  { n: '1', title: 'Оценка угрозы для всего поля',     desc: 'Масштаб проблемы и зоны риска' },
  { n: '2', title: 'План действий на ближайшие 3 дня', desc: 'Конкретные шаги по культуре и симптому' },
  { n: '3', title: 'Как снизить риск потерь урожая',   desc: 'Превентивные меры и обработка' },
]

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

  const isFarmer = userType === 'farm'
  const typeMeta = USER_TYPE_META[userType ?? ''] ?? null
  const recent   = history.slice(0, 3)

  /* ── FARMER LAYOUT ─────────────────────────────────────────────────── */
  if (isFarmer) {
    return (
      <div style={{ background: '#f2f4f2', color: '#191c1b', minHeight: 'max(884px, 100dvh)' }}>

        {/* TopAppBar */}
        <header
          className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6"
          style={{ height: 64, background: '#f2f4f2', maxWidth: 448, margin: '0 auto' }}
        >
          <div style={{ width: 40 }} />
          <h1 style={{
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700, fontSize: 18, color: '#012d1d', letterSpacing: '-0.01em',
          }}>
            Профиль
          </h1>
          <div style={{ width: 40 }} />
        </header>

        <main className="px-4" style={{ paddingTop: 80, paddingBottom: 120 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Farmer hero card ── */}
            <div style={{
              background: 'linear-gradient(135deg, #1b4332 0%, #012d1d 100%)',
              borderRadius: '1.5rem',
              padding: '24px 24px 20px',
              boxShadow: '0 8px 32px rgba(1,45,29,0.28), 0 2px 8px rgba(0,0,0,0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background texture */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 110% -10%, rgba(174,238,203,0.12) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              {/* Identity row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, position: 'relative' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(174,238,203,0.18)',
                  border: '1.5px solid rgba(174,238,203,0.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>
                  🚜
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                    fontWeight: 800, fontSize: 20, color: '#f8faf8',
                    letterSpacing: '-0.03em', marginBottom: 2,
                  }}>
                    Фермер
                  </p>
                  {farmerField && (
                    <p style={{ fontSize: 13, color: 'rgba(174,238,203,0.70)', fontWeight: 500 }}>
                      Поле: {farmerField}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/onboarding')}
                  style={{
                    padding: '6px 14px', borderRadius: 9999,
                    background: 'rgba(174,238,203,0.15)',
                    border: '1px solid rgba(174,238,203,0.28)',
                    color: '#aeeecb', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Изменить
                </button>
              </div>

              {/* Crops */}
              {farmerCrops.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, position: 'relative' }}>
                  {farmerCrops.map((c) => (
                    <span key={c} style={{
                      background: 'rgba(174,238,203,0.14)',
                      border: '1px solid rgba(174,238,203,0.25)',
                      color: '#aeeecb', borderRadius: 9999,
                      padding: '5px 14px', fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <Leaf size={11} strokeWidth={2} />
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, position: 'relative',
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '0.875rem', padding: '12px 14px',
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#f8faf8',
                    fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                    letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {history.length}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(174,238,203,0.60)', marginTop: 4, fontWeight: 500 }}>
                    диагностик
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '0.875rem', padding: '12px 14px',
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#f8faf8',
                    fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                    letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {farmerCrops.length || '—'}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(174,238,203,0.60)', marginTop: 4, fontWeight: 500 }}>
                    культур
                  </p>
                </div>
              </div>
            </div>

            {/* ── История диагностик ── */}
            <div style={{
              background: '#ffffff', borderRadius: '1.5rem',
              padding: '20px 20px 16px',
              boxShadow: '0 2px 12px rgba(25,28,27,0.06)',
              border: '1px solid rgba(193,200,194,0.14)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: '#717973',
                }}>
                  Последние диагностики
                </p>
                <button
                  onClick={() => router.push('/history')}
                  style={{
                    fontSize: 12, fontWeight: 600, color: '#2c694e',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  Все <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>

              {recent.length === 0 ? (
                <div style={{
                  padding: '24px 0', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>Нет диагностик</p>
                  <p style={{ fontSize: 12, color: '#c0c8c1' }}>Сфотографируйте растение на главной</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recent.map((entry) => {
                    const urg = urgencyMeta(entry.urgencyLevel)
                    return (
                      <button
                        key={entry.id}
                        onClick={() => router.push('/history')}
                        className="w-full text-left transition-all active:scale-[0.99]"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px',
                          background: '#f8faf8',
                          borderRadius: '1rem',
                          border: '1px solid rgba(193,200,194,0.15)',
                          cursor: 'pointer',
                        }}
                      >
                        {entry.thumbnail ? (
                          <img src={entry.thumbnail} alt=""
                            style={{ width: 52, height: 52, borderRadius: '0.625rem', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 52, height: 52, borderRadius: '0.625rem',
                            background: '#e6e9e7', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Leaf size={20} strokeWidth={1.5} style={{ color: '#9ca3af' }} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <p style={{
                              fontWeight: 600, fontSize: 14, color: '#012d1d',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              flex: 1,
                            }}>
                              {entry.topIssueTitle ?? 'Здоровое растение'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontSize: 12, color: '#717973' }}>{entry.cropLabel}</p>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px',
                              borderRadius: 9999, background: urg.bg, color: urg.color,
                              border: `1px solid ${urg.border}`, letterSpacing: '0.03em',
                            }}>
                              {urg.label}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} strokeWidth={2} style={{ color: '#c1c8c2', flexShrink: 0 }} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Разбор от агронома — farmer-specific ── */}
            <div style={{
              background: 'linear-gradient(160deg, #1b4332 0%, #012d1d 100%)',
              borderRadius: '1.5rem', padding: '24px 24px 20px',
              boxShadow: '0 8px 40px rgba(1,45,29,0.32), 0 2px 8px rgba(0,0,0,0.10)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at -10% 120%, rgba(174,238,203,0.10) 0%, transparent 55%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative' }}>
                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '0.5rem',
                    background: 'rgba(174,238,203,0.15)',
                    border: '1px solid rgba(174,238,203,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrendingDown size={14} strokeWidth={2} style={{ color: '#aeeecb' }} />
                  </div>
                  <p style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: 'rgba(174,238,203,0.65)',
                  }}>
                    Агроном
                  </p>
                </div>

                {/* Headline */}
                <p style={{
                  fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                  fontWeight: 800, fontSize: 24, color: '#f8faf8',
                  letterSpacing: '-0.03em', lineHeight: 1.12, marginBottom: 8,
                }}>
                  Снизьте риск потерь урожая
                </p>
                <p style={{
                  fontSize: 14, color: 'rgba(248,250,248,0.58)',
                  marginBottom: 24, lineHeight: 1.5,
                }}>
                  Разбор ситуации на поле — с планом действий
                </p>

                {/* Action plan — numbered like RIGHT screenshot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {FARMER_PLAN.map((step) => (
                    <div key={step.n} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.875rem', padding: '12px 14px',
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: '#aeeecb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#012d1d' }}>{step.n}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f8faf8', marginBottom: 2 }}>
                          {step.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(248,250,248,0.50)', lineHeight: 1.4 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setPaywallOpen(true)}
                  className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    height: 56, borderRadius: '0.875rem',
                    background: '#aeeecb', border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                    fontWeight: 700, fontSize: 16, color: '#012d1d',
                    boxShadow: '0 4px 20px rgba(174,238,203,0.25)',
                  }}
                >
                  Получить разбор от агронома
                  <ArrowRight size={18} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* ── Действия ── */}
            <div style={{
              background: '#ffffff', borderRadius: '1.5rem', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(25,28,27,0.06)',
              border: '1px solid rgba(193,200,194,0.14)',
            }}>
              <button
                onClick={() => router.push('/onboarding')}
                className="w-full flex items-center justify-between transition-all active:bg-gray-50"
                style={{
                  height: 56, padding: '0 20px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
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
                  height: 56, padding: '0 20px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
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
          <PaywallModal mode="video" onClose={() => setPaywallOpen(false)} />
        )}
      </div>
    )
  }

  /* ── DEFAULT (non-farmer) LAYOUT ───────────────────────────────────── */
  return (
    <div style={{ background: '#f8faf8', color: '#191c1b', minHeight: 'max(884px, 100dvh)' }}>

      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6"
        style={{ height: 64, background: '#f8faf8', maxWidth: 448, margin: '0 auto' }}
      >
        <div style={{ width: 40 }} />
        <h1 style={{
          fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
          fontWeight: 700, fontSize: 18, color: '#012d1d', letterSpacing: '-0.01em',
        }}>
          Профиль
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <main className="px-5" style={{ paddingTop: 88, paddingBottom: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* User card */}
          <div style={{
            background: '#ffffff', borderRadius: '1.5rem', padding: 24,
            boxShadow: '0 2px 16px rgba(25,28,27,0.07)',
            border: '1px solid rgba(193,200,194,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#aeeecb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>
                {typeMeta?.emoji ?? '🌱'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                  fontWeight: 700, fontSize: 18, color: '#012d1d',
                  letterSpacing: '-0.02em', marginBottom: 2,
                }}>
                  {typeMeta?.label ?? 'Пользователь'}
                </p>
                <p style={{ fontSize: 13, color: '#717973' }}>Тип профиля</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                height: 44, borderRadius: '0.75rem', background: '#f2f4f2',
                border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#012d1d',
              }}
            >
              Изменить профиль
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* История */}
          <div style={{
            background: '#ffffff', borderRadius: '1.5rem', padding: 24,
            boxShadow: '0 2px 16px rgba(25,28,27,0.07)',
            border: '1px solid rgba(193,200,194,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#717973' }}>
                История диагностик
              </p>
              <button onClick={() => router.push('/history')}
                style={{ fontSize: 12, fontWeight: 600, color: '#2c694e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Все <ChevronRight size={13} strokeWidth={2.5} />
              </button>
            </div>
            {recent.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>Пока нет диагностик</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {recent.map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {entry.thumbnail ? (
                      <img src={entry.thumbnail} alt=""
                        style={{ width: 44, height: 44, borderRadius: '0.625rem', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: '0.625rem', background: '#f2f4f2', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#012d1d', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              style={{ height: 44, borderRadius: '0.75rem', background: '#f2f4f2', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#012d1d' }}>
              Открыть историю
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Premium */}
          <div style={{
            background: '#1b4332', borderRadius: '1.5rem', padding: 24,
            boxShadow: '0 4px 24px rgba(27,67,50,0.28)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(174,238,203,0.65)', marginBottom: 10 }}>
              Разбор от агронома
            </p>
            <p style={{ fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif', fontWeight: 800, fontSize: 22, color: '#f8faf8', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
              Персональные рекомендации
            </p>
            <p style={{ fontSize: 14, color: 'rgba(248,250,248,0.60)', marginBottom: 24, lineHeight: 1.5 }}>
              По вашей конкретной ситуации
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Почему растение болеет', 'Как его восстановить', 'Как избежать повторения'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#aeeecb', flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: 'rgba(248,250,248,0.85)', lineHeight: 1.4 }}>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setPaywallOpen(true)}
              className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ height: 56, borderRadius: '0.875rem', background: '#aeeecb', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#012d1d', boxShadow: '0 4px 16px rgba(0,0,0,0.22)' }}>
              Получить разбор
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* Действия */}
          <div style={{ background: '#ffffff', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(25,28,27,0.07)', border: '1px solid rgba(193,200,194,0.12)' }}>
            <button onClick={() => router.push('/onboarding')}
              className="w-full flex items-center justify-between transition-all active:bg-gray-50"
              style={{ height: 56, padding: '0 20px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid rgba(193,200,194,0.15)' }}>
              <span style={{ fontSize: 15, color: '#191c1b' }}>Сменить тип пользователя</span>
              <ChevronRight size={16} strokeWidth={2} style={{ color: '#9ca3af' }} />
            </button>
            <button onClick={handleClearData}
              className="w-full flex items-center justify-between transition-all active:bg-red-50"
              style={{ height: 56, padding: '0 20px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <span style={{ fontSize: 15, color: '#dc2626' }}>Очистить все данные</span>
              <Trash2 size={16} strokeWidth={2} style={{ color: '#dc2626' }} />
            </button>
          </div>

        </div>
      </main>

      <BottomNav active="profile" />

      {paywallOpen && (
        <PaywallModal mode="video" onClose={() => setPaywallOpen(false)} />
      )}
    </div>
  )
}
