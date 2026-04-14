'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MoreVertical, ArrowRight, Plus, MapPin } from 'lucide-react'

// ── Stitch color tokens ────────────────────────────────────────────────────────
const C = {
  surface:              '#f8faf8',
  surfaceContainerLow:  '#f2f4f2',
  surfaceContainerHigh: '#e6e9e7',
  surfaceContainerHighest: '#e1e3e1',
  surfaceContainerLowest: '#ffffff',
  primary:              '#012d1d',
  primaryContainer:     '#1b4332',
  onPrimaryContainer:   '#86af99',
  secondary:            '#2c694e',
  secondaryContainer:   '#aeeecb',
  onSecondaryContainer: '#316e52',
  onSurface:            '#191c1b',
  onSurfaceVariant:     '#414844',
  outline:              '#717973',
  outlineVariant:       '#c1c8c2',
}

const CROPS = ['Пшеница', 'Кукуруза', 'Подсолнечник', 'Картофель', 'Рапс', 'Соя']

export default function FarmerSetupPage() {
  const router = useRouter()
  const [selectedCrops, setSelectedCrops] = useState<string[]>([])
  const [fieldName, setFieldName]         = useState('')
  const [fieldArea, setFieldArea]         = useState('')

  function toggleCrop(crop: string) {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    )
  }

  function handleNext() {
    sessionStorage.setItem('agro_farmer_crops', JSON.stringify(selectedCrops))
    sessionStorage.setItem('agro_farmer_field', JSON.stringify({ name: fieldName, area: fieldArea }))
    router.push('/upload')
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: C.surface, color: C.onSurface, fontFamily: 'Inter, sans-serif',
               minHeight: 'max(884px, 100dvh)' }}
    >

      {/* ── TopAppBar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6"
        style={{ height: 64, background: C.surface }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full transition-colors active:scale-95 duration-200"
          style={{ color: C.primary }}
        >
          <X size={24} strokeWidth={2} />
        </button>
        <h1 style={{
          fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
          fontWeight: 700, fontSize: 18, color: C.primary, letterSpacing: '-0.01em',
        }}>
          Диагностика
        </h1>
        <button className="p-2 rounded-full" style={{ color: C.primary }}>
          <MoreVertical size={24} strokeWidth={2} />
        </button>
      </header>

      {/* ── Main ── pt-24 pb-32 px-6 from code.html */}
      <main className="flex-grow px-6" style={{ paddingTop: 96, paddingBottom: 128 }}>

        {/* Progress indicator — mb-12 from code.html */}
        <div style={{ marginBottom: 48 }}>
          <div className="flex justify-between items-end" style={{ marginBottom: 16 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: C.secondary,
            }}>
              Шаг 2 из 4
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: C.onSurfaceVariant,
            }}>
              50% завершено
            </span>
          </div>
          {/* h-1.5 bg-surface-container-high rounded-full */}
          <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: C.surfaceContainerHigh }}>
            <div className="h-full rounded-full" style={{ width: '50%', background: C.primary }} />
          </div>
        </div>

        {/* ── Section 1: Crops — mb-16 from code.html ── */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em',
            color: C.primary, lineHeight: 1.15, marginBottom: 8,
          }}>
            Какие культуры вы выращиваете?
          </h2>
          <p style={{ fontSize: 16, color: C.onSurfaceVariant, lineHeight: 1.5, marginBottom: 32 }}>
            Выберите основные культуры для точного мониторинга заболеваний.
          </p>

          {/* flex flex-wrap gap-3 from code.html */}
          <div className="flex flex-wrap" style={{ gap: 12 }}>

            {/* Crop chips */}
            {CROPS.map((crop) => {
              const sel = selectedCrops.includes(crop)
              return sel ? (
                /* selected: bg-primary-container text-on-primary-container rounded-full shadow-sm */
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className="flex items-center gap-2 font-bold transition-all active:scale-95"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 9999,
                    background: C.primaryContainer,
                    color: C.onPrimaryContainer,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    border: 'none',
                    fontSize: 15,
                  }}
                >
                  {crop}
                  {/* check_circle FILL=1 substitute */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd"
                      d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.47 5.47a.75.75 0 011.06 1.06l-5 5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L7 9.94l4.47-4.47z" />
                  </svg>
                </button>
              ) : (
                /* unselected: border border-outline-variant bg-surface-container-lowest */
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className="font-medium transition-all active:scale-95"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 9999,
                    background: C.surfaceContainerLowest,
                    color: C.primary,
                    border: `1px solid ${C.outlineVariant}`,
                    fontSize: 15,
                  }}
                >
                  {crop}
                </button>
              )
            })}

            {/* "Добавить культуру" — dashed border from code.html */}
            <button
              className="flex items-center gap-2 font-medium transition-colors active:scale-95"
              style={{
                padding: '12px 24px',
                borderRadius: 9999,
                background: 'transparent',
                color: C.secondary,
                border: `1px dashed ${C.outline}`,
                fontSize: 15,
              }}
            >
              <Plus size={18} strokeWidth={2} />
              Добавить культуру
            </button>

            {/* "Другая культура" — ghost, no border */}
            <button
              className="font-medium transition-colors active:scale-95"
              style={{
                padding: '12px 24px',
                borderRadius: 9999,
                background: 'transparent',
                color: C.onSurfaceVariant,
                border: 'none',
                fontSize: 15,
              }}
            >
              Другая культура
            </button>
          </div>
        </section>

        {/* ── Section 2: Field Creation — mb-16 from code.html ── */}
        <section style={{ marginBottom: 64 }}>

          {/* Section header: flex items-center gap-4 mb-8 */}
          <div className="flex items-center" style={{ gap: 16, marginBottom: 32 }}>
            {/* w-12 h-12 rounded-xl bg-secondary-container */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 48, height: 48,
                borderRadius: '3rem',
                background: C.secondaryContainer,
                color: C.onSecondaryContainer,
                fontSize: 22,
              }}
            >
              🌱
            </div>
            <h2 style={{
              fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
              fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em',
              color: C.primary, lineHeight: 1.15,
            }}>
              Создайте поле
            </h2>
          </div>

          {/* Form card: space-y-8 bg-surface-container-low p-8 rounded-xl */}
          <div
            className="space-y-8"
            style={{
              background: C.surfaceContainerLow,
              padding: 32,
              borderRadius: '3rem',
              border: `1px solid ${C.outlineVariant}1a`,
            }}
          >
            {/* Field name */}
            <div>
              <label
                className="block"
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: C.onSurfaceVariant,
                  marginBottom: 8, paddingLeft: 4,
                }}
              >
                Название поля
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Например, Поле №1"
                className="w-full transition-shadow"
                style={{
                  background: C.surfaceContainerHighest,
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '16px 24px',
                  fontSize: 16,
                  color: C.primary,
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.primaryContainer}`}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            {/* Field area */}
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: 8, paddingLeft: 4, paddingRight: 4 }}>
                <label style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: C.onSurfaceVariant,
                }}>
                  Площадь, га
                </label>
                <span style={{
                  fontSize: 10, fontWeight: 500, color: C.outline,
                  textTransform: 'uppercase', letterSpacing: '0.10em', fontStyle: 'italic',
                }}>
                  Необязательно
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(e.target.value)}
                  placeholder="0.0"
                  className="w-full transition-shadow"
                  style={{
                    background: C.surfaceContainerHighest,
                    border: 'none',
                    borderRadius: '2rem',
                    padding: '16px 24px',
                    fontSize: 16,
                    color: C.primary,
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.primaryContainer}`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
                <span
                  className="absolute right-6 top-1/2 -translate-y-1/2 font-medium"
                  style={{ color: C.onSurfaceVariant, fontSize: 15 }}
                >
                  га
                </span>
              </div>
            </div>
          </div>

          {/* Decorative field image — mt-8 rounded-xl h-48 from code.html */}
          <div
            className="relative overflow-hidden"
            style={{
              marginTop: 32,
              borderRadius: '1rem',
              height: 192,
              border: `1px solid ${C.outlineVariant}33`,
            }}
          >
            <img
              src="/categories/fungal.jpg"
              alt="Aerial view of field"
              className="w-full h-full object-cover"
            />
            {/* gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(1,45,29,0.40), transparent)' }}
            />
            {/* "Выбрать на карте" glass pill — absolute bottom-4 left-4 */}
            <div
              className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full"
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid rgba(113,121,115,0.10)`,
              }}
            >
              <MapPin size={14} strokeWidth={2} style={{ color: C.primary }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>
                Выбрать на карте
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* ── Sticky CTA — fixed bottom from code.html ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          padding: '16px 24px 40px',
          background: 'rgba(248,250,248,0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* w-full py-5 bg-primary-container text-on-primary-container rounded-full */}
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-95 duration-200"
          style={{
            padding: '20px 0',
            borderRadius: 9999,
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontSize: 18,
            background: C.primaryContainer,
            color: C.onPrimaryContainer,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: 'none',
          }}
        >
          Далее
          <ArrowRight size={22} strokeWidth={2} />
        </button>
      </div>

    </div>
  )
}
