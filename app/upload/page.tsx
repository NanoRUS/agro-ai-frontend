'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_CASES, loadDemoResult } from '@/lib/demo-fixtures'
import { API_URL } from '@/lib/api'

const CROPS = [
  { id: 'tomato', label: 'Томат', emoji: '🍅' },
  { id: 'cucumber', label: 'Огурец', emoji: '🥒' },
  { id: 'potato', label: 'Картофель', emoji: '🥔' },
  { id: 'pepper', label: 'Перец', emoji: '🌶️' },
  { id: 'strawberry', label: 'Клубника', emoji: '🍓' },
]

export default function UploadPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [crop, setCrop] = useState('')
  const [error, setError] = useState('')
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
      (f) =>
        new Promise<string>((res) => {
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

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">🌱</div>
        <h1 className="text-2xl font-bold text-gray-900">AI-Агроном</h1>
        <p className="text-gray-500 text-sm mt-1">Диагноз за 60 секунд по фото</p>
      </div>

      {/* Crop selector */}
      <div>
        <p className="section-title">Культура</p>
        <div className="grid grid-cols-5 gap-2">
          {CROPS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCrop(c.id)}
              className={`flex flex-col items-center py-3 rounded-xl border-2 text-xs font-medium transition-colors
                ${crop === c.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}
            >
              <span className="text-2xl mb-1">{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image upload */}
      <div>
        <p className="section-title">Фото растения (до 5 штук)</p>

        {previews.length === 0 ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl
                       flex flex-col items-center justify-center gap-2 text-gray-400
                       active:bg-gray-50 transition-colors"
          >
            <span className="text-4xl">📷</span>
            <span className="text-sm">Нажмите, чтобы добавить фото</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square">
                <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full
                             text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <button
                onClick={() => inputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl
                           flex items-center justify-center text-gray-400 text-2xl"
              >
                +
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

        <p className="text-xs text-gray-400 mt-2">
          Снимайте: общий вид, крупный план листьев, стебель, плоды
        </p>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="mt-auto space-y-3">
        <button
          onClick={handleNext}
          disabled={!crop || images.length === 0}
          className="btn-primary"
        >
          Далее — вопросы об уходе →
        </button>

        {/* Demo mode toggle */}
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="w-full text-center text-xs text-gray-400 py-1 hover:text-gray-600 transition-colors"
        >
          {showDemo ? '▲ Скрыть демо-сценарии' : '📋 Показать готовые демо-сценарии'}
        </button>
      </div>

      {/* Demo cases panel */}
      {showDemo && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">Демо-сценарии</p>
            <p className="text-xs text-gray-500 mt-0.5">Нажмите, чтобы мгновенно запустить диагностику</p>
          </div>
          <div className="divide-y divide-gray-100">
            {DEMO_CASES.map((c) => (
              <button
                key={c.id}
                onClick={() => handleDemoCase(c.id)}
                disabled={demoLoading !== null}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                           disabled:opacity-60 flex items-start gap-3"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{c.label.split(' ')[0]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    {c.label.slice(c.label.indexOf(' ') + 1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                </div>
                {demoLoading === c.id && (
                  <div className="flex-shrink-0 w-4 h-4 border-2 border-green-500 border-t-transparent
                                  rounded-full animate-spin mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
