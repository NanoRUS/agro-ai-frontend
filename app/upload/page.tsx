'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, MoreVertical, Camera, ImagePlus, ArrowRight, Sun, Scan, Leaf,
} from 'lucide-react'
import { DEMO_CASES, loadDemoResult } from '@/lib/demo-fixtures'
import { API_URL } from '@/lib/api'
import BottomNav from '@/components/BottomNav'

// ── Stitch tokens ──────────────────────────────────────────────────────────────
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

// ── Data ──────────────────────────────────────────────────────────────────────

const CROPS = [
  { id: 'tomato',     label: 'Томат',     img: '/crops/tomato.jpg' },
  { id: 'cucumber',   label: 'Огурец',    img: '/crops/cucumber.jpg' },
  { id: 'potato',     label: 'Картофель', img: '/crops/potato.jpg' },
  { id: 'pepper',     label: 'Перец',     img: '/crops/pepper.jpg' },
  { id: 'strawberry', label: 'Клубника',  img: '/crops/strawberry.jpg' },
]

const DEMO_IMAGES: Record<string, string> = {
  tomato_phytophthora_rain:        '/demos/tomato-blight.jpg',
  tomato_overwatering:             '/demos/tomato-overwatering.jpg',
  tomato_blossom_end_rot:          '/demos/tomato-blossom-rot.jpg',
  cucumber_powdery_mildew:         '/demos/cucumber-mildew.jpg',
  potato_phytophthora_critical:    '/demos/potato-blight.jpg',
  pepper_blossom_end_rot_fruiting: '/demos/pepper-rot.jpg',
  strawberry_root_rot:             '/demos/strawberry-root.jpg',
}

const DEMO_EXCLUDED = new Set(['tomato_aphids', 'cucumber_spider_mites_heat'])

function stripEmoji(label: string) {
  return label.replace(/^\p{Emoji_Presentation}\s*/u, '')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [images,      setImages]      = useState<File[]>([])
  const [previews,    setPreviews]    = useState<string[]>([])
  const [crop,        setCrop]        = useState('')
  const [error,       setError]       = useState('')
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
  const [navigating,  setNavigating]  = useState(false)
  const [farmerCtx,   setFarmerCtx]   = useState<{ crop: string; field: string } | null>(null)
  const [userType,    setUserType]    = useState<string | null>(null)

  useEffect(() => {
    const ut = localStorage.getItem('userType')
    if (!ut) {
      router.replace('/onboarding')
      return
    }
    setUserType(ut)
    try {
      const crops = JSON.parse(sessionStorage.getItem('agro_farmer_crops') || '[]') as string[]
      const field = JSON.parse(sessionStorage.getItem('agro_farmer_field') || '{}') as { name?: string }
      if (crops.length > 0) {
        setFarmerCtx({ crop: crops[0], field: field.name || '' })
        setCrop(crops[0])
      }
    } catch {}
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files || [])
    if (!incoming.length) return
    setImages((prev) => {
      const combined = [...prev, ...incoming].slice(0, 5)
      const added = combined.slice(prev.length)
      setPreviews((p) => [...p, ...added.map((f) => URL.createObjectURL(f))])
      return combined
    })
    setError('')
    e.target.value = ''
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 1024
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else                { width  = Math.round(width  * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.80))
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function handleNext() {
    if (!crop)          return setError('Выберите культуру')
    if (!images.length) return setError('Загрузите хотя бы одно фото')

    setNavigating(true)
    setError('')
    try {
      const dataUrls = await Promise.all(images.map(compressImage))
      sessionStorage.setItem('agro_crop', crop)
      sessionStorage.setItem('agro_image_count', String(images.length))
      sessionStorage.setItem('agro_images_data', JSON.stringify(dataUrls))
      sessionStorage.setItem('agro_images_names', JSON.stringify(images.map((f) => f.name)))
      router.push('/questionnaire')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обработать фото. Попробуйте ещё раз.')
      setNavigating(false)
    }
  }

  async function handleDemoCase(fixtureId: string) {
    setDemoLoading(fixtureId)
    setError('')
    try {
      const result = await loadDemoResult(fixtureId, API_URL)
      sessionStorage.setItem('agro_result', JSON.stringify(result))
      router.push('/results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить демо.')
    } finally {
      setDemoLoading(null)
    }
  }

  const hasPhotos  = images.length > 0
  const hasCrop    = !!crop
  const canProceed = hasPhotos && hasCrop

  return (
    <div style={{ background: C.surface, color: C.onSurface, minHeight: 'max(884px, 100dvh)' }}>

      {/* ── TopAppBar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6"
        style={{ height: 64, background: C.surface, maxWidth: 448, margin: '0 auto' }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full transition-colors active:scale-95"
          style={{ color: C.primary }}
        >
          <X size={24} strokeWidth={2} />
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            color: C.primary,
            letterSpacing: '-0.01em',
          }}
        >
          Диагностика
        </h1>
        <button className="p-2 rounded-full" style={{ color: C.primary }}>
          <MoreVertical size={24} strokeWidth={2} />
        </button>
      </header>

      {/* ── Main ── */}
      <main className="px-6" style={{ paddingTop: 96, paddingBottom: 200 }}>

        {/* Context chip — shown for farmers */}
        {farmerCtx && (
          <div className="flex justify-center" style={{ marginBottom: 32 }}>
            <div
              className="inline-flex items-center gap-2 rounded-full"
              style={{
                padding: '8px 16px',
                background: C.secondaryContainer,
                color: C.onSecondaryContainer,
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {farmerCtx.crop}{farmerCtx.field ? ` • ${farmerCtx.field}` : ''}
              </span>
              <button
                onClick={() => setFarmerCtx(null)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="text-center" style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: '-0.04em',
              color: C.primary,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {userType === 'farm' ? 'Сфотографируйте поражённый участок' : 'Загрузите фото растения'}
          </h2>
          <p
            style={{
              color: C.onSurfaceVariant,
              fontSize: 18,
              lineHeight: 1.5,
              maxWidth: 360,
              margin: '0 auto',
            }}
          >
            {userType === 'farm'
              ? 'Лучше всего: лист, стебель, початок или колос'
              : 'Используйте четкий снимок пораженного участка для точного анализа ИИ.'}
          </p>
        </div>

        {/* ── Upload zone ── */}
        {previews.length === 0 ? (
          <div
            className="relative group cursor-pointer"
            onClick={() => cameraRef.current?.click()}
          >
            {/* Glow wrapper */}
            <div
              className="absolute -inset-1 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"
              style={{ background: `linear-gradient(135deg, ${C.primary}1a, ${C.secondary}1a)` }}
            />
            <div
              className="relative flex flex-col items-center justify-center"
              style={{
                padding: 48,
                border: `2px dashed ${C.outlineVariant}`,
                borderRadius: '3rem',
                background: C.surfaceContainerLowest,
                minHeight: 340,
              }}
            >
              <div
                className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: C.surfaceContainerLow,
                  color: C.primary,
                  marginBottom: 24,
                }}
              >
                {/* add_a_photo substitute */}
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="5"/>
                  <line x1="10.5" y1="3.5" x2="13.5" y2="3.5"/>
                </svg>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 20,
                  color: C.primary,
                  textAlign: 'center',
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}
              >
                Нажмите, чтобы загрузить или сделать фото
              </p>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: C.onSurfaceVariant,
                }}
              >
                JPG, PNG до 10 МБ
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70 active:opacity-50"
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.outline,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ImagePlus size={14} strokeWidth={1.75} />
                Выбрать из галереи
              </button>
            </div>
          </div>
        ) : (
          /* ── Photo grid (after upload) ── */
          <div
            style={{
              background: C.surfaceContainerLowest,
              borderRadius: '3rem',
              padding: 24,
              border: `1px solid rgba(193,200,194,0.15)`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.onSurfaceVariant,
                marginBottom: 16,
              }}
            >
              {previews.length} {previews.length === 1 ? 'фото' : 'фото'} добавлено
            </p>
            <div className="grid grid-cols-3" style={{ gap: 10 }}>
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ borderRadius: '1.5rem' }}
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 flex items-center justify-center transition-transform active:scale-90"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.20)',
                    }}
                  >
                    <X size={13} strokeWidth={2.5} className="text-white" />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97]"
                  style={{
                    borderRadius: '1.5rem',
                    border: `2px dashed ${C.outlineVariant}`,
                    background: C.surfaceContainerLow,
                  }}
                >
                  <ImagePlus size={18} strokeWidth={1.75} style={{ color: C.outline }} />
                  <span style={{ fontSize: 10, color: C.onSurfaceVariant, fontWeight: 500 }}>Добавить</span>
                </button>
              )}
            </div>
            {/* Camera / Gallery buttons */}
            <div className="flex gap-3" style={{ marginTop: 16 }}>
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{
                  padding: '12px 0',
                  borderRadius: '2rem',
                  background: C.surfaceContainerLow,
                  border: `1px solid rgba(193,200,194,0.20)`,
                  color: C.secondary,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <Camera size={16} strokeWidth={1.75} />
                Камера
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{
                  padding: '12px 0',
                  borderRadius: '2rem',
                  background: C.surfaceContainerLow,
                  border: `1px solid rgba(193,200,194,0.20)`,
                  color: C.onSurfaceVariant,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <ImagePlus size={16} strokeWidth={1.75} />
                Галерея
              </button>
            </div>
          </div>
        )}

        {/* Hidden inputs */}
        <input ref={inputRef}  type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />

        {/* ── Two info cards ── */}
        <div className="grid grid-cols-1" style={{ gap: 16, marginTop: 24 }}>

          {/* Example photo card */}
          <div
            style={{
              background: C.surfaceContainerLow,
              borderRadius: '2rem',
              padding: 24,
              border: `1px solid rgba(193,200,194,0.10)`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.onSurfaceVariant,
                marginBottom: 16,
              }}
            >
              Образец фото
            </p>
            <div
              className="relative overflow-hidden"
              style={{ borderRadius: '1.5rem', aspectRatio: '1/1' }}
            >
              <img
                src="/categories/fungal.jpg"
                alt="Пример качественного фото листа"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(1,45,29,0.40), transparent)' }}
              />
              <div
                className="absolute bottom-4 left-4 flex items-center gap-2"
                style={{ color: 'white' }}
              >
                {/* check_circle filled substitute */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.47 5.47a.75.75 0 011.06 1.06l-5 5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L7 9.94l4.47-4.47z" />
                </svg>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}
                >
                  Хороший пример
                </span>
              </div>
            </div>
          </div>

          {/* Tips card */}
          <div
            style={{
              background: C.surfaceContainerLow,
              borderRadius: '2rem',
              padding: 24,
              border: `1px solid rgba(193,200,194,0.10)`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.onSurfaceVariant,
                marginBottom: 20,
              }}
            >
              Рекомендации
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <li className="flex items-start gap-4">
                <Sun size={22} strokeWidth={1.75} style={{ color: C.secondary, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginBottom: 2 }}>
                    Хорошее освещение
                  </p>
                  <p style={{ fontSize: 13, color: C.onSurfaceVariant }}>
                    Снимайте при дневном свете, избегая теней.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Scan size={22} strokeWidth={1.75} style={{ color: C.secondary, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginBottom: 2 }}>
                    Фокус на деталях
                  </p>
                  <p style={{ fontSize: 13, color: C.onSurfaceVariant }}>
                    Держите камеру в 15–20 см от листа.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Leaf size={22} strokeWidth={1.75} style={{ color: C.secondary, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginBottom: 2 }}>
                    Чистота объекта
                  </p>
                  <p style={{ fontSize: 13, color: C.onSurfaceVariant }}>
                    Убедитесь, что на листе нет пыли или грязи.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Crop selection — hidden for farmers (crop auto-set from farmer-setup) ── */}
        {!(userType === 'farm' && farmerCtx) && (
          <section style={{ marginTop: 40 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.onSurfaceVariant,
                marginBottom: 16,
              }}
            >
              Тип растения
            </p>
            <div className="flex flex-wrap" style={{ gap: 10 }}>
              {CROPS.map((c) => {
                const sel = crop === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCrop(c.id); setError('') }}
                    className="flex items-center gap-2 transition-all active:scale-95"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 9999,
                      background: sel ? C.primaryContainer : C.surfaceContainerLowest,
                      color: sel ? C.onPrimaryContainer : C.primary,
                      border: sel ? 'none' : `1px solid ${C.outlineVariant}`,
                      fontWeight: sel ? 700 : 500,
                      fontSize: 14,
                      boxShadow: sel ? '0 1px 4px rgba(0,0,0,0.18)' : undefined,
                    }}
                  >
                    <div
                      className="overflow-hidden flex-shrink-0"
                      style={{ width: 24, height: 24, borderRadius: '50%' }}
                    >
                      <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                    </div>
                    {c.label}
                    {sel && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd"
                          d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.47 5.47a.75.75 0 011.06 1.06l-5 5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L7 9.94l4.47-4.47z" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Demo section ── */}
        <section style={{ marginTop: 40 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: C.onSurfaceVariant,
              marginBottom: 16,
            }}
          >
            Примеры диагностики
          </p>
          <div className="grid grid-cols-3" style={{ gap: 10 }}>
            {DEMO_CASES.filter((c) => !DEMO_EXCLUDED.has(c.id)).map((c) => {
              const imgSrc = DEMO_IMAGES[c.id] ?? `/crops/${c.crop}.jpg`
              const label = stripEmoji(c.label)
              const isLoading = demoLoading === c.id

              return (
                <button
                  key={c.id}
                  onClick={() => handleDemoCase(c.id)}
                  disabled={demoLoading !== null}
                  className="w-full text-left transition-all active:scale-[0.96] disabled:opacity-60"
                  style={{ outline: 'none' }}
                >
                  <div
                    className="w-full aspect-square relative overflow-hidden"
                    style={{
                      borderRadius: '1.5rem',
                      marginBottom: 8,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt={label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.50) 100%)' }}
                    />
                    {isLoading ? (
                      <div
                        className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 animate-spin"
                        style={{ borderColor: C.secondaryContainer, borderTopColor: 'transparent' }}
                      />
                    ) : (
                      <div
                        className="absolute bottom-2 right-2 flex items-center justify-center"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.22)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.30)',
                        }}
                      >
                        <ArrowRight size={11} strokeWidth={2.5} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p
                    className="line-clamp-2 leading-tight"
                    style={{ fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: '-0.01em' }}
                  >
                    {label}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              marginTop: 16,
              borderRadius: '1rem',
              background: '#fef2f2',
              border: '1px solid rgba(239,68,68,0.20)',
            }}
          >
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</span>
          </div>
        )}
      </main>

      {/* ── Sticky CTA footer — sits above BottomNav ── */}
      <div
        className="fixed left-0 right-0 z-10"
        style={{
          bottom: 60,
          maxWidth: 448,
          margin: '0 auto',
          padding: '16px 24px',
          background: 'rgba(248,250,248,0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: `1px solid rgba(193,200,194,0.10)`,
        }}
      >
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-full flex items-center justify-center gap-3 transition-all active:scale-95 duration-200"
          style={{
            height: 64,
            borderRadius: 9999,
            fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            background: canProceed ? C.primaryContainer : C.surfaceContainerHighest,
            color: canProceed ? C.onPrimaryContainer : `${C.onSurfaceVariant}66`,
            boxShadow: canProceed ? '0 8px 24px rgba(0,0,0,0.28)' : 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Продолжить
          <ArrowRight size={22} strokeWidth={2} />
        </button>
        {!canProceed && (
          <p
            className="text-center"
            style={{
              marginTop: 12,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: `${C.onSurfaceVariant}80`,
            }}
          >
            {!hasPhotos ? 'Загрузите фото для активации' : 'Выберите тип растения'}
          </p>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <BottomNav active="home" onScan={() => cameraRef.current?.click()} />

      {/* ── Navigating overlay ── */}
      {navigating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(248,250,248,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: '1.25rem',
                background: C.primaryContainer,
                boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
              }}
            >
              <Scan size={28} strokeWidth={1.75} className="animate-pulse" style={{ color: C.onPrimaryContainer }} />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-manrope), Manrope, Inter, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: C.primary,
                letterSpacing: '-0.02em',
              }}
            >
              Подготовка фото...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
