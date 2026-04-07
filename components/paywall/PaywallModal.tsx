'use client'
import { useEffect, useState } from 'react'
import type { PaywallMode } from '@/lib/paywall'
import { PAYWALL_COPY } from '@/lib/paywall'
import type { VideoTone } from '@/lib/api'
import { VIDEO_TONE_LABELS } from '@/lib/copy'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaywallModalProps {
  mode: PaywallMode
  onClose: () => void
  /** Video mode only: called when user confirms tone and clicks CTA */
  onVideoConfirm?: (tone: VideoTone) => Promise<void>
  /** Premium mode only: called when user clicks main CTA */
  onPremiumConfirm?: () => Promise<void>
  /** Whether we're waiting for an async action to complete */
  loading?: boolean
}

const VIDEO_TONES: VideoTone[] = ['urgent_expert', 'calm_consultant', 'crop_doctor']

// ─── PaywallModal ─────────────────────────────────────────────────────────────

export default function PaywallModal({
  mode,
  onClose,
  onVideoConfirm,
  onPremiumConfirm,
  loading = false,
}: PaywallModalProps) {
  const copy = PAYWALL_COPY[mode]
  const [selectedTone, setSelectedTone] = useState<VideoTone>('calm_consultant')
  const [showTonePicker, setShowTonePicker] = useState(false)

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleCta() {
    if (mode === 'video' && onVideoConfirm) {
      await onVideoConfirm(selectedTone)
    } else if (mode === 'premium' && onPremiumConfirm) {
      await onPremiumConfirm()
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Dark scrim */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[92dvh] overflow-y-auto
                      shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center
                     justify-center text-gray-500 text-sm hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 pr-10 leading-tight">{copy.title}</h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-5">{copy.subtitle}</p>

        {/* Bullets */}
        <ul className="space-y-3 mb-6">
          {copy.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 leading-none mt-0.5">{b.icon}</span>
              <span className="text-sm text-gray-700 leading-relaxed">{b.text}</span>
            </li>
          ))}
        </ul>

        {/* Video-only: tone picker */}
        {mode === 'video' && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Стиль разбора
            </p>
            <button
              onClick={() => setShowTonePicker(!showTonePicker)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50
                         border border-gray-200 rounded-xl text-sm font-medium text-gray-800
                         hover:bg-gray-100 transition-colors"
            >
              <span>{VIDEO_TONE_LABELS[selectedTone]?.label}</span>
              <span className="text-gray-400 text-xs">{showTonePicker ? '▲' : '▼'}</span>
            </button>

            {showTonePicker && (
              <div className="mt-1.5 border border-gray-200 rounded-xl overflow-hidden">
                {VIDEO_TONES.map((t) => {
                  const info = VIDEO_TONE_LABELS[t]
                  return (
                    <button
                      key={t}
                      onClick={() => { setSelectedTone(t); setShowTonePicker(false) }}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3
                        border-b border-gray-100 last:border-0 transition-colors
                        ${selectedTone === t ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <span className="text-base leading-none mt-0.5">{info.label.split(' ')[0]}</span>
                      <div>
                        <p className={`text-sm font-medium ${selectedTone === t ? 'text-green-700' : 'text-gray-800'}`}>
                          {info.label.slice(info.label.indexOf(' ') + 1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={handleCta}
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-base
                     active:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Создаём...
            </span>
          ) : copy.cta}
        </button>

        {/* Secondary CTA */}
        {copy.secondaryCta && (
          <button
            onClick={onClose}
            className="w-full mt-3 py-3 text-gray-500 text-sm font-medium"
          >
            {copy.secondaryCta}
          </button>
        )}

        {/* Microcopy */}
        {copy.microcopy && (
          <p className="mt-3 text-center text-xs text-gray-400">{copy.microcopy}</p>
        )}
      </div>
    </div>
  )
}
