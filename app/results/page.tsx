'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { AnalyzeResponse, IssueResult, VideoTone } from '@/lib/api'
import { generateVideo } from '@/lib/api'
import {
  URGENCY_COPY, CONFIDENCE_COPY, IF_NOTHING_RISKS, CATEGORY_RISK_ADDON,
  ACTIONS_COPY, ALTERNATIVES_COPY, FOLLOWUP_COPY, VIDEO_TEASER_COPY,
  VIDEO_TONE_LABELS,
} from '@/lib/copy'
import PaywallModal from '@/components/paywall/PaywallModal'

// ─── 1. Hero Diagnosis Block ──────────────────────────────────────────────────

function HeroDiagnosisBlock({
  topIssue,
  urgencyLevel,
  urgencyReason,
}: {
  topIssue: IssueResult
  urgencyLevel: string
  urgencyReason: string
}) {
  const u = URGENCY_COPY[urgencyLevel] ?? URGENCY_COPY.medium

  return (
    <div className={`rounded-2xl p-5 ${u.bg} border ${u.border}`}>
      {/* Badge row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl leading-none">{u.icon}</span>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${u.badgeBg} ${u.badgeText}`}>
          {u.badge}
        </span>
      </div>

      {/* Diagnosis title */}
      <h1 className={`text-xl font-bold leading-tight ${u.text} mb-1`}>
        Похоже на: {topIssue.title}
      </h1>

      {/* Consequence line */}
      <p className={`text-sm font-medium ${u.text} opacity-90 mb-2`}>
        {u.consequence}
      </p>

      {/* Urgency reason from engine */}
      <p className={`text-sm ${u.text} opacity-75 border-t ${u.border} pt-2 mt-2`}>
        {urgencyReason}
      </p>
    </div>
  )
}

// ─── No issues state ──────────────────────────────────────────────────────────

function NoIssuesBlock() {
  return (
    <div className="card text-center py-8">
      <div className="text-4xl mb-3">🌿</div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">Растение выглядит здоровым</h2>
      <p className="text-sm text-gray-500">
        Явных признаков болезней или дефицитов не обнаружено.
        Понаблюдайте 2–3 дня и повторите диагностику при ухудшении.
      </p>
    </div>
  )
}

// ─── 2. Confidence Block ──────────────────────────────────────────────────────

function ConfidenceBlock({ issue }: { issue: IssueResult }) {
  const conf = CONFIDENCE_COPY[issue.confidence_label] ?? CONFIDENCE_COPY.medium

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        {/* Bar */}
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${conf.barColor} ${conf.barWidth}`} />
        </div>
        <span className={`text-sm font-semibold flex-shrink-0 ${conf.color}`}>
          {conf.label}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{conf.explanation}</p>
      {conf.retakeHint && (
        <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
          <span className="font-medium">📸 Для уточнения диагноза:</span> {conf.retakeHint}
        </p>
      )}
    </div>
  )
}

// ─── 3. Why We Think This ────────────────────────────────────────────────────

function WhyBlock({ issue }: { issue: IssueResult }) {
  if (!issue.why.length) return null

  return (
    <div className="card">
      <p className="section-title">Почему мы так думаем</p>
      <ul className="space-y-2 mb-3">
        {issue.why.slice(0, 5).map((w, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center
                             justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="leading-relaxed">{w}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 border-t border-gray-50 pt-2">
        Это типичный сценарий для «{issue.title}»
      </p>
    </div>
  )
}

// ─── 4. Today Actions Block ───────────────────────────────────────────────────

function TodayActionsBlock({ actions }: { actions: string[] }) {
  const [showAll, setShowAll] = useState(false)
  if (!actions.length) return null

  const visible = showAll ? actions : actions.slice(0, 4)
  const hasMore = actions.length > 4

  return (
    <div className="card">
      <p className="section-title">{ACTIONS_COPY.title}</p>
      <p className="text-xs text-gray-500 mb-3 -mt-1">{ACTIONS_COPY.subtitle}</p>
      <ol className="space-y-3">
        {visible.map((action, i) => (
          <li key={i} className={`flex gap-3 ${i < 3 ? 'text-gray-900' : 'text-gray-600'}`}>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full font-bold text-xs
                              flex items-center justify-center mt-0.5
                              ${i < 3 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {i + 1}
            </span>
            <span className={`text-sm leading-relaxed ${i < 3 ? 'font-medium' : ''}`}>
              {action}
            </span>
          </li>
        ))}
      </ol>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-green-600 font-medium"
        >
          {showAll ? ACTIONS_COPY.showLess : ACTIONS_COPY.showMore(actions.length - 4)}
        </button>
      )}
    </div>
  )
}

// ─── 5. If Nothing Block ─────────────────────────────────────────────────────

function IfNothingBlock({
  urgencyLevel,
  category,
}: {
  urgencyLevel: string
  category: string
}) {
  if (urgencyLevel === 'low') return null

  const risks = IF_NOTHING_RISKS[urgencyLevel] ?? IF_NOTHING_RISKS.medium
  const addon = CATEGORY_RISK_ADDON[category]

  const allRisks = addon ? [...risks, addon] : risks

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
      <p className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
        <span>🔥</span> Если ничего не делать
      </p>
      <ul className="space-y-2">
        {allRisks.slice(0, 4).map((risk, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-red-700">
            <span className="text-red-400 flex-shrink-0 mt-0.5">→</span>
            <span>{risk}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── 6. Alternative Explanations ─────────────────────────────────────────────

function AlternativesBlock({ issues }: { issues: IssueResult[] }) {
  const alternatives = issues.slice(1)
  if (!alternatives.length) return null

  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <p className="section-title mb-0">{ALTERNATIVES_COPY.title}</p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-400 font-medium"
        >
          {expanded ? 'Скрыть ▲' : 'Показать ▼'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3">{ALTERNATIVES_COPY.subtitle}</p>

      {expanded && (
        <div className="space-y-2">
          {alternatives.map((issue) => {
            const conf = CONFIDENCE_COPY[issue.confidence_label]
            return (
              <div key={issue.id} className="flex items-start gap-3 py-2 border-t border-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                  <p className={`text-xs mt-0.5 ${conf.color}`}>{conf.label}</p>
                </div>
                {/* Inline mini bar */}
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 mt-1.5">
                  <div className={`h-full rounded-full ${conf.barColor} ${conf.barWidth}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!expanded && (
        <div className="flex gap-2 flex-wrap">
          {alternatives.map((issue) => (
            <span
              key={issue.id}
              className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
            >
              {issue.title}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 7. Video Upsell (in-page teaser) ────────────────────────────────────────

function VideoUpsellTeaser({
  jobId,
  scriptPreview,
  onOpen,
}: {
  jobId: string | null
  scriptPreview: string | null
  onOpen: () => void
}) {
  const c = VIDEO_TEASER_COPY

  if (jobId) {
    return (
      <div className="rounded-2xl bg-green-700 text-white p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎬</span>
          <div>
            <p className="font-bold">✅ Запрос создан</p>
            <p className="text-green-200 text-xs">Видео будет готово в течение нескольких минут</p>
          </div>
        </div>
        {scriptPreview && (
          <div className="bg-white/10 rounded-xl p-3 mt-3">
            <p className="text-xs text-green-300 font-medium mb-1">{c.scriptPreviewLabel}</p>
            <p className="text-xs text-green-100 italic leading-relaxed">{scriptPreview}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      {/* Green header strip */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 px-5 pt-5 pb-4 text-white">
        <h3 className="font-bold text-lg leading-tight">{c.title}</h3>
        <p className="text-green-200 text-xs mt-0.5">{c.subtitle}</p>
      </div>

      {/* Content */}
      <div className="bg-white px-5 pt-4 pb-5">
        <ul className="space-y-2 mb-4">
          {c.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onOpen}
          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm
                     active:bg-green-700 transition-colors"
        >
          {c.cta}
        </button>
      </div>
    </div>
  )
}

// ─── 8. Follow-up Block ───────────────────────────────────────────────────────

function FollowUpBlock({ analysisId }: { analysisId: string }) {
  const router = useRouter()
  const c = FOLLOWUP_COPY

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🔄</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{c.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">{c.body}</p>
          <button
            onClick={() => router.push(`/upload?followup=${analysisId}`)}
            className="btn-secondary text-sm py-2.5"
          >
            {c.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Debug Panel (dev only, ?debug=1) ─────────────────────────────────────────

function DebugPanel({ analysisId }: { analysisId: string }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
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
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
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

// ─── Main page ─────────────────────────────────────────────────────────────────

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  // Paywall state
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
    } catch {
      // leave modal open on error so user sees the state
    } finally {
      setVideoLoading(false)
    }
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const topIssue = result.top_issues[0] ?? null
  const hasIssues = result.top_issues.length > 0

  return (
    <>
      <div className="px-4 py-6 pb-12 space-y-4 max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/upload')} className="text-green-600 text-sm font-medium">
            ← Новая диагностика
          </button>
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                ДЕМО
              </span>
            )}
            <span className="text-xs text-gray-400">#{result.analysis_id.slice(-6)}</span>
          </div>
        </div>

        {/* ── 1. Hero diagnosis ── */}
        {hasIssues && topIssue ? (
          <HeroDiagnosisBlock
            topIssue={topIssue}
            urgencyLevel={result.urgency.level}
            urgencyReason={result.urgency.reason}
          />
        ) : (
          <NoIssuesBlock />
        )}

        {/* ── 2. Confidence ── */}
        {topIssue && <ConfidenceBlock issue={topIssue} />}

        {/* ── 3. Why we think this ── */}
        {topIssue && <WhyBlock issue={topIssue} />}

        {/* ── 4. Today actions ── */}
        <TodayActionsBlock actions={result.today_actions} />

        {/* ── 5. If nothing ── */}
        {topIssue && (
          <IfNothingBlock
            urgencyLevel={result.urgency.level}
            category={topIssue.category}
          />
        )}

        {/* ── 6. Alternative explanations ── */}
        <AlternativesBlock issues={result.top_issues} />

        {/* ── 7. Video upsell ── */}
        {result.upsell.video_available && topIssue && (
          <VideoUpsellTeaser
            jobId={videoJobId}
            scriptPreview={scriptPreview}
            onOpen={() => setPaywallOpen(true)}
          />
        )}

        {/* ── 8. Follow-up ── */}
        <FollowUpBlock analysisId={result.analysis_id} />

        {/* Debug panel */}
        {debugMode && <DebugPanel analysisId={result.analysis_id} />}
      </div>

      {/* Paywall modal */}
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
