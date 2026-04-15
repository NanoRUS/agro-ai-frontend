'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Sprout, Droplets, Search, CloudRain,
  Check, Minus, Plus, Brain, Loader2,
} from 'lucide-react'
import { analyzeImages } from '@/lib/api'

// ── Types & labels (unchanged) ────────────────────────────────────────────────

type Stage    = 'seedling' | 'growing' | 'flowering' | 'fruiting'
type Env      = 'indoor' | 'greenhouse' | 'open_field'
type Moisture = 'very_wet' | 'wet' | 'normal' | 'dry' | 'very_dry'
type Watering = 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'rarely'

const STAGE_LABELS: Record<Stage, string> = {
  seedling: 'Рассада', growing: 'Рост', flowering: 'Цветение', fruiting: 'Плодоношение',
}
const MOISTURE_LABELS: Record<Moisture, string> = {
  very_wet: 'Мокрая', wet: 'Влажная', normal: 'Нормальная', dry: 'Сухая', very_dry: 'Очень сухая',
}
const WATERING_LABELS: Record<Watering, string> = {
  daily: 'Каждый день', every_2_days: 'Раз в 2 дня', every_3_days: 'Раз в 3 дня',
  weekly: 'Раз в неделю', rarely: 'Редко',
}

interface FormState {
  plant_stage: Stage; growing_environment: Env
  days_since_problem_started: number
  watering_frequency: Watering; soil_moisture: Moisture
  has_spots: boolean; has_dark_spots: boolean; has_white_powder: boolean
  has_holes_in_leaves: boolean; has_webbing: boolean; insects_visible: boolean
  has_yellowing_lower_leaves: boolean; has_uniform_yellowing: boolean
  has_leaf_edge_burn: boolean; has_curled_leaves: boolean; has_wilting: boolean
  has_stem_darkening: boolean; has_fruit_rot: boolean; has_blossom_end_rot: boolean
  has_slow_growth: boolean; had_cold_nights: boolean; had_heat_stress: boolean
  had_recent_rain: boolean; recently_transplanted: boolean; recently_fertilized: boolean
}

const DEFAULTS: FormState = {
  plant_stage: 'growing', growing_environment: 'indoor',
  days_since_problem_started: 3, watering_frequency: 'every_2_days', soil_moisture: 'normal',
  has_spots: false, has_dark_spots: false, has_white_powder: false,
  has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
  has_yellowing_lower_leaves: false, has_uniform_yellowing: false,
  has_leaf_edge_burn: false, has_curled_leaves: false, has_wilting: false,
  has_stem_darkening: false, has_fruit_rot: false, has_blossom_end_rot: false,
  has_slow_growth: false, had_cold_nights: false, had_heat_stress: false,
  had_recent_rain: false, recently_transplanted: false, recently_fertilized: false,
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function SectionCard({
  icon, title, subtitle, children,
}: {
  icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode
}) {
  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: 'white',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-2"
           style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <span className="text-emerald-600">{icon}</span>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                         color: 'rgba(107,114,128,0.85)', textTransform: 'uppercase' as const }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 6 }}>{subtitle}</span>
          )}
        </div>
      </div>
      <div className="px-4 py-4 space-y-5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#374151',
                  marginBottom: 8, letterSpacing: '-0.01em' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function SelectPills<T extends string>({
  value, options, onChange,
}: { value: T; options: Record<T, string>; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.entries(options) as [T, string][]).map(([k, label]) => {
        const sel = value === k
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className="px-3.5 py-2 rounded-[12px] transition-all duration-200 active:scale-[0.95]"
            style={{
              fontSize: 13, fontWeight: sel ? 700 : 500,
              background: sel ? '#f0fdf4' : 'rgba(0,0,0,0.03)',
              border: `1.5px solid ${sel ? '#22c55e' : 'rgba(0,0,0,0.08)'}`,
              color: sel ? '#15803d' : '#4b5563',
              boxShadow: sel ? '0 0 0 3px rgba(34,197,94,0.10)' : 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function SymptomToggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-3.5 py-[11px] rounded-[14px]
                 text-left transition-all duration-150 active:scale-[0.98]"
      style={{
        background: checked ? '#f0fdf4' : 'rgba(0,0,0,0.025)',
        border: `1.5px solid ${checked ? '#22c55e' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: checked ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
      }}
    >
      <span style={{
        fontSize: 13.5, fontWeight: checked ? 600 : 400,
        color: checked ? '#166534' : '#6b7280', lineHeight: 1.35,
      }}>
        {label}
      </span>
      {checked && (
        <Check size={15} strokeWidth={2.5} className="text-emerald-500 flex-shrink-0 ml-2" />
      )}
    </button>
  )
}

function DayStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between px-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-10 h-10 rounded-full flex items-center justify-center
                   transition-all duration-150 active:scale-[0.90]"
        style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <Minus size={16} strokeWidth={2} className="text-gray-500" />
      </button>

      <div className="text-center">
        <p style={{ fontSize: 28, fontWeight: 800, color: '#1f2937',
                    letterSpacing: '-0.04em', lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 3 }}>
          {value === 0 ? 'сегодня' : value === 1 ? 'день назад' : 'дней назад'}
        </p>
      </div>

      <button
        onClick={() => onChange(Math.min(30, value + 1))}
        className="w-10 h-10 rounded-full flex items-center justify-center
                   transition-all duration-150 active:scale-[0.90]"
        style={{
          background: 'rgba(22,163,74,0.10)',
          border: '1.5px solid rgba(22,163,74,0.25)',
        }}
      >
        <Plus size={16} strokeWidth={2} className="text-emerald-600" />
      </button>
    </div>
  )
}

function LoadingOverlay({ onCancel }: { onCancel: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const message =
    elapsed < 10  ? 'AI анализирует фото...' :
    elapsed < 20  ? 'Почти готово...' :
    elapsed < 30  ? 'Ещё немного...' :
                    'Сервер отвечает медленно'

  const hint =
    elapsed < 10  ? 'Обычно занимает 10–30 секунд' :
    elapsed < 30  ? `Прошло ${elapsed} секунд` :
                    'Проверьте подключение или попробуйте позже'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
      style={{
        background: 'rgba(240,242,245,0.96)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div
        className="w-20 h-20 rounded-[24px] flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #22c55e, #15803d)',
          boxShadow: '0 8px 32px rgba(34,197,94,0.40)',
        }}
      >
        <Loader2 size={34} strokeWidth={2} className="text-white animate-spin" />
      </div>

      <div className="text-center px-8">
        <p style={{ fontSize: 18, fontWeight: 800, color: '#1f2937',
                    letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {message}
        </p>
        <p style={{ fontSize: 13, color: elapsed >= 30 ? '#dc2626' : '#9ca3af', marginTop: 6 }}>
          {hint}
        </p>
      </div>

      {elapsed >= 15 && (
        <button
          onClick={onCancel}
          className="mt-2 px-5 py-2.5 rounded-[12px] transition-all active:scale-[0.96]"
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.10)',
            fontSize: 13.5, fontWeight: 600, color: '#6b7280',
          }}
        >
          Отменить
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter()
  const [form,    setForm]    = useState<FormState>(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function cancelLoading() {
    setLoading(false)
    setError('Анализ отменён. Проверьте подключение к интернету.')
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    const crop = sessionStorage.getItem('agro_crop')
    if (!crop) { router.push('/upload'); return }
    const imagesData: string[] = JSON.parse(sessionStorage.getItem('agro_images_data') || '[]')
    const imagesNames: string[] = JSON.parse(sessionStorage.getItem('agro_images_names') || '[]')
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
      sessionStorage.setItem('agro_env', form.growing_environment)
      router.push('/results')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-32">

      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="px-5 pt-5 pb-1 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center
                     transition-all duration-150 active:scale-[0.90]"
          style={{
            background: 'white',
            boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <ArrowLeft size={17} strokeWidth={2.2} className="text-gray-600" />
        </button>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                    color: '#9ca3af', textTransform: 'uppercase' as const }}>
          Шаг 2 из 2
        </p>
      </div>

      {/* ══ INTRO ════════════════════════════════════════════════════════ */}
      <div className="px-5 pt-4 pb-6">
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827',
                     letterSpacing: '-0.04em', lineHeight: 1.05 }}>
          Расскажите о растении
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 7, lineHeight: 1.55 }}>
          Несколько вопросов помогут AI точнее определить причину
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <Brain size={12} strokeWidth={2} className="text-emerald-500" />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Займёт около 2 минут</span>
        </div>
      </div>

      {/* ══ SECTIONS ═════════════════════════════════════════════════════ */}
      <div className="px-4 space-y-4">

        {/* ── 1. PLANT ── */}
        <SectionCard icon={<Sprout size={14} strokeWidth={2} />} title="Растение">
          <Field label="Стадия роста">
            <SelectPills
              value={form.plant_stage}
              options={STAGE_LABELS}
              onChange={(v) => set('plant_stage', v)}
            />
          </Field>
          <Field label="Где растёт">
            <SelectPills
              value={form.growing_environment}
              options={{ indoor: 'В помещении', greenhouse: 'В теплице', open_field: 'В открытом грунте' } as Record<Env, string>}
              onChange={(v) => set('growing_environment', v as Env)}
            />
          </Field>
        </SectionCard>

        {/* ── 2. WATER ── */}
        <SectionCard icon={<Droplets size={14} strokeWidth={2} />} title="Полив и почва">
          <Field label="Частота полива">
            <SelectPills
              value={form.watering_frequency}
              options={WATERING_LABELS}
              onChange={(v) => set('watering_frequency', v)}
            />
          </Field>
          <Field label="Влажность почвы сейчас">
            <SelectPills
              value={form.soil_moisture}
              options={MOISTURE_LABELS}
              onChange={(v) => set('soil_moisture', v)}
            />
          </Field>
          <Field label="Когда появилась проблема">
            <DayStepper
              value={form.days_since_problem_started}
              onChange={(v) => set('days_since_problem_started', v)}
            />
          </Field>
        </SectionCard>

        {/* ── 3. SYMPTOMS ── */}
        <SectionCard
          icon={<Search size={14} strokeWidth={2} />}
          title="Симптомы"
          subtitle="— отметьте всё, что видите"
        >
          <div className="space-y-2 -mt-1">
            <SymptomToggle label="Тёмные пятна на листьях"            checked={form.has_dark_spots}            onChange={(v) => set('has_dark_spots', v)} />
            <SymptomToggle label="Белый налёт (мучнистый)"             checked={form.has_white_powder}          onChange={(v) => set('has_white_powder', v)} />
            <SymptomToggle label="Дырки или объеденные края"           checked={form.has_holes_in_leaves}       onChange={(v) => set('has_holes_in_leaves', v)} />
            <SymptomToggle label="Паутинка на листьях"                 checked={form.has_webbing}               onChange={(v) => set('has_webbing', v)} />
            <SymptomToggle label="Видны насекомые"                     checked={form.insects_visible}           onChange={(v) => set('insects_visible', v)} />
            <SymptomToggle label="Пожелтение нижних листьев"           checked={form.has_yellowing_lower_leaves} onChange={(v) => set('has_yellowing_lower_leaves', v)} />
            <SymptomToggle label="Равномерное пожелтение"              checked={form.has_uniform_yellowing}     onChange={(v) => set('has_uniform_yellowing', v)} />
            <SymptomToggle label="Подгорание краёв листьев"            checked={form.has_leaf_edge_burn}        onChange={(v) => set('has_leaf_edge_burn', v)} />
            <SymptomToggle label="Скручивание листьев"                 checked={form.has_curled_leaves}         onChange={(v) => set('has_curled_leaves', v)} />
            <SymptomToggle label="Увядание"                            checked={form.has_wilting}               onChange={(v) => set('has_wilting', v)} />
            <SymptomToggle label="Потемнение стебля"                   checked={form.has_stem_darkening}        onChange={(v) => set('has_stem_darkening', v)} />
            <SymptomToggle label="Гниение плодов"                      checked={form.has_fruit_rot}             onChange={(v) => set('has_fruit_rot', v)} />
            <SymptomToggle label="Вершинная гниль — чёрный кончик"     checked={form.has_blossom_end_rot}       onChange={(v) => set('has_blossom_end_rot', v)} />
            <SymptomToggle label="Медленный рост"                      checked={form.has_slow_growth}           onChange={(v) => set('has_slow_growth', v)} />
          </div>
        </SectionCard>

        {/* ── 4. CONDITIONS ── */}
        <SectionCard
          icon={<CloudRain size={14} strokeWidth={2} />}
          title="Условия последних дней"
        >
          <div className="space-y-2 -mt-1">
            <SymptomToggle label="Холодные ночи (ниже +8°C)"         checked={form.had_cold_nights}       onChange={(v) => set('had_cold_nights', v)} />
            <SymptomToggle label="Сильная жара (выше +35°C)"         checked={form.had_heat_stress}       onChange={(v) => set('had_heat_stress', v)} />
            <SymptomToggle label="Недавние дожди"                    checked={form.had_recent_rain}       onChange={(v) => set('had_recent_rain', v)} />
            <SymptomToggle label="Недавняя пересадка"                checked={form.recently_transplanted} onChange={(v) => set('recently_transplanted', v)} />
            <SymptomToggle label="Недавнее внесение удобрений"       checked={form.recently_fertilized}   onChange={(v) => set('recently_fertilized', v)} />
          </div>
        </SectionCard>

      </div>

      {/* ══ FIXED CTA ════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 max-w-md mx-auto px-4 pt-3 pb-4"
        style={{
          background: 'rgba(240,242,245,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Error shown here so it's always visible */}
        {error && (
          <div
            className="flex items-start gap-2.5 mb-3 px-3.5 py-2.5 rounded-[12px]"
            style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,0.20)' }}
          >
            <span style={{ fontSize: 12.5, color: '#dc2626', fontWeight: 500, lineHeight: 1.4 }}>
              {error}
            </span>
            <button
              onClick={() => setError('')}
              style={{ fontSize: 16, color: '#dc2626', lineHeight: 1, marginLeft: 'auto', flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-[14px] font-black tracking-wide
                     transition-all duration-150 active:scale-[0.97] active:brightness-95
                     disabled:cursor-not-allowed"
          style={{
            padding: '16px 0',
            fontSize: 15,
            letterSpacing: '0.01em',
            background: 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)',
            color: '#022c17',
            boxShadow: '0 6px 28px rgba(34,197,94,0.35), 0 1px 4px rgba(0,0,0,0.10)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          Поставить диагноз →
        </button>
      </div>

      {/* ══ LOADING OVERLAY ══════════════════════════════════════════════ */}
      {loading && <LoadingOverlay onCancel={cancelLoading} />}
    </div>
  )
}
