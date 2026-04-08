'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, ChevronRight, ShieldCheck, Microscope,
  Droplets, Scissors, Search, FlaskConical, ClipboardList,
  Zap, RefreshCw, Video, FileText, LayoutList, Star,
  AlertTriangle, Info, CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AnalyzeResponse, IssueResult, VideoTone } from '@/lib/api'
import { generateVideo, API_URL } from '@/lib/api'
import PaywallModal from '@/components/paywall/PaywallModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreToPercent(score: number) {
  return Math.min(99, Math.round(score * 100))
}

type UrgencyMeta = {
  label: string
  labelRu: string
  bg: string
  text: string
  border: string
  accentColor: string
  Icon: LucideIcon
}
function getUrgency(level: string): UrgencyMeta {
  const map: Record<string, UrgencyMeta> = {
    critical: {
      label: 'CRITICAL',    labelRu: 'КРИТИЧНО',
      bg: 'bg-red-600',     text: 'text-white',
      border: 'border-red-500', accentColor: '#ef4444',
      Icon: AlertTriangle,
    },
    high: {
      label: 'URGENT',      labelRu: 'СРОЧНО',
      bg: 'bg-orange-500',  text: 'text-white',
      border: 'border-orange-400', accentColor: '#f97316',
      Icon: AlertTriangle,
    },
    medium: {
      label: 'ATTENTION',   labelRu: 'ВНИМАНИЕ',
      bg: 'bg-amber-400',   text: 'text-amber-950',
      border: 'border-amber-300', accentColor: '#f59e0b',
      Icon: Info,
    },
    low: {
      label: 'MONITOR',     labelRu: 'НАБЛЮДЕНИЕ',
      bg: 'bg-emerald-500', text: 'text-white',
      border: 'border-emerald-400', accentColor: '#10b981',
      Icon: CheckCircle2,
    },
  }
  return map[level] ?? map.medium
}

function categoryLabel(category: string) {
  return ({
    fungal:    'Phytophthora spp.',
    bacterial: 'Bacterial Pathogen',
    pest:      'Insect Infestation',
    nutrient:  'Nutrient Deficiency',
    water:     'Water Stress',
    stress:    'Abiotic Stress',
  } as Record<string, string>)[category] ?? 'Plant Disease'
}

type CatStyle = { img: string; label: string }
function categoryStyle(category: string): CatStyle {
  return ({
    fungal:    { img: '/categories/fungal.jpg',    label: 'Fungal' },
    bacterial: { img: '/categories/bacterial.jpg', label: 'Bacterial' },
    pest:      { img: '/categories/pest.jpg',      label: 'Pest' },
    nutrient:  { img: '/categories/nutrient.jpg',  label: 'Nutrient' },
    water:     { img: '/categories/water.jpg',     label: 'Water' },
    stress:    { img: '/categories/stress.jpg',    label: 'Stress' },
  } as Record<string, CatStyle>)[category] ?? { img: '/categories/fungal.jpg', label: 'Disease' }
}

type ActionIconDef = { Icon: LucideIcon; color: string }
const ACTION_ICON_DEFS: ActionIconDef[] = [
  { Icon: Search,        color: '#22c55e' },
  { Icon: FlaskConical,  color: '#3b82f6' },
  { Icon: Scissors,      color: '#f97316' },
  { Icon: Droplets,      color: '#06b6d4' },
  { Icon: Microscope,    color: '#a855f7' },
  { Icon: ClipboardList, color: '#10b981' },
  { Icon: Zap,           color: '#f59e0b' },
  { Icon: ShieldCheck,   color: '#6366f1' },
]

// ── Debug Panel ───────────────────────────────────────────────────────────────

function DebugPanel({ analysisId }: { analysisId: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    if (data) { setOpen(!open); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/debug/analysis/${analysisId}`)
      if (res.ok) { setData(await res.json()); setOpen(true) }
    } finally { setLoading(false) }
  }

  return (
    <div className="border-2 border-dashed border-orange-300 rounded-2xl p-4 bg-orange-50">
      <button onClick={load} className="w-full flex items-center justify-between">
        <span className="text-orange-700 font-semibold text-sm">🛠 Debug Panel</span>
        <span className="text-orange-400 text-xs">{loading ? '...' : open ? '▲' : '▼'}</span>
      </button>
      {open && data && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-bold text-orange-600 mb-1">Signals</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(data.signals as Record<string, number>)
                .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)
                .map(([k, v]) => (
                  <div key={k} className="text-xs bg-white rounded px-2 py-1 flex justify-between">
                    <span className="text-gray-600 truncate">{k}</span>
                    <span className="text-orange-600 font-mono ml-1">{v.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-orange-600 mb-1">Score ranking</p>
            {(data.scored_issues as Array<Record<string, unknown>>).map((issue, i) => {
              const bd = issue.breakdown as Record<string, unknown>
              return (
                <div key={issue.id as string} className="bg-white rounded-lg px-3 py-2 mb-1 text-xs">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-semibold">{i + 1}. {issue.id as string}</span>
                    <span className="font-mono text-green-700">{(issue.final_score as number).toFixed(4)}</span>
                  </div>
                  <div className="text-gray-400">
                    norm={String(bd.normalized_core)} cv={String(bd.cv_bonus)} ×{String(bd.crop_stage_multiplier)}
                  </div>
                </div>
              )
            })}
          </div>
          {(data.gated_issues as unknown[]).length > 0 && (
            <div>
              <p className="text-xs font-bold text-orange-600 mb-1">Gated</p>
              {(data.gated_issues as Array<Record<string, unknown>>).map((g) => (
                <div key={g.id as string} className="text-xs text-gray-500 bg-white rounded px-2 py-1 mb-0.5">
                  {g.id as string} — {g.gated_by as string}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoJobId, setVideoJobId] = useState<string | null>(null)
  const [scriptPreview, setScriptPreview] = useState<string | null>(null)

  const debugMode = searchParams.get('debug') === '1'
  const isDemo = result?.analysis_id?.startsWith('demo_') ?? false

  useEffect(() => {
    const raw = sessionStorage.getItem('agro_result')
    if (!raw) { router.push('/upload'); return }
    setResult(JSON.parse(raw))
    try {
      const imgs = JSON.parse(sessionStorage.getItem('agro_images_data') || '[]')
      if (imgs.length > 0) setHeroImage(imgs[0])
    } catch {}
  }, [router])

  async function handleVideoConfirm(tone: VideoTone) {
    if (!result || !result.top_issues[0]) return
    setVideoLoading(true)
    try {
      const res = await generateVideo(result.analysis_id, result.top_issues[0].id, tone)
      setVideoJobId(res.video_job_id)
      const meta = res.preview_metadata as Record<string, string>
      if (meta.script_preview) setScriptPreview(meta.script_preview)
      setPaywallOpen(false)
    } catch {}
    finally { setVideoLoading(false) }
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const topIssue: IssueResult | null = result.top_issues[0] ?? null
  const hasIssues = result.top_issues.length > 0
  const urgency = getUrgency(result.urgency.level)
  const catSt = categoryStyle(topIssue?.category ?? 'fungal')
  const pct = topIssue ? scoreToPercent(topIssue.score) : 0

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Scrollable body                                                  */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-[#f0f2f5] pb-36 max-w-md mx-auto">

        {/* ══ 1. HERO ══════════════════════════════════════════════════ */}
        <div className="px-4 pt-5">
          <div
            className="relative w-full overflow-hidden"
            style={{ borderRadius: 28, height: 272 }}
          >
            {/* Background: user's photo, or category photo as fallback */}
            <img
              src={heroImage ?? catSt.img}
              alt="Plant"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.65) 100%)',
              }}
            />

            {/* Back button */}
            <button
              onClick={() => router.push('/upload')}
              className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full flex items-center justify-center
                         backdrop-blur-md"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} className="text-white" />
            </button>

            {/* Demo pill */}
            {isDemo && (
              <span
                className="absolute top-3.5 left-[60px] text-[10px] font-bold px-2.5 py-1 rounded-full
                           bg-amber-400 text-amber-900 tracking-widest"
              >
                DEMO
              </span>
            )}

            {/* Confidence badge — top right */}
            <div
              className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-[7px] rounded-full"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.55)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              <ShieldCheck size={11} strokeWidth={2.5} className="text-emerald-600" />
              <span style={{ fontSize: 10.5, letterSpacing: '0.08em', fontWeight: 800 }} className="text-gray-900">
                {pct}% CONFIDENCE
              </span>
            </div>

            {/* ID watermark */}
            <span className="absolute bottom-3 right-3.5 text-white/40 text-[10px] font-mono">
              #{result.analysis_id.slice(-6)}
            </span>
          </div>
        </div>

        {/* ══ 2. TITLE ═════════════════════════════════════════════════ */}
        {hasIssues && topIssue ? (
          <div className="px-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1
                  className="font-black text-gray-900"
                  style={{ fontSize: 30, letterSpacing: '-0.04em', lineHeight: 1.05 }}
                >
                  {topIssue.title}
                </h1>
                <p
                  className="italic text-gray-400/75 mt-1.5 font-normal tracking-wide"
                  style={{ fontSize: 12.5 }}
                >
                  {categoryLabel(topIssue.category)}
                </p>
              </div>

              {/* Urgency badge */}
              <span
                className={`flex-shrink-0 flex items-center gap-1 font-bold
                             px-3 py-1.5 rounded-full mt-1 tracking-wider ${urgency.bg} ${urgency.text}`}
                style={{ fontSize: 10.5 }}
              >
                <urgency.Icon size={10} strokeWidth={2.5} />
                {urgency.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="px-5 pt-8 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
            <h1 className="text-xl font-bold text-gray-800 mb-1">Plant Looks Healthy</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              No clear signs of disease or deficiency detected. Monitor for 2–3 days.
            </p>
          </div>
        )}

        {/* ══ 3. DESCRIPTION CARD ══════════════════════════════════════ */}
        {topIssue && (
          <div className="px-5 mt-5">
            <div
              className="bg-white rounded-2xl px-5 py-4"
              style={{
                borderLeft: `3px solid ${urgency.accentColor}`,
                boxShadow: '0 1px 10px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <p className="italic text-gray-600 leading-[1.65]" style={{ fontSize: 13.5 }}>
                {result.urgency.reason}
              </p>
              {topIssue.why[0] && (
                <p
                  className="text-gray-400 mt-3 leading-relaxed not-italic"
                  style={{ fontSize: 12 }}
                >
                  {topIssue.why[0]}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══ 4. IMMEDIATE PROTOCOL ════════════════════════════════════ */}
        {result.today_actions.length > 0 && (
          <section className="px-5 mt-9">
            <p
              className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase mb-4"
              style={{ fontSize: 10 }}
            >
              Immediate Protocol
            </p>
            <div className="space-y-2.5">
              {result.today_actions.slice(0, 6).map((action, i) => {
                const def = ACTION_ICON_DEFS[i] ?? ACTION_ICON_DEFS[0]
                const { Icon } = def
                return (
                  <div
                    key={i}
                    className="bg-white rounded-[18px] flex items-center gap-3.5 px-4 py-4
                               hover:-translate-y-[2px] active:scale-[0.985] cursor-default
                               transition-all duration-200 ease-out"
                    style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)' }}
                  >
                    {/* Icon circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${def.color}14`,
                        border: `1px solid ${def.color}35`,
                      }}
                    >
                      <Icon size={18} strokeWidth={1.75} color={def.color} />
                    </div>

                    {/* Text */}
                    <p
                      className="flex-1 font-medium text-gray-800 min-w-0"
                      style={{ fontSize: 13.5, lineHeight: 1.45 }}
                    >
                      {action}
                    </p>

                    <ChevronRight size={16} strokeWidth={1.75} className="text-gray-300/80 flex-shrink-0 mr-0.5" />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ══ 5. DIFFERENTIAL DIAGNOSIS ════════════════════════════════ */}
        {result.top_issues.length > 1 && (
          <section className="mt-9">
            <p
              className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase mb-4 px-5"
              style={{ fontSize: 10 }}
            >
              Differential Diagnosis
            </p>
            <div className="flex gap-3.5 overflow-x-auto px-5 pb-2 no-scrollbar">
              {result.top_issues.map((issue, i) => {
                const cs = categoryStyle(issue.category)
                const issuePct = scoreToPercent(issue.score)
                const isTop = i === 0
                return (
                  <div key={issue.id} className="flex-shrink-0 w-32">
                    {/* Thumbnail */}
                    <div
                      className="w-32 h-32 rounded-2xl relative overflow-hidden"
                      style={{
                        boxShadow: isTop
                          ? '0 4px 20px rgba(16,185,129,0.30)'
                          : '0 2px 12px rgba(0,0,0,0.12)',
                      }}
                    >
                      {/* Real category photo */}
                      <img
                        src={cs.img}
                        alt={cs.label}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Bottom fade for text legibility */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.58) 100%)',
                        }}
                      />

                      {/* % overlay pill */}
                      <div
                        className={`absolute bottom-2 left-1/2 -translate-x-1/2
                                    px-2.5 py-[3px] rounded-full text-[10px] font-black
                                    whitespace-nowrap tracking-wide`}
                        style={
                          isTop
                            ? { background: '#4ade80', color: '#052e16' }
                            : { background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.9)' }
                        }
                      >
                        {issuePct}% MATCH
                      </div>

                      {/* Top-right category chip */}
                      <div
                        className="absolute top-2 right-2 px-2 py-0.5 rounded-full
                                   text-[9px] font-bold tracking-wide"
                        style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)' }}
                      >
                        {cs.label.toUpperCase()}
                      </div>
                    </div>

                    <p className="text-[11.5px] font-semibold text-gray-700 mt-2 leading-tight
                                  text-center line-clamp-2 px-0.5">
                      {issue.title}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ══ 6. PREMIUM BLOCK ═════════════════════════════════════════ */}
        {topIssue && result.upsell.video_available && (
          <section className="px-5 mt-9">
            {videoJobId ? (
              /* ── Video job created ── */
              <div
                className="rounded-2xl p-5 text-white"
                style={{ background: 'linear-gradient(135deg, #14532d, #052e16)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <Video size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Request Created</p>
                    <p className="text-emerald-300 text-xs mt-0.5">
                      Your video consultation will be ready in a few minutes
                    </p>
                  </div>
                </div>
                {scriptPreview && (
                  <div
                    className="rounded-xl p-3 mt-1"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-widest mb-1.5">
                      Script Preview
                    </p>
                    <p className="text-xs text-emerald-100 italic leading-relaxed">{scriptPreview}</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── Upsell card ── */
              <div
                className="rounded-[24px] overflow-hidden"
                style={{
                  background: 'linear-gradient(158deg, #173326 0%, #0b1e12 55%, #071410 100%)',
                  boxShadow:
                    '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(74,222,128,0.08), 0 0 32px rgba(74,222,128,0.08)',
                  border: '1px solid rgba(74,222,128,0.10)',
                }}
              >
                {/* Top section */}
                <div className="px-5 pt-6 pb-5 flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    {/* Microcopy — context setter */}
                    <p
                      className="mb-2"
                      style={{ fontSize: 11, color: 'rgba(167,243,208,0.45)', letterSpacing: '0.01em' }}
                    >
                      We analyzed your exact case
                    </p>
                    {/* Expert verified label */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                      style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}
                    >
                      <Star size={10} strokeWidth={0} className="fill-emerald-400 text-emerald-400" />
                      <span
                        className="font-bold tracking-[0.18em] text-emerald-400 uppercase"
                        style={{ fontSize: 9.5 }}
                      >
                        Expert Verified
                      </span>
                    </div>
                    <h3
                      className="text-white font-black leading-[1.15]"
                      style={{ fontSize: 20, letterSpacing: '-0.02em' }}
                    >
                      Consult a Lead{'\n'}Agronomist
                    </h3>
                    <p
                      className="mt-2 leading-snug"
                      style={{ fontSize: 12.5, color: 'rgba(167,243,208,0.55)' }}
                    >
                      30–60 sec · personalized video analysis
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0" style={{ position: 'relative' }}>
                    <div
                      className="w-[60px] h-[60px] rounded-full overflow-hidden"
                      style={{
                        border: '2.5px solid rgba(74,222,128,0.40)',
                        boxShadow: '0 0 0 4px rgba(74,222,128,0.08)',
                      }}
                    >
                      <img
                        src="/avatar-agronomist.jpg"
                        alt="Agronomist"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online dot */}
                    <div
                      className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full"
                      style={{
                        background: '#4ade80',
                        border: '2px solid #0b1e12',
                        boxShadow: '0 0 6px rgba(74,222,128,0.6)',
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.055)', margin: '0 20px' }} />

                {/* Bullets */}
                <div className="px-5 pt-4 pb-5 space-y-4">
                  {[
                    { Icon: Video,      color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: 'Personal video diagnosis for your exact case' },
                    { Icon: FileText,   color: '#93c5fd', bg: 'rgba(147,197,253,0.12)', label: 'Treatment prescription with exact dosages' },
                    { Icon: LayoutList, color: '#fcd34d', bg: 'rgba(252,211,77,0.12)',  label: 'Step-by-step care plan for your crop stage' },
                  ].map(({ Icon, color, bg, label }, i) => (
                    <div key={i} className="flex items-center gap-3.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: bg, border: `1px solid ${color}25` }}
                      >
                        <Icon size={17} strokeWidth={1.75} color={color} />
                      </div>
                      <p
                        className="leading-snug flex-1"
                        style={{ fontSize: 13.5, color: 'rgba(209,250,229,0.75)' }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-5 pb-6">
                  <button
                    onClick={() => setPaywallOpen(true)}
                    className="w-full rounded-[14px] font-black tracking-wide
                               active:scale-[0.97] active:brightness-95 transition-all duration-150"
                    style={{
                      padding: '16px 0',
                      fontSize: 15,
                      background: 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)',
                      color: '#022c17',
                      boxShadow: '0 6px 28px rgba(34,197,94,0.45), 0 1px 4px rgba(0,0,0,0.2)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Book Consultation →
                  </button>
                  {/* Trust line */}
                  <p
                    className="text-center mt-2.5"
                    style={{ fontSize: 11, color: 'rgba(167,243,208,0.40)', letterSpacing: '0.01em' }}
                  >
                    Most users fix the issue within 2–3 days
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ══ RE-SCAN ══════════════════════════════════════════════════ */}
        <section className="px-5 mt-3.5">
          <button
            onClick={() => router.push(`/upload?followup=${result.analysis_id}`)}
            className="w-full bg-white rounded-2xl flex items-center gap-4 px-4 py-3.5
                       active:bg-gray-50 transition-colors"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={19} strokeWidth={2} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13.5px] font-bold text-gray-800">Re-scan in 2–3 days</p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">Track progress and adjust the plan</p>
            </div>
            <ChevronRight size={18} strokeWidth={2} className="text-gray-300 flex-shrink-0" />
          </button>
        </section>

        {/* ══ DEBUG ════════════════════════════════════════════════════ */}
        {debugMode && (
          <div className="px-5 mt-4">
            <DebugPanel analysisId={result.analysis_id} />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* BOTTOM NAV                                                       */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-end justify-around px-2 pt-2 pb-4">

          {/* Home */}
          <button
            onClick={() => router.push('/upload')}
            className="flex flex-col items-center gap-[5px] px-4"
            style={{ color: '#9ca3af' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                 stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
            <span style={{ fontSize: 9.5 }} className="font-medium">Home</span>
          </button>

          {/* Results — active */}
          <button className="flex flex-col items-center gap-[5px] px-4 relative">
            <div
              className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
              style={{ background: '#ecfdf5' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                   stroke="#16a34a" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <circle cx="17.5" cy="17.5" r="3.5" />
              </svg>
            </div>
            <span style={{ fontSize: 9.5 }} className="font-bold text-emerald-600">Results</span>
            <span
              className="absolute -bottom-0.5 w-[18px] h-[3px] rounded-full bg-emerald-500"
            />
          </button>

          {/* Center scan button — intentional focal point */}
          <button
            onClick={() => router.push('/upload')}
            className="flex flex-col items-center gap-[5px] -mt-6"
          >
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #22c55e, #15803d)',
                boxShadow: '0 4px 24px rgba(22,163,74,0.50), 0 1px 4px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"
                   stroke="white" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: 9.5, color: '#9ca3af' }} className="font-medium">Scan</span>
          </button>

          {/* History */}
          <button
            className="flex flex-col items-center gap-[5px] px-4"
            style={{ color: '#9ca3af' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                 stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            <span style={{ fontSize: 9.5 }} className="font-medium">History</span>
          </button>

          {/* Settings */}
          <button
            className="flex flex-col items-center gap-[5px] px-4"
            style={{ color: '#9ca3af' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                 stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0
                       l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2
                       2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06
                       a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65
                       0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65
                       0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0
                       009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0
                       001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83
                       l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0
                       01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span style={{ fontSize: 9.5 }} className="font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* PAYWALL MODAL */}
      {paywallOpen && (
        <PaywallModal
          mode="video"
          loading={videoLoading}
          onClose={() => !videoLoading && setPaywallOpen(false)}
          onVideoConfirm={handleVideoConfirm}
        />
      )}
    </>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
