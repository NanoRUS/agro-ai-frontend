'use client'
import { useEffect, useState, useRef } from 'react'
import type { PaywallMode } from '@/lib/paywall'
import { PAYWALL_COPY } from '@/lib/paywall'
import type { VideoTone } from '@/lib/api'
import { VIDEO_TONE_LABELS } from '@/lib/copy'

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoStep = 'paywall' | 'contact' | 'success'

interface PaywallModalProps {
  mode: PaywallMode
  onClose: () => void
  onVideoConfirm?: (tone: VideoTone) => Promise<void>
  onPremiumConfirm?: () => Promise<void>
  onOrderSubmit?: (contact: string) => void  // fire-and-forget order notification
  loading?: boolean
  diagnosisName?: string   // injected from result screen for personalization
  diagnosisScore?: number  // IssueResult.score (0–1 float) for confidence block
}

const VIDEO_TONES: VideoTone[] = ['urgent_expert', 'calm_consultant', 'crop_doctor']

// ─── Small reusables ──────────────────────────────────────────────────────────

function Dot({ color }: { color: string }) {
  return <span style={{ width: 5, height: 5, borderRadius: '50%', background: color,
                        display: 'inline-block', flexShrink: 0, marginTop: 5 }} />
}

function ValueRow({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <Dot color={color} />
      <span style={{ fontSize: 11.5, color, fontWeight: 500, lineHeight: 1.4 }}>{text}</span>
    </div>
  )
}

// ─── Paywall scrollable content (no CTA — lives in sticky footer) ─────────────

function PaywallScrollContent({
  diagnosisName, diagnosisScore, selectedTone, setSelectedTone, showTonePicker, setShowTonePicker,
}: {
  diagnosisName?: string
  diagnosisScore?: number
  selectedTone: VideoTone
  setSelectedTone: (t: VideoTone) => void
  showTonePicker: boolean
  setShowTonePicker: (v: boolean) => void
}) {
  const dn  = diagnosisName ?? null
  // Convert 0–1 float to percent, cap at 99
  const pct = diagnosisScore != null ? Math.min(99, Math.round(diagnosisScore * 100)) : null

  return (
    <div>
      {/* Headline */}
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827',
                   letterSpacing: '-0.03em', lineHeight: 1.15, paddingRight: 32 }}>
        Видеоразбор с планом действий
      </h2>
      <p style={{ fontSize: 13.5, color: '#6b7280', marginTop: 6, lineHeight: 1.55 }}>
        Агроном проверит фото, симптомы и анкету и даст точный план лечения
      </p>

      {/* ── Personalization ── */}
      {dn && (
        <div className="mt-4 rounded-[14px] px-4 py-3.5"
          style={{ background: 'rgba(22,163,74,0.06)', border: '1.5px solid rgba(22,163,74,0.20)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                      color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>
            По вашему случаю
          </p>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1f2937',
                      letterSpacing: '-0.01em', marginBottom: 8 }}>
            Предварительно: {dn}
          </p>
          <p style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 600 }}>
            Агроном проверит:
          </p>
          <div className="space-y-1.5">
            {[
              `действительно ли это ${dn}`,
              'на какой стадии заболевание',
              'насколько это критично',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <Dot color="#16a34a" />
                <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.45 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Confidence block ── */}
      <div className="mt-3 flex items-start gap-2.5 px-3.5 py-2.5 rounded-[12px]"
        style={{ background: pct != null
          ? 'rgba(245,158,11,0.07)' : 'rgba(0,0,0,0.03)',
          border: pct != null
            ? '1px solid rgba(245,158,11,0.20)' : '1px solid rgba(0,0,0,0.08)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
             stroke={pct != null ? '#d97706' : '#9ca3af'}
             strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700,
                      color: pct != null ? '#92400e' : '#4b5563', lineHeight: 1.35 }}>
            {pct != null ? `Точность AI-оценки: ~${pct}%` : 'AI даёт предварительную оценку'}
          </p>
          <p style={{ fontSize: 11.5, color: pct != null ? '#78350f' : '#6b7280',
                      marginTop: 2, lineHeight: 1.45 }}>
            Агроном поможет подтвердить диагноз и снизить риск ошибки
          </p>
        </div>
      </div>

      {/* ── AI warning ── */}
      <div className="mt-3 rounded-[14px] px-4 py-3.5"
        style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
               stroke="#d97706" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
            Похожие симптомы — разные проблемы
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: '#78350f', lineHeight: 1.55 }}>
          Даже при хорошем фото похожие заболевания могут выглядеть одинаково.
          Агроном учитывает симптомы, анкету и контекст, чтобы снизить риск ошибки.
        </p>
        <div className="mt-2 space-y-1">
          {['Похожие симптомы у разных проблем',
            'Качество и ракурс фото',
            'Скрытые факторы: почва, влажность, стадия поражения',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Dot color="#d97706" />
              <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.45 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparison ── */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {/* AI column */}
        <div className="rounded-[14px] px-3 pt-3 pb-3.5"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af',
                      letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 9 }}>
            AI-результат
          </p>
          <div className="space-y-2">
            {['Быстро', 'По фото и анкете', 'Предварительная оценка', 'Общие рекомендации'].map((t) => (
              <ValueRow key={t} color="#9ca3af" text={t} />
            ))}
          </div>
        </div>

        {/* Agronomist column — visually stronger */}
        <div className="rounded-[14px] px-3 pt-3 pb-3.5"
          style={{ background: 'rgba(22,163,74,0.08)',
                   border: '2px solid rgba(22,163,74,0.30)',
                   boxShadow: '0 2px 12px rgba(22,163,74,0.10)' }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#15803d',
                      letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 9 }}>
            С планом действий
          </p>
          <div className="space-y-2">
            {[
              'Проверка вручную специалистом',
              'Подтверждение диагноза',
              'Конкретные препараты',
              'Персональный план лечения',
              'Снижает риск ошибки',
            ].map((t) => (
              <ValueRow key={t} color="#15803d" text={t} />
            ))}
          </div>
        </div>
      </div>

      {/* ── What you get ── */}
      <div className="mt-5">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                    color: 'rgba(107,114,128,0.85)', textTransform: 'uppercase', marginBottom: 9 }}>
          Что вы получите
        </p>
        <div className="space-y-2.5">
          {[
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
                     stroke="#16a34a" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              ),
              bg: 'rgba(22,163,74,0.10)', title: 'Что делать прямо сегодня',
              items: ['Чем обработать', 'Что убрать или изолировать', 'Каких ошибок избегать'],
              dot: '#16a34a',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
                     stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              bg: 'rgba(59,130,246,0.10)', title: 'Пошаговый план лечения',
              items: ['Что делать в ближайшие дни', 'Как понять, что лечение помогает',
                      'Когда ситуация становится критичной'],
              dot: '#3b82f6',
            },
            {
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
                     stroke="#7c3aed" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ),
              bg: 'rgba(139,92,246,0.10)', title: 'Проверка диагноза',
              items: ['Подтверждение или коррекция AI-диагноза',
                      'Объяснение причины проблемы простыми словами'],
              dot: '#7c3aed',
            },
          ].map((block) => (
            <div key={block.title} className="rounded-[14px] px-4 pt-3.5 pb-4"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)',
                       boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: block.bg }}>
                  {block.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937',
                               letterSpacing: '-0.01em' }}>
                  {block.title}
                </span>
              </div>
              <div className="space-y-1.5">
                {block.items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Dot color={block.dot} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Loss framing ── */}
      <div className="mt-4 rounded-[14px] px-4 py-3.5"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
                    color: '#b91c1c', textTransform: 'uppercase', marginBottom: 8 }}>
          Почему лучше не откладывать
        </p>
        <div className="space-y-1.5">
          {[
            'Болезнь может распространиться',
            'Растение может ослабнуть или погибнуть',
            'Ошибочное лечение может ухудшить ситуацию',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Dot color="#ef4444" />
              <span style={{ fontSize: 12.5, color: '#7f1d1d', lineHeight: 1.45 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Format pills ── */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {[
          { icon: '▶', text: 'Видео 1–3 минуты' },
          { icon: '💬', text: 'Простым языком' },
          { icon: '🎯', text: 'По вашему случаю' },
          { icon: '⏱', text: 'Готово за 24 часа' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
            <span style={{ fontSize: 11 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#4b5563' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* ── Urgency + social proof ── */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[12px]"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
          <span style={{ fontSize: 12 }}>🕐</span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Разборы выполняются в порядке очереди
          </span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[12px]"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
          <span style={{ fontSize: 12 }}>👁</span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Сейчас агрономы разбирают несколько случаев
          </span>
        </div>
      </div>

      {/* ── Price block ── */}
      <div className="mt-4 rounded-[16px] px-5 py-5 text-center"
        style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.18)' }}>
        <p style={{ fontSize: 38, fontWeight: 900, color: '#111827',
                    letterSpacing: '-0.05em', lineHeight: 1 }}>
          299 ₽
        </p>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 5, fontWeight: 500 }}>
          Разовый платёж, без подписки
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
          Обычно такая персональная консультация стоит дороже
        </p>
        <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>
          ≈ стоимость одной обработки растения
        </p>
      </div>

      {/* ── Tone picker ── */}
      <div className="mt-4">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                    color: 'rgba(107,114,128,0.85)', textTransform: 'uppercase', marginBottom: 7 }}>
          Стиль разбора
        </p>
        <button
          onClick={() => setShowTonePicker(!showTonePicker)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-colors"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.09)' }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
            {VIDEO_TONE_LABELS[selectedTone]?.label}
          </span>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{showTonePicker ? '▲' : '▼'}</span>
        </button>
        {showTonePicker && (
          <div className="mt-1.5 rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.09)' }}>
            {VIDEO_TONES.map((t) => {
              const info = VIDEO_TONE_LABELS[t]
              const active = selectedTone === t
              return (
                <button key={t} onClick={() => { setSelectedTone(t); setShowTonePicker(false) }}
                  className="w-full text-left px-4 py-3 flex items-start gap-3
                             border-b border-gray-100 last:border-0 transition-colors"
                  style={{ background: active ? '#f0fdf4' : 'white' }}>
                  <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>
                    {info.label.split(' ')[0]}
                  </span>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600,
                                color: active ? '#15803d' : '#374151' }}>
                      {info.label.slice(info.label.indexOf(' ') + 1)}
                    </p>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{info.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Instant value summary (last thing before CTA zone) ── */}
      <div className="mt-4 rounded-[14px] px-4 py-3.5"
        style={{ background: 'white', border: '1px solid rgba(22,163,74,0.18)',
                 boxShadow: '0 1px 8px rgba(22,163,74,0.08)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
                    color: '#15803d', textTransform: 'uppercase', marginBottom: 8 }}>
          Что вы получите
        </p>
        <div className="space-y-1.5">
          {[
            'Конкретные препараты или действия',
            'Понятный план на сегодня',
            'Пошаговые рекомендации без догадок',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Dot color="#16a34a" />
              <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer so content isn't hidden under sticky footer */}
      <div style={{ height: 8 }} />
    </div>
  )
}

// ─── Contact step ─────────────────────────────────────────────────────────────

function ContactContent({ contact, setContact }: {
  contact: string; setContact: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  return (
    <div className="py-2">
      {/* Forward-motion status line */}
      <div className="flex items-center gap-2 mb-5 px-3.5 py-2.5 rounded-[12px]"
        style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.18)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
             stroke="#16a34a" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span style={{ fontSize: 12, color: '#166534', fontWeight: 600, lineHeight: 1.35 }}>
          Почти готово — осталось указать, куда отправить разбор
        </span>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827',
                   letterSpacing: '-0.03em', lineHeight: 1.15, paddingRight: 32 }}>
        Куда отправить видеоразбор?
      </h2>
      <p style={{ fontSize: 13.5, color: '#6b7280', marginTop: 6, lineHeight: 1.55 }}>
        Укажем сюда готовый видеоразбор и план действий
      </p>

      {/* Telegram icon hint */}
      <div className="mt-6 flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(37,102,174,0.12)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#2566ae">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.2l-2.02 9.52c-.15.67-.54.84-1.09.52l-3-2.21-1.45 1.4c-.16.16-.3.3-.6.3l.21-3.05 5.53-4.99c.24-.21-.05-.33-.37-.12L6.6 14.46l-2.97-.93c-.64-.2-.66-.64.14-.95l11.59-4.47c.53-.19 1 .13.2.09z"/>
          </svg>
        </div>
        <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 600 }}>
          Предпочтительно Telegram
        </span>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="@username или номер"
          className="w-full px-4 py-3.5 rounded-[14px] outline-none transition-all"
          style={{
            fontSize: 15, fontWeight: 500, color: '#111827',
            background: 'white',
            border: contact ? '2px solid rgba(22,163,74,0.50)' : '1.5px solid rgba(0,0,0,0.12)',
            boxShadow: contact ? '0 0 0 3px rgba(22,163,74,0.10)' : 'none',
          }}
        />
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, marginLeft: 4 }}>
        Отправим видеоразбор сюда
      </p>

      {/* Reassurance */}
      <p className="mt-4" style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.55,
                                    paddingLeft: 4 }}>
        Никаких лишних сообщений — только ваш разбор
      </p>
    </div>
  )
}

// ─── Success step ─────────────────────────────────────────────────────────────

function SuccessContent({ contact, diagnosisName }: {
  contact: string; diagnosisName?: string
}) {
  return (
    <div className="py-4 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-5"
        style={{ background: 'linear-gradient(145deg, #22c55e, #15803d)',
                 boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
             stroke="white" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827',
                   letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        Заявка принята
      </h2>

      {/* Status badge */}
      <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
        style={{ background: 'rgba(59,130,246,0.09)', border: '1.5px solid rgba(59,130,246,0.22)' }}>
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.01em' }}>
          Видеоразбор в работе
        </span>
      </div>

      <p style={{ fontSize: 13.5, color: '#6b7280', marginTop: 10, lineHeight: 1.6 }}>
        Агроном изучит ваш случай{diagnosisName ? ` (${diagnosisName})` : ''} и подготовит
        персональный видеоразбор с планом лечения
      </p>

      {/* What comes in the review */}
      <div className="mt-5 rounded-[16px] px-4 py-4 text-left"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)',
                 boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                    color: 'rgba(107,114,128,0.75)', textTransform: 'uppercase', marginBottom: 10 }}>
          Что придёт в разборе
        </p>
        <div className="space-y-2">
          {[
            'Подтверждение или коррекция диагноза',
            'Что делать прямо сейчас',
            'Пошаговый план лечения',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Dot color="#16a34a" />
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-4 rounded-[16px] px-5 py-4 text-left"
        style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.18)' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(22,163,74,0.15)' }}>
            <span style={{ fontSize: 10 }}>⏱</span>
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1f2937' }}>
              Обычно быстрее — в течение 6–12 часов
            </p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              В порядке очереди, в рабочее время
            </p>
          </div>
        </div>
        {contact && (
          <div className="flex items-center gap-3 pt-3"
            style={{ borderTop: '1px solid rgba(22,163,74,0.15)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(22,163,74,0.15)' }}>
              <span style={{ fontSize: 10 }}>📩</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#374151' }}>
              Отправим на: <strong>{contact}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PaywallModal ─────────────────────────────────────────────────────────────

export default function PaywallModal({
  mode, onClose, onVideoConfirm, onPremiumConfirm, onOrderSubmit,
  loading = false, diagnosisName, diagnosisScore,
}: PaywallModalProps) {
  const copy = PAYWALL_COPY[mode]
  const [selectedTone, setSelectedTone]     = useState<VideoTone>('calm_consultant')
  const [showTonePicker, setShowTonePicker] = useState(false)
  const [step, setStep]                     = useState<VideoStep>('paywall')
  const [contact, setContact]               = useState('')
  const [submitting, setSubmitting]         = useState(false)

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleContactConfirm() {
    if (submitting || !contact.trim()) return
    setSubmitting(true)
    // Fire-and-forget: send order notification (must not block UX)
    onOrderSubmit?.(contact)
    // Fire-and-forget: trigger video pipeline if available
    onVideoConfirm?.(selectedTone).catch(() => {})
    // Immediately show success — don't wait for network
    setStep('success')
    setSubmitting(false)
  }

  const isVideoMode = mode === 'video'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose() }}>

      {/* Scrim */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { if (!submitting) onClose() }} />

      {/* Sheet — flex column with sticky footer */}
      <div className="relative flex flex-col rounded-t-3xl max-h-[92dvh] shadow-2xl animate-slide-up"
        style={{ background: '#f7f8fa' }}>

        {/* ── Fixed header ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-0">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

          {/* Back (contact step) + Close */}
          <div className="flex items-center justify-between mb-1">
            {isVideoMode && step === 'contact' ? (
              <button onClick={() => setStep('paywall')}
                className="flex items-center gap-1.5 transition-opacity active:opacity-60"
                style={{ color: '#6b7280' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
                     stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Назад</span>
              </button>
            ) : (
              <div />
            )}

            {step !== 'success' && (
              <button onClick={() => { if (!submitting) onClose() }}
                className="w-8 h-8 rounded-full flex items-center justify-center ml-auto transition-colors"
                style={{ background: 'rgba(0,0,0,0.07)', color: '#6b7280' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
                     stroke="currentColor" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-2">
          {isVideoMode ? (
            <>
              {step === 'paywall' && (
                <PaywallScrollContent
                  diagnosisName={diagnosisName}
                  diagnosisScore={diagnosisScore}
                  selectedTone={selectedTone}
                  setSelectedTone={setSelectedTone}
                  showTonePicker={showTonePicker}
                  setShowTonePicker={setShowTonePicker}
                />
              )}
              {step === 'contact' && (
                <ContactContent contact={contact} setContact={setContact} />
              )}
              {step === 'success' && (
                <SuccessContent contact={contact} diagnosisName={diagnosisName} />
              )}
            </>
          ) : (
            /* Premium mode */
            <>
              <h2 className="text-xl font-bold text-gray-900 pr-10 leading-tight">{copy.title}</h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-5">{copy.subtitle}</p>
              <ul className="space-y-3 mb-4">
                {copy.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 leading-none mt-0.5">{b.icon}</span>
                    <span className="text-sm text-gray-700 leading-relaxed">{b.text}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-black/5"
          style={{
            background: '#f7f8fa',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          }}>

          {isVideoMode && step === 'paywall' && (
            <>
              {/* Price row */}
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: 12.5, color: '#374151', fontWeight: 600, lineHeight: 1.45 }}>
                  Это снижает риск потерять растение
                </p>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#111827',
                               letterSpacing: '-0.04em', flexShrink: 0, marginLeft: 8 }}>
                  299 ₽
                </span>
              </div>
              <button
                onClick={() => setStep('contact')}
                className="w-full rounded-[14px] font-black tracking-wide
                           transition-all duration-150 active:scale-[0.97] active:brightness-95"
                style={{
                  padding: '15px 0', fontSize: 15, letterSpacing: '0.01em',
                  background: 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)',
                  color: '#022c17',
                  boxShadow: '0 6px 24px rgba(34,197,94,0.35), 0 1px 4px rgba(0,0,0,0.10)',
                }}>
                Получить точный разбор
              </button>
              <button onClick={onClose}
                className="w-full mt-2 py-2.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>
                Оставить только AI-результат
              </button>
            </>
          )}

          {isVideoMode && step === 'contact' && (
            <button
              onClick={handleContactConfirm}
              disabled={submitting || !contact.trim()}
              className="w-full rounded-[14px] font-black tracking-wide
                         transition-all duration-150 active:scale-[0.97] active:brightness-95
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: '15px 0', fontSize: 15, letterSpacing: '0.01em',
                background: 'linear-gradient(145deg, #3ddb6d 0%, #15a248 100%)',
                color: '#022c17',
                boxShadow: contact.trim()
                  ? '0 6px 24px rgba(34,197,94,0.35)' : 'none',
              }}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#022c17] border-t-transparent rounded-full animate-spin" />
                  Создаём...
                </span>
              ) : 'Подтвердить и получить разбор'}
            </button>
          )}

          {isVideoMode && step === 'success' && (
            <button onClick={onClose}
              className="w-full rounded-[14px] font-black tracking-wide
                         transition-all duration-150 active:scale-[0.97]"
              style={{
                padding: '15px 0', fontSize: 15,
                background: 'rgba(0,0,0,0.06)',
                color: '#374151',
              }}>
              Закрыть
            </button>
          )}

          {/* Premium mode footer */}
          {!isVideoMode && (
            <>
              <button
                onClick={async () => { if (onPremiumConfirm) await onPremiumConfirm() }}
                disabled={loading}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-base
                           active:bg-green-700 disabled:opacity-60 transition-colors shadow-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Создаём...
                  </span>
                ) : copy.cta}
              </button>
              {copy.secondaryCta && (
                <button onClick={onClose}
                  className="w-full mt-3 py-3 text-gray-500 text-sm font-medium">
                  {copy.secondaryCta}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
