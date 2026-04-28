'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Trash2, ChevronRight, Leaf, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import {
  getHistory, deleteHistoryEntry, setFollowUpStatus, setPremiumOrder,
  relativeTime, type HistoryEntry, type PremiumOrderStatus,
} from '@/lib/history'
import BottomNav from '@/components/BottomNav'

// ─── Urgency meta ─────────────────────────────────────────────────────────────

function urgencyMeta(level: string) {
  return ({
    critical: { label: 'Критично', bg: 'rgba(239,68,68,0.12)',  text: '#dc2626',  border: 'rgba(239,68,68,0.25)' },
    high:     { label: 'Срочно',   bg: 'rgba(249,115,22,0.12)', text: '#ea580c',  border: 'rgba(249,115,22,0.25)' },
    medium:   { label: 'Внимание', bg: 'rgba(245,158,11,0.12)', text: '#d97706',  border: 'rgba(245,158,11,0.25)' },
    low:      { label: 'Норма',    bg: 'rgba(34,197,94,0.10)',  text: '#16a34a',  border: 'rgba(34,197,94,0.20)'  },
  } as Record<string, { label: string; bg: string; text: string; border: string }>)[level]
    ?? { label: 'Норма', bg: 'rgba(34,197,94,0.10)', text: '#16a34a', border: 'rgba(34,197,94,0.20)' }
}

const CROP_IMG: Record<string, string> = {
  tomato: '/crops/tomato.jpg', cucumber: '/crops/cucumber.jpg',
  potato: '/crops/potato.jpg', pepper:   '/crops/pepper.jpg', strawberry: '/crops/strawberry.jpg',
}

const FOLLOW_UP_OPTIONS: { value: 'better' | 'same' | 'worse'; label: string; color: string; bg: string; border: string }[] = [
  { value: 'better', label: 'Лучше',   color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.22)'   },
  { value: 'same',   label: 'Так же',  color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)'  },
  { value: 'worse',  label: 'Хуже',    color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)'   },
]

// ─── Premium status badge ─────────────────────────────────────────────────────

function PremiumBadge({ status }: { status: PremiumOrderStatus }) {
  if (status === 'no_video_review' || !status) return null

  if (status === 'video_review_ready') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(22,163,74,0.10)', border: '1.5px solid rgba(22,163,74,0.28)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="2.8"
             stroke="#16a34a" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#15803d', letterSpacing: '0.04em' }}>
          ВИДЕОРАЗБОР ГОТОВ
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.20)' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.04em' }}>
        В РАБОТЕ
      </span>
    </div>
  )
}

// ─── Components ───────────────────────────────────────────────────────────────

function HistoryCard({
  entry,
  onOpen,
  onDelete,
  onFollowUp,
  onPremiumStatusChange,
}: {
  entry: HistoryEntry
  onOpen: () => void
  onDelete: () => void
  onFollowUp: (status: 'better' | 'same' | 'worse') => void
  onPremiumStatusChange: (status: PremiumOrderStatus) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const urg  = urgencyMeta(entry.urgencyLevel)
  const time = relativeTime(entry.timestamp)
  const premStatus = entry.premiumOrderStatus

  // Dev mode: visible only when URL contains ?__dev
  useEffect(() => {
    setIsDevMode(window.location.search.includes('__dev'))
  }, [])

  return (
    <div
      className="rounded-[18px] overflow-hidden"
      style={{
        background: 'white',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* ── Main row ── */}
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 px-4 pt-4 pb-3 text-left
                   transition-all duration-150 active:bg-gray-50"
      >
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 rounded-[12px] overflow-hidden"
          style={{ width: 64, height: 64 }}
        >
          {entry.thumbnail ? (
            <img
              src={entry.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={CROP_IMG[entry.crop] ?? '/crops/tomato.jpg'}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                color: '#374151',
              }}
            >
              {entry.cropLabel.toUpperCase()}
            </span>
            <span
              className="px-2 py-[3px] rounded-full"
              style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em',
                background: urg.bg, color: urg.text, border: `1px solid ${urg.border}`,
              }}
            >
              {urg.label.toUpperCase()}
            </span>
            {premStatus && premStatus !== 'no_video_review' && (
              <PremiumBadge status={premStatus} />
            )}
          </div>

          <p
            className="truncate"
            style={{ fontSize: 13.5, fontWeight: 600, color: '#1f2937', letterSpacing: '-0.01em' }}
          >
            {entry.topIssueTitle ?? entry.urgencyReason}
          </p>

          <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>
            {time}
          </p>
        </div>

        <ChevronRight size={16} strokeWidth={2} className="flex-shrink-0 text-gray-300" />
      </button>

      {/* ── Premium order status row ── */}
      {premStatus && premStatus !== 'no_video_review' && (
        <div className="px-4 pb-0 pt-2.5 flex items-center justify-between gap-2"
          style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2">
            {premStatus === 'video_review_ready' ? (
              <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                Видеоразбор готов
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 500 }}>
                Видеоразбор в работе
              </span>
            )}
            {entry.telegramContact && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>→ {entry.telegramContact}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {premStatus === 'video_review_ready' && (
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-full transition-all active:scale-[0.95]"
                style={{
                  fontSize: 11, fontWeight: 700, color: '#15803d',
                  background: 'rgba(22,163,74,0.10)', border: '1.5px solid rgba(22,163,74,0.28)',
                }}
              >
                Проверить Telegram
              </a>
            )}
            {/* Dev-only: visible only at ?__dev */}
            {isDevMode && premStatus === 'video_review_in_progress' && (
              <button
                onClick={(e) => { e.stopPropagation(); onPremiumStatusChange('video_review_ready') }}
                className="px-2.5 py-1 rounded-full transition-all active:scale-[0.93]"
                style={{
                  fontSize: 10, fontWeight: 600, color: '#6b7280',
                  background: 'rgba(0,0,0,0.04)', border: '1px dashed rgba(0,0,0,0.20)',
                }}
              >
                [dev] → готово
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Follow-up status ── */}
      <div
        className="px-4 pb-3.5 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 10 }}
      >
        <span style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500, marginRight: 2 }}>
          Состояние:
        </span>
        {FOLLOW_UP_OPTIONS.map((opt) => {
          const isActive = entry.followUpStatus === opt.value
          return (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); onFollowUp(opt.value) }}
              className="px-2.5 py-1 rounded-full transition-all duration-150 active:scale-[0.93]"
              style={{
                fontSize: 10.5, fontWeight: isActive ? 700 : 500,
                background:  isActive ? opt.bg    : 'rgba(0,0,0,0.03)',
                color:       isActive ? opt.color : '#9ca3af',
                border:      `1.5px solid ${isActive ? opt.border : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              {opt.label}
            </button>
          )
        })}

        {/* Delete */}
        <div className="ml-auto">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="px-2.5 py-1 rounded-full active:scale-[0.93]"
                style={{
                  fontSize: 10.5, fontWeight: 700, color: '#dc2626',
                  background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.22)',
                }}
              >
                Удалить
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                style={{ fontSize: 10.5, color: '#9ca3af' }}
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="w-7 h-7 rounded-full flex items-center justify-center
                         transition-all active:scale-[0.90]"
              style={{ background: 'rgba(0,0,0,0.04)' }}
            >
              <Trash2 size={12} strokeWidth={1.75} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 pt-20 pb-12 text-center">
      <div
        className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6"
        style={{
          background: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Clock size={32} strokeWidth={1.5} className="text-gray-300" />
      </div>

      <h2
        style={{
          fontSize: 20, fontWeight: 800, color: '#1f2937',
          letterSpacing: '-0.03em', lineHeight: 1.1,
        }}
      >
        Нет анализов
      </h2>

      <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, lineHeight: 1.55 }}>
        Запустите диагностику — результат сохранится здесь автоматически
      </p>

      <button
        onClick={onStart}
        className="mt-8 px-7 py-3.5 font-black transition-all duration-150 active:scale-[0.96]"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '14px',
          background: 'linear-gradient(160deg, rgba(38,90,60,0.97) 0%, rgba(12,42,24,1) 100%)',
          color: 'white',
          fontSize: 14.5,
          letterSpacing: '0.01em',
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.28), 0 8px 28px rgba(27,67,50,0.45), 0 3px 10px rgba(27,67,50,0.22)',
        }}
      >
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))',
          borderRadius: '14px 14px 60% 60% / 14px 14px 50% 50%',
          pointerEvents: 'none',
        }} />
        Начать диагностику
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router  = useRouter()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loaded,  setLoaded]  = useState(false)

  useEffect(() => {
    setEntries(getHistory())
    setLoaded(true)
  }, [])

  function openEntry(entry: HistoryEntry) {
    // Restore result + thumbnail to sessionStorage, then open results page
    sessionStorage.setItem('agro_result', JSON.stringify(entry.result))
    if (entry.thumbnail) {
      sessionStorage.setItem('agro_images_data', JSON.stringify([entry.thumbnail]))
    }
    router.push('/results')
  }

  function handleDelete(id: string) {
    deleteHistoryEntry(id)
    setEntries((prev) => prev.filter(e => e.id !== id))
  }

  function handleFollowUp(id: string, status: 'better' | 'same' | 'worse') {
    setFollowUpStatus(id, status)
    setEntries((prev) => prev.map(e => e.id === id ? { ...e, followUpStatus: status } : e))
  }

  const handlePremiumStatusChange = useCallback((id: string, status: PremiumOrderStatus) => {
    setPremiumOrder(id, status)
    setEntries((prev) => prev.map(e => e.id === id ? { ...e, premiumOrderStatus: status } : e))
  }, [])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f2f5]">
        <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-28">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="font-semibold tracking-[0.16em] text-gray-400/80 uppercase mb-1"
              style={{ fontSize: 10 }}
            >
              Ваши диагностики
            </p>
            <h1
              style={{
                fontSize: 28, fontWeight: 900, color: '#111827',
                letterSpacing: '-0.04em', lineHeight: 1.05,
              }}
            >
              История
            </h1>
          </div>

          {entries.length > 0 && (
            <div
              className="px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(22,163,74,0.10)',
                border: '1.5px solid rgba(22,163,74,0.22)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                {entries.length}
              </span>
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>
            Нажмите на запись, чтобы открыть результат
          </p>
        )}
      </div>

      {/* ── Content ── */}
      {entries.length === 0 ? (
        <EmptyState onStart={() => router.push('/upload')} />
      ) : (
        <div className="px-4 space-y-3">
          {entries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onOpen={() => openEntry(entry)}
              onDelete={() => handleDelete(entry.id)}
              onFollowUp={(s) => handleFollowUp(entry.id, s)}
              onPremiumStatusChange={(s) => handlePremiumStatusChange(entry.id, s)}
            />
          ))}

          {/* Tip */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-[14px] mt-2"
            style={{
              background: 'rgba(22,163,74,0.06)',
              border: '1px solid rgba(22,163,74,0.15)',
            }}
          >
            <Leaf size={14} strokeWidth={1.75} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
              Отмечайте состояние растения — это поможет отследить динамику и понять, работает ли лечение.
            </p>
          </div>
        </div>
      )}

      <BottomNav active="history" />
    </div>
  )
}
