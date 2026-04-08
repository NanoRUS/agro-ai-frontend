'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, Star, Scan, Camera, ImagePlus,
  X, ChevronRight, Zap, ArrowRight,
} from 'lucide-react'
import { DEMO_CASES, loadDemoResult } from '@/lib/demo-fixtures'
import { API_URL } from '@/lib/api'

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

  function handleNext() {
    if (!crop)            return setError('Выберите культуру')
    if (!images.length)   return setError('Загрузите хотя бы одно фото')

    sessionStorage.setItem('agro_crop', crop)
    sessionStorage.setItem('agro_image_count', String(images.length))

    const readers = images.map(
      (f) => new Promise<string>((res) => {
        const r = new FileReader()
        r.onload = () => res(r.result as string)
        r.readAsDataURL(f)
      }),
    )
    Promise.all(readers).then((dataUrls) => {
      sessionStorage.setItem('agro_images_data', JSON.stringify(dataUrls))
      sessionStorage.setItem('agro_images_names', JSON.stringify(images.map((f) => f.name)))
      router.push('/questionnaire')
    })
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
    <div className="min-h-screen bg-[#f0f2f5] pb-28">

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
      <section className="px-4 mt-5">
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

      {/* ── Error ── */}
      {error && (
        <div
          className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl"
          style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.20)' }}
        >
          <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* ══ 5. CTA ══════════════════════════════════════════════════════ */}
      <div className="px-4 mt-5">

        {/* Contextual status hint */}
        {(hasPhotos || hasCrop) && !canProceed && (
          <div
            className="flex items-center gap-2 mb-3 px-3.5 py-2.5 rounded-[12px]"
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
              {!hasPhotos
                ? 'Загрузите фото растения'
                : 'Выберите тип растения выше'}
            </p>
          </div>
        )}

        {canProceed && (
          <p
            className="text-center mb-2.5 font-semibold"
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
            padding: '17px 0',
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
            // Pulse glow animation when ready
            animation: canProceed ? 'ctaGlow 2.2s ease-in-out infinite' : 'none',
          }}
        >
          {canProceed ? 'Начать диагностику →' : 'Начать диагностику'}
        </button>

        <p
          className="text-center mt-2"
          style={{ fontSize: 11.5, color: '#9ca3af', minHeight: 18 }}
        >
          {canProceed ? 'Результат готов примерно через 60 секунд' : ''}
        </p>
      </div>

      <style>{`
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 8px 32px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.12); }
          50%       { box-shadow: 0 8px 40px rgba(34,197,94,0.70), 0 2px 12px rgba(0,0,0,0.14); }
        }
      `}</style>

      {/* ══ 6. BOTTOM NAV ═══════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-end justify-around px-2 pt-2 pb-4">

          {/* Home — active */}
          <button className="flex flex-col items-center gap-[5px] px-4 relative">
            <div
              className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
              style={{ background: '#ecfdf5' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                   stroke="#16a34a" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
            </div>
            <span style={{ fontSize: 9.5 }} className="font-bold text-emerald-600">Главная</span>
            <span className="absolute -bottom-0.5 w-[18px] h-[3px] rounded-full bg-emerald-500" />
          </button>

          {/* Results */}
          <button
            onClick={() => {
              const r = sessionStorage.getItem('agro_result')
              if (r) router.push('/results')
            }}
            className="flex flex-col items-center gap-[5px] px-4"
            style={{ color: '#9ca3af' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                 stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <circle cx="17.5" cy="17.5" r="3.5" />
            </svg>
            <span style={{ fontSize: 9.5 }} className="font-medium">Результаты</span>
          </button>

          {/* Center scan — focal */}
          <button className="flex flex-col items-center gap-[5px] -mt-6">
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #22c55e, #15803d)',
                boxShadow: '0 4px 24px rgba(22,163,74,0.50)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"
                   stroke="white" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: 9.5, color: '#9ca3af' }} className="font-medium">Сканер</span>
          </button>

          {/* History */}
          <button className="flex flex-col items-center gap-[5px] px-4" style={{ color: '#9ca3af' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                 stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            <span style={{ fontSize: 9.5 }} className="font-medium">История</span>
          </button>

          {/* Settings */}
          <button className="flex flex-col items-center gap-[5px] px-4" style={{ color: '#9ca3af' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                 stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span style={{ fontSize: 9.5 }} className="font-medium">Настройки</span>
          </button>
        </div>
      </div>
    </div>
  )
}
