import { NextResponse } from 'next/server'

// ─── Env ──────────────────────────────────────────────────────────────────────

const TOKEN              = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID            = process.env.TELEGRAM_OWNER_CHAT_ID
const VFACTORY_URL       = process.env.VFACTORY_URL              // e.g. http://109.195.103.40:7861
const VFACTORY_TOKEN     = process.env.VFACTORY_API_TOKEN        // Bearer token for factory auth
const CALLBACK_URL       = process.env.VFACTORY_CALLBACK_URL     // e.g. http://192.168.10.70:7900/video-callback
const CALLBACK_TOKEN     = process.env.VFACTORY_CALLBACK_TOKEN   // Bearer token for webhook auth

// ─── Labels ───────────────────────────────────────────────────────────────────

const CROP_LABELS: Record<string, string> = {
  tomato:     'Томат',
  cucumber:   'Огурец',
  potato:     'Картофель',
  pepper:     'Перец',
  strawberry: 'Клубника',
}

const URGENCY_EMOJI: Record<string, string> = {
  critical: '🔴 Критично',
  high:     '🟠 Срочно',
  medium:   '🟡 Внимание',
  low:      '🟢 Не срочно',
}

const URGENCY_SHORT: Record<string, string> = {
  critical: 'Критично',
  high:     'Срочно',
  medium:   'Требует внимания',
  low:      'Не критично',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderPayload {
  analysisId:     string | null
  contact:        string
  diagnosisName:  string | null
  diagnosisScore: number | null
  crop:           string | null
  urgencyLevel:   string | null
  urgencyReason:  string | null
  photoBase64:    string | null   // data URL, resized ≤1200px
}

// ─── Video script ─────────────────────────────────────────────────────────────

function buildVideoScript(
  diagnosis:    string,
  urgencyShort: string,
  urgencyReason: string | null,
  cropLabel:    string,
): string {
  const reasonLine = urgencyReason ? ` ${urgencyReason}.` : ''
  return `Смотрите, по вашему фото — скорее всего это ${diagnosis}.${reasonLine}
Ситуация ${urgencyShort.toLowerCase()}, паниковать не нужно.
Вот что важно сделать прямо сейчас.
Первое — не заливайте растение, дайте земле немного подсохнуть между поливами.
Второе — уберите прямое солнце на несколько дней, поставьте в мягкий рассеянный свет.
Третье — не трогайте лишний раз, растению нужен покой и время.
Следите за листьями: если через несколько дней начнут восстанавливаться — всё идёт хорошо.
Если станет хуже или появятся новые симптомы — тогда разбираемся дальше.
Пока просто дайте ${cropLabel} время — скорее всего, оно справится само.`
}

// ─── Photo buffer ─────────────────────────────────────────────────────────────

function parsePhotoBase64(dataUrl: string): Uint8Array | null {
  try {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const binary  = atob(base64)
    const buf     = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
    return buf
  } catch {
    return null
  }
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

async function tgSendMessage(text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  })
  if (!res.ok) throw new Error(`Telegram sendMessage ${res.status}`)
}

async function tgSendPhoto(buf: Uint8Array, caption: string): Promise<void> {
  const fd = new FormData()
  fd.append('chat_id',    CHAT_ID!)
  fd.append('caption',    caption)
  fd.append('parse_mode', 'Markdown')
  fd.append('photo', new Blob([buf.buffer as ArrayBuffer], { type: 'image/jpeg' }), 'plant.jpg')
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Telegram sendPhoto ${res.status}`)
}

// ─── Video factory ────────────────────────────────────────────────────────────

function vfAuthHeader(): Record<string, string> {
  return VFACTORY_TOKEN ? { 'Authorization': `Bearer ${VFACTORY_TOKEN}` } : {}
}

async function vfUpload(buf: Uint8Array, analysisId: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', new Blob([buf.buffer as ArrayBuffer], { type: 'image/jpeg' }), `${analysisId}.jpg`)
  const res = await fetch(`${VFACTORY_URL}/api/upload`, { method: 'POST', headers: vfAuthHeader(), body: fd })
  if (!res.ok) throw new Error(`vf upload ${res.status}`)
  const data = await res.json() as { path: string }
  return data.path
}

async function vfCreateJob(p: {
  analysisId:    string
  photoPath:     string
  script:        string
  diagnosis:     string
  urgency:       string
  crop:          string
  confidence:    number
  contact:       string
  duration:      number
  callbackUrl:   string
  callbackToken: string
}): Promise<string> {
  const res = await fetch(`${VFACTORY_URL}/create_plant_analysis`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...vfAuthHeader() },
    body: JSON.stringify({
      analysis_id:    p.analysisId,
      user_id:        p.contact,
      photo_path:     p.photoPath,
      script:         p.script,
      diagnosis:      p.diagnosis,
      urgency:        p.urgency,
      crop:           p.crop,
      confidence:     p.confidence,
      duration:       p.duration,
      callback_url:   p.callbackUrl,
      callback_token: p.callbackToken,
    }),
  })
  if (!res.ok) throw new Error(`vf create_job ${res.status}`)
  const data = await res.json() as { job_id: string }
  return data.job_id
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!TOKEN || !CHAT_ID) {
    console.error('[send-order] not_configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_CHAT_ID')
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 })
  }

  let body: OrderPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const {
    analysisId, contact, diagnosisName, diagnosisScore,
    crop, urgencyLevel, urgencyReason, photoBase64,
  } = body

  const id          = analysisId ?? 'unknown'
  const pct         = diagnosisScore != null ? Math.min(99, Math.round(diagnosisScore * 100)) : null
  const cropLabel   = CROP_LABELS[crop ?? ''] ?? crop ?? 'растению'
  const urgEmoji    = URGENCY_EMOJI[urgencyLevel ?? ''] ?? '🟢 Не срочно'
  const urgShort    = URGENCY_SHORT[urgencyLevel ?? ''] ?? 'Не критично'
  const diagnosis   = diagnosisName ?? 'Неизвестный диагноз'
  const diagLine    = `${diagnosis}${pct != null ? ` (~${pct}%)` : ''}`
  const photoBuf    = photoBase64 ? parsePhotoBase64(photoBase64) : null

  console.log(`[send-order][${id}] received — crop=${crop} diagnosis=${diagnosis} hasPhoto=${!!photoBuf}`)

  // ── Step 1: Telegram notification (must always succeed) ───────────────────

  const caption = [
    '🌿 *Новая заявка на видеоразбор*',
    '',
    `🪴 ${cropLabel}`,
    `🔬 ${diagLine}`,
    `⚡ ${urgEmoji}`,
    urgencyReason ? `_${urgencyReason.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}_` : null,
    '',
    `📲 ${contact}`,
    `\`${id}\``,
  ].filter(Boolean).join('\n')

  try {
    if (photoBuf) {
      await tgSendPhoto(photoBuf, caption)
      console.log(`[send-order][${id}] telegram photo sent`)
    } else {
      await tgSendMessage(caption)
      console.log(`[send-order][${id}] telegram message sent (no photo)`)
    }
  } catch (e) {
    console.error(`[send-order][${id}] telegram error:`, e)
    // Don't return — user must still see success screen
  }

  // ── Step 2: Video factory (awaited — Vercel kills fire-and-forget before completion) ─

  if (!VFACTORY_URL) {
    console.log(`[send-order][${id}] VFACTORY_URL not set — skipping factory`)
    return NextResponse.json({ ok: true })
  }

  if (!photoBuf) {
    console.log(`[send-order][${id}] no photo — skipping factory`)
    return NextResponse.json({ ok: true })
  }

  try {
    const photoPath = await vfUpload(photoBuf, id)
    console.log(`[send-order][${id}] upload success: ${photoPath}`)

    const script = buildVideoScript(diagnosis, urgShort, urgencyReason ?? null, cropLabel)
    const jobId  = await vfCreateJob({
      analysisId:    id,
      photoPath,
      script,
      diagnosis,
      urgency:       urgShort,
      crop:          cropLabel,
      confidence:    pct ?? 70,
      contact,
      duration:      45,
      callbackUrl:   CALLBACK_URL   ?? '',
      callbackToken: CALLBACK_TOKEN ?? '',
    })
    console.log(`[send-order][${id}] factory job queued: ${jobId}`)
  } catch (e) {
    console.error(`[send-order][${id}] factory error:`, e)
    // Don't return error — user already sees success screen
  }

  return NextResponse.json({ ok: true })
}
