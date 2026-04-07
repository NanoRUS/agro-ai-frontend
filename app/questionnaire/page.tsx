'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeImages } from '@/lib/api'

type Stage = 'seedling' | 'growing' | 'flowering' | 'fruiting'
type Env = 'greenhouse' | 'open_field'
type Moisture = 'very_wet' | 'wet' | 'normal' | 'dry' | 'very_dry'
type Watering = 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'rarely'

const STAGE_LABELS: Record<Stage, string> = {
  seedling: 'Рассада',
  growing: 'Рост',
  flowering: 'Цветение',
  fruiting: 'Плодоношение',
}

const MOISTURE_LABELS: Record<Moisture, string> = {
  very_wet: 'Мокрая',
  wet: 'Влажная',
  normal: 'Нормальная',
  dry: 'Сухая',
  very_dry: 'Очень сухая',
}

const WATERING_LABELS: Record<Watering, string> = {
  daily: 'Каждый день',
  every_2_days: 'Раз в 2 дня',
  every_3_days: 'Раз в 3 дня',
  weekly: 'Раз в неделю',
  rarely: 'Редко',
}

interface FormState {
  plant_stage: Stage
  growing_environment: Env
  days_since_problem_started: number
  watering_frequency: Watering
  soil_moisture: Moisture
  has_spots: boolean
  has_dark_spots: boolean
  has_white_powder: boolean
  has_holes_in_leaves: boolean
  has_webbing: boolean
  insects_visible: boolean
  has_yellowing_lower_leaves: boolean
  has_uniform_yellowing: boolean
  has_leaf_edge_burn: boolean
  has_curled_leaves: boolean
  has_wilting: boolean
  has_stem_darkening: boolean
  has_fruit_rot: boolean
  has_blossom_end_rot: boolean
  has_slow_growth: boolean
  had_cold_nights: boolean
  had_heat_stress: boolean
  had_recent_rain: boolean
  recently_transplanted: boolean
  recently_fertilized: boolean
}

const DEFAULTS: FormState = {
  plant_stage: 'growing',
  growing_environment: 'open_field',
  days_since_problem_started: 3,
  watering_frequency: 'every_2_days',
  soil_moisture: 'normal',
  has_spots: false, has_dark_spots: false, has_white_powder: false,
  has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
  has_yellowing_lower_leaves: false, has_uniform_yellowing: false,
  has_leaf_edge_burn: false, has_curled_leaves: false, has_wilting: false,
  has_stem_darkening: false, has_fruit_rot: false, has_blossom_end_rot: false,
  has_slow_growth: false, had_cold_nights: false, had_heat_stress: false,
  had_recent_rain: false, recently_transplanted: false, recently_fertilized: false,
}

function SelectRow<T extends string>({
  label, value, options, onChange,
}: {
  label: string
  value: T
  options: Record<T, string>
  onChange: (v: T) => void
}) {
  return (
    <div className="mb-4">
      <p className="section-title">{label}</p>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(options) as [T, string][]).map(([k, v]) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors
              ${value === k
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-200'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors w-full text-left
        ${checked
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-white text-gray-600 border-gray-200'}`}
    >
      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
        ${checked ? 'bg-amber-400 border-amber-400' : 'border-gray-300'}`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </span>
      {label}
    </button>
  )
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    const crop = sessionStorage.getItem('agro_crop')
    if (!crop) { router.push('/upload'); return }

    const imagesData: string[] = JSON.parse(sessionStorage.getItem('agro_images_data') || '[]')
    const imagesNames: string[] = JSON.parse(sessionStorage.getItem('agro_images_names') || '[]')

    // DataURL → File
    const files = await Promise.all(
      imagesData.map(async (dataUrl, i) => {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        return new File([blob], imagesNames[i] || `photo_${i}.jpg`, { type: blob.type })
      }),
    )

    setLoading(true)
    setError('')
    try {
      const result = await analyzeImages(files, { ...form, crop_type: crop })
      sessionStorage.setItem('agro_result', JSON.stringify(result))
      router.push('/results')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 pb-24">
      <button onClick={() => router.back()} className="text-green-600 text-sm mb-4 flex items-center gap-1">
        ← Назад
      </button>
      <h1 className="text-xl font-bold mb-1">Расскажите о растении</h1>
      <p className="text-gray-500 text-sm mb-6">Это помогает поставить точный диагноз</p>

      <SelectRow
        label="Стадия роста"
        value={form.plant_stage}
        options={STAGE_LABELS}
        onChange={(v) => set('plant_stage', v)}
      />

      <SelectRow
        label="Где растёт"
        value={form.growing_environment}
        options={{ greenhouse: 'В теплице', open_field: 'Открытый грунт' }}
        onChange={(v) => set('growing_environment', v as Env)}
      />

      <SelectRow
        label="Влажность почвы"
        value={form.soil_moisture}
        options={MOISTURE_LABELS}
        onChange={(v) => set('soil_moisture', v)}
      />

      <SelectRow
        label="Частота полива"
        value={form.watering_frequency}
        options={WATERING_LABELS}
        onChange={(v) => set('watering_frequency', v)}
      />

      <div className="mb-4">
        <p className="section-title">Как давно появилась проблема</p>
        <div className="flex items-center gap-3">
          <input
            type="range" min={0} max={30} value={form.days_since_problem_started}
            onChange={(e) => set('days_since_problem_started', Number(e.target.value))}
            className="flex-1 accent-green-600"
          />
          <span className="text-sm font-medium w-16 text-right">
            {form.days_since_problem_started === 0 ? 'Сегодня'
              : `${form.days_since_problem_started} дн.`}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="section-title">Симптомы на листьях</p>
        <div className="grid grid-cols-1 gap-2">
          <Toggle label="Тёмные пятна" checked={form.has_dark_spots} onChange={(v) => set('has_dark_spots', v)} />
          <Toggle label="Белый налёт" checked={form.has_white_powder} onChange={(v) => set('has_white_powder', v)} />
          <Toggle label="Дырки / объеденные края" checked={form.has_holes_in_leaves} onChange={(v) => set('has_holes_in_leaves', v)} />
          <Toggle label="Паутинка" checked={form.has_webbing} onChange={(v) => set('has_webbing', v)} />
          <Toggle label="Видны насекомые" checked={form.insects_visible} onChange={(v) => set('insects_visible', v)} />
          <Toggle label="Пожелтение нижних листьев" checked={form.has_yellowing_lower_leaves} onChange={(v) => set('has_yellowing_lower_leaves', v)} />
          <Toggle label="Равномерное пожелтение" checked={form.has_uniform_yellowing} onChange={(v) => set('has_uniform_yellowing', v)} />
          <Toggle label="Подгорание краёв листьев" checked={form.has_leaf_edge_burn} onChange={(v) => set('has_leaf_edge_burn', v)} />
          <Toggle label="Скручивание листьев" checked={form.has_curled_leaves} onChange={(v) => set('has_curled_leaves', v)} />
          <Toggle label="Увядание" checked={form.has_wilting} onChange={(v) => set('has_wilting', v)} />
          <Toggle label="Потемнение стебля" checked={form.has_stem_darkening} onChange={(v) => set('has_stem_darkening', v)} />
          <Toggle label="Гниение плодов" checked={form.has_fruit_rot} onChange={(v) => set('has_fruit_rot', v)} />
          <Toggle label="Вершинная гниль (чёрный кончик плода)" checked={form.has_blossom_end_rot} onChange={(v) => set('has_blossom_end_rot', v)} />
          <Toggle label="Медленный рост" checked={form.has_slow_growth} onChange={(v) => set('has_slow_growth', v)} />
        </div>
      </div>

      <div className="mb-6">
        <p className="section-title">Условия последних дней</p>
        <div className="grid grid-cols-1 gap-2">
          <Toggle label="Холодные ночи (ниже +8°C)" checked={form.had_cold_nights} onChange={(v) => set('had_cold_nights', v)} />
          <Toggle label="Сильная жара (выше +35°C)" checked={form.had_heat_stress} onChange={(v) => set('had_heat_stress', v)} />
          <Toggle label="Недавние дожди" checked={form.had_recent_rain} onChange={(v) => set('had_recent_rain', v)} />
          <Toggle label="Недавняя пересадка" checked={form.recently_transplanted} onChange={(v) => set('recently_transplanted', v)} />
          <Toggle label="Недавнее внесение удобрений" checked={form.recently_fertilized} onChange={(v) => set('recently_fertilized', v)} />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Анализируем...
            </span>
          ) : 'Поставить диагноз →'}
        </button>
      </div>
    </div>
  )
}
