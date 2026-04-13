import type { AnalyzeResponse } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PremiumOrderStatus =
  | 'no_video_review'
  | 'video_review_in_progress'
  | 'video_review_ready'

export interface HistoryEntry {
  id: string                              // analysis_id from result
  timestamp: number                       // Date.now() when saved
  crop: string                            // 'tomato', 'cucumber', …
  cropLabel: string                       // 'Томат', …
  thumbnail: string | null               // base64 JPEG 96×96, ~4KB
  topIssueTitle: string | null
  topIssueCategory: string | null
  urgencyLevel: string                    // 'low' | 'medium' | 'high' | 'critical'
  urgencyReason: string
  result: AnalyzeResponse                 // full result — re-open without network
  followUpStatus?: 'better' | 'same' | 'worse'
  // Premium order fields (optional — only set when user purchases video review)
  premiumOrderStatus?: PremiumOrderStatus
  premiumOrderRequestedAt?: number        // Date.now() when order was placed
  telegramContact?: string                // contact entered by user
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HISTORY_KEY  = 'agro_history'
const MAX_ENTRIES  = 20

const CROP_LABELS: Record<string, string> = {
  tomato:     'Томат',
  cucumber:   'Огурец',
  potato:     'Картофель',
  pepper:     'Перец',
  strawberry: 'Клубника',
}

// ─── Dev logging ──────────────────────────────────────────────────────────────

function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[agro:history]', ...args)
  }
}

// ─── Pure helpers (exported for unit tests) ───────────────────────────────────

/** Pure merge — produces a new HistoryEntry that takes fresh data from
 *  `incoming` but preserves all user-owned fields from `prev`.
 *  No side effects, fully unit-testable. */
export function mergeHistoryEntry(
  incoming: Omit<HistoryEntry, 'followUpStatus'>,
  prev: HistoryEntry | undefined,
): HistoryEntry {
  const preserved = {
    followUpStatus:          prev?.followUpStatus,
    premiumOrderStatus:      prev?.premiumOrderStatus,
    premiumOrderRequestedAt: prev?.premiumOrderRequestedAt,
    telegramContact:         prev?.telegramContact,
  }

  if (prev && (prev.premiumOrderStatus || prev.telegramContact)) {
    devLog(`merge preserving premium fields for ${incoming.id}:`, preserved)
  }

  return { ...incoming, ...preserved }
}

/** Look up the premium order status for a specific analysis by id.
 *  Returns null (not undefined) so callers can use it as a deterministic
 *  boolean-safe value: null = no order, string = explicit status. */
export function getPremiumStatusForAnalysis(analysisId: string): PremiumOrderStatus | null {
  const entry = getHistory().find(e => e.id === analysisId)
  devLog(`lookup ${analysisId} →`, entry?.premiumOrderStatus ?? 'null')
  return entry?.premiumOrderStatus ?? null
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as HistoryEntry[]
  } catch { return [] }
}

/** Insert or update an entry (matched by id). Trims to MAX_ENTRIES.
 *  Always preserves user-owned fields from the previous entry so that
 *  async thumbnail rebuilds never downgrade already-set statuses. */
export function upsertHistoryEntry(entry: Omit<HistoryEntry, 'followUpStatus'>): void {
  if (typeof window === 'undefined') return
  try {
    const existing  = getHistory()
    const prevEntry = existing.find(e => e.id === entry.id)
    const merged    = mergeHistoryEntry(entry, prevEntry)
    const updated   = [merged, ...existing.filter(e => e.id !== entry.id)].slice(0, MAX_ENTRIES)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch { /* QuotaExceededError — silently ignore */ }
}

export function setFollowUpStatus(id: string, status: 'better' | 'same' | 'worse'): void {
  if (typeof window === 'undefined') return
  try {
    const updated = getHistory().map(e => e.id === id ? { ...e, followUpStatus: status } : e)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch {}
}

/** Set / update premium order status. Optionally stores contact on first call. */
export function setPremiumOrder(
  id: string,
  status: PremiumOrderStatus,
  contact?: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const updated = getHistory().map(e => {
      if (e.id !== id) return e
      return {
        ...e,
        premiumOrderStatus: status,
        ...(contact !== undefined ? { telegramContact: contact } : {}),
        ...(status === 'video_review_in_progress' && !e.premiumOrderRequestedAt
          ? { premiumOrderRequestedAt: Date.now() } : {}),
      }
    })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch {}
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(e => e.id !== id)))
  } catch {}
}

// ─── Build entry (async — needs browser Canvas) ───────────────────────────────

export async function buildHistoryEntry(
  result: AnalyzeResponse,
  heroImageDataUrl: string | null,
): Promise<Omit<HistoryEntry, 'followUpStatus'>> {
  const crop     = result.crop.selected
  const topIssue = result.top_issues[0] ?? null

  let thumbnail: string | null = null
  if (heroImageDataUrl) {
    try { thumbnail = await makeThumbnail(heroImageDataUrl) } catch {}
  }

  return {
    id:                 result.analysis_id,
    timestamp:          Date.now(),
    crop,
    cropLabel:          CROP_LABELS[crop] ?? crop,
    thumbnail,
    topIssueTitle:      topIssue?.title ?? null,
    topIssueCategory:   topIssue?.category ?? null,
    urgencyLevel:       result.urgency.level,
    urgencyReason:      result.urgency.reason,
    result,
  }
}

function makeThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img  = new Image()
    img.onload = () => {
      const SIZE   = 240   // 3× the 64px CSS display size → sharp on 3x Retina
      const canvas = document.createElement('canvas')
      canvas.width = SIZE; canvas.height = SIZE
      const ctx    = canvas.getContext('2d')!
      const scale  = Math.max(SIZE / img.width, SIZE / img.height)
      const w      = img.width  * scale
      const h      = img.height * scale
      ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src     = dataUrl
  })
}

// ─── Relative time ────────────────────────────────────────────────────────────

export function relativeTime(timestamp: number): string {
  const diff    = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 1)  return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours   < 24) return `${hours} ч назад`
  if (days === 1)   return 'вчера'
  if (days    <  7) return `${days} дн назад`
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
