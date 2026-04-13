'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, Star, Scan, Camera, ImagePlus,
  X, Zap, ArrowRight,
} from 'lucide-react'
import { DEMO_CASES, loadDemoResult } from '@/lib/demo-fixtures'
import { API_URL } from '@/lib/api'
import BottomNav from '@/components/BottomNav'

// ── Data ──────────────────────────────────────────────────────────────────────

const CROPS = [
  { id: 'tomato',     label: 'Томат',     img: '/crops/tomato.jpg' },
  { id: 'cucumber',   label: 'Огурец',    img: '/crops/cucumber.jpg' },
  { id: 'potato',     label: 'Картофель', img: '/crops/potato.jpg' },
  { id: 'pepper',     label: 'Перец',     img: '/crops/pepper.jpg' },
  { id: 'strawberry', label: 'Клубника',  img: '/crops/strawberry.jpg' },
]

// Demo card image per fixture id — real plant/disease photos
const DEMO_IMAGES: Record<string, string> = {
  tomato_phytophthora_rain:        '/demos/tomato-blight.jpg',
  tomato_overwatering:             '/demos/tomato-overwatering.jpg',
  tomato_blossom_end_rot:          '/demos/tomato-blossom-rot.jpg',
  cucumber_powdery_mildew:         '/demos/cucumber-mildew.jpg',
  potato_phytophthora_critical:    '/demos/potato-blight.jpg',
  pepper_blossom_end_rot_fruiting: '/demos/pepper-rot.jpg',
  strawberry_root_rot:             '/demos/strawberry-root.jpg',
}

// IDs excluded from demo grid (no quality disease photo available)
const DEMO_EXCLUDED = new Set(['tomato_aphids', 'cucumber_spider_mites_heat'])

function stripEmoji(label: string) {
  // Remove leading emoji + space from demo labels like "🍅 Фитофтора…"
  return label.replace(/^\p{Emoji_Presentation}\s*/u, '')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const router     = useRouter()
  const inputRef   = useRef<HTMLInputElement>(null)
  const cameraRef  = useRef<HTMLInputElement>(null)

  const [images,      setImages]      = useState<File[]>([])
  const [previews,    setPreviews]    = useState<string[]>([])
  const [crop,        setCrop]        = useState('')
  const [error,       setError]       = useState('')
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
  const [navigating,  setNavigating]  = useState(false)

  // Onboarding guard
  useEffect(() => {
    if (!localStorage.getItem('userType')) {
      router.replace('/onboarding')
    }
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files || [])
    if (!incoming.length) return
    // Append to existing, cap at 5
    setImages((prev) => {
      const combined = [...prev, ...incoming].slice(0, 5)
      const added = combined.slice(prev.length)
      setPreviews((p) => [...p, ...added.map((f) => URL.createObjectURL(f))])
      return combined
    })
    setError('')
    // Reset input so the same camera can be triggered again
    e.target.value = ''
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  // Compress image to max 1024px, JPEG 0.80 — keeps size under ~150KB
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

  const cropSectionRef = useRef<HTMLElement>(null)

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-[148px]">

      {/* ══ 1. HERO CARD ════════════════════════════════════════════════ */}
      <div className="px-4 pt-5">
        <div
          className="relative w-full overflow-hidden"
          style={{ borderRadius: 28, height: 268 }}
        >
          {/* Real photo background */}
          <img
            src="/crops/tomato.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />

          {/* Gradient overlay — keeps text readable + brand color */}
          <div
            className="absolute inset-0"
            style={{
              background: [
                'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.68) 100%)',
                'linear-gradient(155deg, rgba(15,48,24,0.72) 0%, rgba(7,24,16,0.42) 55%, transparent 100%)',
              ].join(', '),
            }}
          />

          {/* ─ Badges — top row ─ */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            {/* Accuracy badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-full"
              style={{
                background: 'rgba(255,255,255,0.90)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.55)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              <ShieldCheck size={11} strokeWidth={2.5} className="text-emerald-600" />
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.07em', color: '#111827' }}>
                98% ТОЧНОСТЬ
              </span>
            </div>

            {/* Expert badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-full"
              style={{
                background: 'rgba(74,222,128,0.18)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(74,222,128,0.35)',
              }}
            >
              <Star size={10} strokeWidth={0} className="fill-emerald-400 text-emerald-400" />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: '#4ade80' }}>
                ЭКСПЕРТНАЯ ПРОВЕРКА
              </span>
            </div>
          </div>

          {/* ─ Title + subtitle — bottom ─ */}
          <div className="absolute bottom-5 left-5 right-5">
            <h1
              className="text-white"
              style={{
                fontSize: 26, fontWeight: 900,
                letterSpacing: '-0.04em', lineHeight: 1.05,
                textShadow: '0 2px 12px rgba(0,0,0,0.40)',
              }}
            >
              Определите болезнь{'\n'}растения за секунды
            </h1>
            <p
              className="mt-1.5"
              style={{
                fontSize: 13, color: 'rgba(255,255,255,0.65)',
                letterSpacing: '-0.01em', lineHeight: 1.45,
              }}
            >
              На основе ИИ · 5 культур · Результат за 60 сек
            </p>
          </div>
        </div>
      </div>

      {/* ══ 2. UPLOAD CARD ══════════════════════════════════════════════ */}
      <div className="px-4 mt-4">
        <div
          className="rounded-[20px] overflow-hidden"
          style={{
            background: 'white',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {previews.length === 0 ? (
            /* ─ Empty state ─ */
            <div className="px-5 py-5">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(145deg, #22c55e, #15803d)',
                    boxShadow: '0 4px 12px rgba(34,197,94,0.30)',
                  }}
                >
                  <Scan size={20} strokeWidth={1.75} className="text-white" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    Загрузите фото растения
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
                    До 5 фото · лист, стебель, плод
                  </p>
                </div>
              </div>

              {/* Camera / Gallery buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px]
                             transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: 'rgba(22,163,74,0.08)',
                    border: '1.5px solid rgba(22,163,74,0.20)',
                  }}
                >
                  <Camera size={17} strokeWidth={1.75} className="text-emerald-600" />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#15803d' }}>Камера</span>
                </button>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px]
                             transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: 'rgba(0,0,0,0.03)',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <ImagePlus size={17} strokeWidth={1.75} className="text-gray-500" />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#4b5563' }}>Галерея</span>
                </button>
              </div>
            </div>
          ) : (
            /* ─ Photo grid ─ */
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(22,163,74,0.10)' }}
                >
                  <Scan size={14} strokeWidth={2} className="text-emerald-600" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  {previews.length} {previews.length === 1 ? 'фото добавлено' : 'фото добавлено'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={src} alt=""
                      className="w-full h-full object-cover"
                      style={{ borderRadius: 16 }}
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center
                                 transition-transform active:scale-90"
                      style={{
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        borderRadius: '50%',
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
                    className="aspect-square flex flex-col items-center justify-center gap-1
                               transition-all duration-150 active:scale-[0.97]"
                    style={{
                      borderRadius: 16,
                      border: '2px dashed rgba(22,163,74,0.28)',
                      background: 'rgba(22,163,74,0.04)',
                    }}
                  >
                    <ImagePlus size={18} strokeWidth={1.75} className="text-emerald-500/70" />
                    <span style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 500 }}>Добавить</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hidden inputs */}
        <input ref={inputRef}  type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
      </div>

      {/* ══ 3. PLANT TYPE ═══════════════════════════════════════════════ */}
      <section ref={cropSectionRef} className="px-4 mt-5">
        <p
          className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase mb-3"
          style={{ fontSize: 10 }}
        >
          Тип растения
        </p>
        <div className="grid grid-cols-5 gap-2">
          {CROPS.map((c) => {
            const sel = crop === c.id
            return (
              <button
                key={c.id}
                onClick={() => { setCrop(c.id); setError('') }}
                className="flex flex-col items-center pt-2.5 pb-2 rounded-[16px]
                           transition-all duration-200 active:scale-[0.94]"
                style={{
                  background: sel ? '#f0fdf4' : 'white',
                  border: `2px solid ${sel ? '#22c55e' : 'rgba(0,0,0,0.07)'}`,
                  boxShadow: sel
                    ? '0 0 0 3px rgba(34,197,94,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Real crop photo */}
                <div
                  className="w-10 h-10 mb-1.5 overflow-hidden"
                  style={{
                    borderRadius: 10,
                    border: sel ? '2px solid rgba(34,197,94,0.35)' : '1.5px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: sel ? 700 : 500,
                  color: sel ? '#15803d' : '#6b7280',
                  letterSpacing: '-0.01em',
                }}>
                  {c.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ══ 4. DEMO SECTION ═════════════════════════════════════════════ */}
      <section className="mt-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)' }}
            >
              <Zap size={12} strokeWidth={2} className="text-amber-500" />
            </div>
            <p
              className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase"
              style={{ fontSize: 10 }}
            >
              Примеры диагностики
            </p>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>
            Нажмите для демо
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-3 gap-2.5 px-4">
          {DEMO_CASES.filter((c) => !DEMO_EXCLUDED.has(c.id)).map((c) => {
            const imgSrc = DEMO_IMAGES[c.id] ?? `/crops/${c.crop}.jpg`
            const label = stripEmoji(c.label)
            const isLoading = demoLoading === c.id

            return (
              <button
                key={c.id}
                onClick={() => handleDemoCase(c.id)}
                disabled={demoLoading !== null}
                className="w-full text-left transition-all duration-200
                           active:scale-[0.96] disabled:opacity-60"
                style={{ outline: 'none' }}
              >
                {/* Square photo card */}
                <div
                  className="w-full aspect-square rounded-[16px] relative overflow-hidden mb-1.5"
                  style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }}
                >
                  <img
                    src={imgSrc}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Bottom scrim */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.52) 100%)',
                    }}
                  />
                  {/* Run / loading indicator */}
                  {isLoading ? (
                    <div
                      className="absolute bottom-2 right-2 w-5 h-5 rounded-full
                                 border-2 border-emerald-400 border-t-transparent animate-spin"
                    />
                  ) : (
                    <div
                      className="absolute bottom-2 right-2 w-6 h-6 rounded-full
                                 flex items-center justify-center"
                      style={{
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

                {/* Label */}
                <p
                  className="line-clamp-2 leading-tight"
                  style={{ fontSize: 11, fontWeight: 600, color: '#1f2937', letterSpacing: '-0.01em' }}
                >
                  {label}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Demo loading error ── */}
      {error && (
        <div
          className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl"
          style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.20)' }}
        >
          <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* ══ 5. STICKY CTA — always visible above nav ════════════════════ */}
      <div
        className="fixed left-0 right-0 z-10 max-w-md mx-auto"
        style={{ bottom: 60 }}
      >
        <div
          className="px-4 pt-3 pb-3"
          style={{
            background: 'rgba(240,242,245,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          }}
        >
          {/* Status hint — shown only when partially ready */}
          {(hasPhotos || hasCrop) && !canProceed && (
            <button
              onClick={() => {
                if (!hasCrop) cropSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="w-full flex items-center gap-2 mb-2.5 px-3.5 py-2 rounded-[12px] text-left"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.20)',
              }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.18)' }}
              >
                <span style={{ fontSize: 9, fontWeight: 900, color: '#d97706' }}>!</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#92400e', fontWeight: 500 }}>
                {!hasPhotos ? 'Загрузите фото растения' : 'Выберите тип растения ↑'}
              </p>
            </button>
          )}

          {canProceed && (
            <p
              className="text-center mb-2 font-semibold"
              style={{ fontSize: 12.5, color: '#15803d', letterSpacing: '-0.01em' }}
            >
              Готово — запустите анализ
            </p>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full rounded-[14px] font-black tracking-wide
                       transition-all duration-200 active:scale-[0.97] active:brightness-95
                       disabled:cursor-not-allowed"
            style={{
              padding: '15px 0',
              fontSize: 15.5,
              letterSpacing: '0.01em',
              background: canProceed
                ? 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)'
                : 'linear-gradient(145deg, #d1fae5 0%, #a7f3d0 100%)',
              color: canProceed ? '#022c17' : '#9ca3af',
              boxShadow: canProceed
                ? '0 8px 32px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.12)'
                : 'none',
              opacity: canProceed ? 1 : 0.6,
              animation: canProceed ? 'ctaGlow 2.2s ease-in-out infinite' : 'none',
            }}
          >
            {canProceed ? 'Начать диагностику →' : 'Начать диагностику'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 8px 32px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.12); }
          50%       { box-shadow: 0 8px 40px rgba(34,197,94,0.70), 0 2px 12px rgba(0,0,0,0.14); }
        }
      `}</style>

      {/* ══ 6. BOTTOM NAV ════════════════════════════════════════════════ */}
      <BottomNav active="home" onScan={() => cameraRef.current?.click()} />

      {/* ══ NAVIGATING OVERLAY ══════════════════════════════════════════ */}
      {navigating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(240,242,245,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #22c55e, #15803d)',
                boxShadow: '0 6px 24px rgba(34,197,94,0.40)',
              }}
            >
              <Scan size={28} strokeWidth={1.75} className="text-white animate-pulse" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', letterSpacing: '-0.02em' }}>
              Подготовка фото...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
