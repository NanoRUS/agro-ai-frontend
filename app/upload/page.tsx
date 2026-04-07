'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, ImagePlus, X, ChevronRight, Leaf,
  Zap, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react'
import { DEMO_CASES, loadDemoResult } from '@/lib/demo-fixtures'
import { API_URL } from '@/lib/api'

const CROPS = [
  { id: 'tomato',     label: 'Томат',     emoji: '🍅' },
  { id: 'cucumber',   label: 'Огурец',    emoji: '🥒' },
  { id: 'potato',     label: 'Картофель', emoji: '🥔' },
  { id: 'pepper',     label: 'Перец',     emoji: '🌶️' },
  { id: 'strawberry', label: 'Клубника',  emoji: '🍓' },
]

// Demo case label: "🍅 Фитофтора..." → split emoji vs text
function splitDemoLabel(label: string) {
  const spaceIdx = label.indexOf(' ')
  return { icon: label.slice(0, spaceIdx), text: label.slice(spaceIdx + 1) }
}

export default function UploadPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages]     = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [crop, setCrop]         = useState('')
  const [error, setError]       = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
    setError('')
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  function handleNext() {
    if (!crop) return setError('Выберите культуру')
    if (images.length === 0) return setError('Загрузите хотя бы одно фото')
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

  const canProceed = !!crop && images.length > 0

  return (
    <div className="min-h-screen bg-[#f0f2f5]">

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <div
        className="px-5 pt-12 pb-8"
        style={{ background: 'linear-gradient(165deg, #ecfdf5 0%, #f4f9f4 35%, #f0f2f5 100%)' }}
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #22c55e, #15803d)',
              boxShadow: '0 6px 20px rgba(22,163,74,0.30)',
            }}
          >
            <Leaf size={26} strokeWidth={1.75} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center font-black text-gray-900"
          style={{ fontSize: 30, letterSpacing: '-0.04em', lineHeight: 1.05 }}
        >
          AI-Агроном
        </h1>
        <p
          className="text-center mt-2"
          style={{ fontSize: 14.5, color: '#6b7280', letterSpacing: '-0.01em' }}
        >
          Диагноз по фото за 60 секунд
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[
            { icon: <Sparkles size={10} strokeWidth={2} />, label: 'AI Vision' },
            { icon: <Zap size={10} strokeWidth={2} />,      label: '5 культур' },
          ].map(({ icon, label }, i) => (
            <div
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(22,163,74,0.09)',
                border: '1px solid rgba(22,163,74,0.18)',
              }}
            >
              <span className="text-emerald-600">{icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#15803d', letterSpacing: '0.02em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════════ */}
      <div className="px-4 pb-10 space-y-6 mt-2">

        {/* ── CROP SELECTION ── */}
        <section>
          <p
            className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase mb-3"
            style={{ fontSize: 10 }}
          >
            Культура
          </p>
          <div className="grid grid-cols-5 gap-2">
            {CROPS.map((c) => {
              const selected = crop === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => { setCrop(c.id); setError('') }}
                  className="flex flex-col items-center py-3 rounded-[16px]
                             transition-all duration-200 active:scale-[0.95]"
                  style={{
                    background: selected ? '#f0fdf4' : 'white',
                    border: `2px solid ${selected ? '#22c55e' : 'rgba(0,0,0,0.07)'}`,
                    boxShadow: selected
                      ? '0 0 0 3px rgba(34,197,94,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <span className="text-[22px] leading-none mb-1.5">{c.emoji}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: selected ? 700 : 500,
                      color: selected ? '#15803d' : '#6b7280',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── UPLOAD ZONE ── */}
        <section>
          <p
            className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase mb-3"
            style={{ fontSize: 10 }}
          >
            Фото растения · до 5 штук
          </p>

          {previews.length === 0 ? (
            /* ─ Empty state ─ */
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-[22px] flex flex-col items-center justify-center gap-3
                         transition-all duration-200 active:scale-[0.99]"
              style={{
                height: 200,
                background: 'white',
                border: '2px dashed rgba(22,163,74,0.30)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(22,163,74,0.55)'
                e.currentTarget.style.background = '#f0fdf4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(22,163,74,0.30)'
                e.currentTarget.style.background = 'white'
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.18)' }}
              >
                <ImagePlus size={24} strokeWidth={1.75} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p style={{ fontSize: 14.5, fontWeight: 600, color: '#1f2937', letterSpacing: '-0.01em' }}>
                  Добавить фото растения
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                  Нажмите или перетащите сюда
                </p>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                <Camera size={13} strokeWidth={2} />
                <span style={{ fontSize: 11.5 }}>Снимайте листья, стебель, плоды</span>
              </div>
            </button>
          ) : (
            /* ─ With photos ─ */
            <div className="grid grid-cols-3 gap-2.5">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ borderRadius: 18 }}
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
                             transition-all duration-200 active:scale-[0.97]"
                  style={{
                    borderRadius: 18,
                    border: '2px dashed rgba(22,163,74,0.30)',
                    background: 'white',
                    color: '#9ca3af',
                  }}
                >
                  <ImagePlus size={20} strokeWidth={1.75} className="text-emerald-500/70" />
                  <span style={{ fontSize: 10.5, fontWeight: 500 }}>Ещё</span>
                </button>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </section>

        {/* ── ERROR ── */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.20)' }}
          >
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full rounded-[14px] font-black tracking-wide
                       transition-all duration-150
                       active:scale-[0.97] active:brightness-95
                       disabled:cursor-not-allowed"
            style={{
              padding: '16px 0',
              fontSize: 15,
              letterSpacing: '0.01em',
              background: canProceed
                ? 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)'
                : 'linear-gradient(145deg, #bbf7d0 0%, #86efac 100%)',
              color: canProceed ? '#022c17' : '#4ade80',
              boxShadow: canProceed
                ? '0 6px 28px rgba(34,197,94,0.35), 0 1px 4px rgba(0,0,0,0.10)'
                : 'none',
              opacity: canProceed ? 1 : 0.7,
            }}
          >
            Далее — вопросы об уходе →
          </button>

          {/* Demo toggle */}
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl
                       transition-all duration-200 active:scale-[0.99]"
            style={{
              background: 'white',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.10)' }}
              >
                <Zap size={14} strokeWidth={2} className="text-amber-500" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Быстрый запуск — демо
              </span>
            </div>
            {showDemo
              ? <ChevronUp size={16} strokeWidth={2} className="text-gray-400" />
              : <ChevronDown size={16} strokeWidth={2} className="text-gray-400" />
            }
          </button>
        </div>

        {/* ── DEMO CASES ── */}
        {showDemo && (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: '#fafafa' }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.01em' }}>
                Готовые сценарии диагностики
              </p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                Нажмите — мгновенный результат без фото
              </p>
            </div>

            {/* Cases */}
            <div>
              {DEMO_CASES.map((c, idx) => {
                const { icon, text } = splitDemoLabel(c.label)
                const isLoading = demoLoading === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => handleDemoCase(c.id)}
                    disabled={demoLoading !== null}
                    className="w-full text-left flex items-center gap-3 px-4 py-3.5
                               transition-all duration-150 active:bg-gray-50
                               disabled:opacity-60"
                    style={{
                      borderTop: idx > 0 ? '1px solid rgba(0,0,0,0.045)' : 'none',
                    }}
                  >
                    {/* Emoji in circle */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: '#f3f4f6' }}
                    >
                      {icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>
                        {text}
                      </p>
                      <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>
                        {c.description}
                      </p>
                    </div>

                    {/* Arrow or spinner */}
                    {isLoading ? (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-emerald-500
                                   border-t-transparent animate-spin flex-shrink-0"
                      />
                    ) : (
                      <ChevronRight size={16} strokeWidth={2} className="text-gray-300 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
