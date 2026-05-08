export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').trim()

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionnaireAnswers {
  crop_type: 'tomato' | 'cucumber' | 'potato' | 'pepper' | 'strawberry'
  growing_environment: 'indoor' | 'greenhouse' | 'open_field'
  plant_stage: 'seedling' | 'growing' | 'flowering' | 'fruiting'
  days_since_problem_started: number
  watering_frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'rarely'
  soil_moisture: 'very_wet' | 'wet' | 'normal' | 'dry' | 'very_dry'
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

export interface IssueResult {
  id: string
  title: string
  category: string
  score: number
  confidence_label: 'high' | 'medium' | 'low'
  why: string[]
  today_actions: string[]
  what_to_check_next: string[]
}

export interface AnalyzeResponse {
  analysis_id: string
  crop: { selected: string; detected?: string; confidence?: number }
  growth_stage: string
  top_issues: IssueResult[]
  urgency: { level: string; reason: string }
  today_actions: string[]
  what_to_check_next: string[]
  upsell: { video_available: boolean; video_type: string }
}

export type VideoTone = 'urgent_expert' | 'calm_consultant' | 'crop_doctor'

// ─── Error helpers ────────────────────────────────────────────────────────────

/** Human-readable error messages for users */
function apiError(res: Response): Error {
  const messages: Record<number, string> = {
    422: 'Ошибка в данных анкеты. Попробуйте ещё раз.',
    402: 'Требуется оплата для этой функции.',
    404: 'Данные не найдены. Попробуйте повторить диагностику.',
    500: 'Сервер временно недоступен. Попробуйте через минуту.',
    503: 'Сервис перегружен. Попробуйте через минуту.',
  }
  return new Error(messages[res.status] ?? `Ошибка сервера (${res.status})`)
}

function networkError(): Error {
  return new Error('Нет соединения с сервером. Проверьте интернет и попробуйте снова.')
}

async function apiFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) })
  } catch {
    throw networkError()
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function analyzeImages(
  images: File[],
  questionnaire: Omit<QuestionnaireAnswers, 'crop_type'> & {
    crop_type?: string | null
    plant_category?: string | null
  },
): Promise<AnalyzeResponse> {
  const form = new FormData()

  const requestBody: Record<string, unknown> = {
    ...(questionnaire.crop_type     ? { crop_type:      questionnaire.crop_type }     : {}),
    ...(questionnaire.plant_category ? { plant_category: questionnaire.plant_category } : {}),
    questionnaire: {
      growing_environment: questionnaire.growing_environment,
      plant_stage: questionnaire.plant_stage,
      days_since_problem_started: questionnaire.days_since_problem_started,
      watering_frequency: questionnaire.watering_frequency,
      soil_moisture: questionnaire.soil_moisture,
      has_spots: questionnaire.has_spots,
      has_dark_spots: questionnaire.has_dark_spots,
      has_white_powder: questionnaire.has_white_powder,
      has_holes_in_leaves: questionnaire.has_holes_in_leaves,
      has_webbing: questionnaire.has_webbing,
      insects_visible: questionnaire.insects_visible,
      has_yellowing_lower_leaves: questionnaire.has_yellowing_lower_leaves,
      has_uniform_yellowing: questionnaire.has_uniform_yellowing,
      has_leaf_edge_burn: questionnaire.has_leaf_edge_burn,
      has_curled_leaves: questionnaire.has_curled_leaves,
      has_wilting: questionnaire.has_wilting,
      has_stem_darkening: questionnaire.has_stem_darkening,
      has_fruit_rot: questionnaire.has_fruit_rot,
      has_blossom_end_rot: questionnaire.has_blossom_end_rot,
      has_slow_growth: questionnaire.has_slow_growth,
      had_cold_nights: questionnaire.had_cold_nights,
      had_heat_stress: questionnaire.had_heat_stress,
      had_recent_rain: questionnaire.had_recent_rain,
      recently_transplanted: questionnaire.recently_transplanted,
      recently_fertilized: questionnaire.recently_fertilized,
    },
  }

  form.append('questionnaire_json', JSON.stringify(requestBody))
  images.forEach((img) => form.append('images', img))

  const res = await apiFetch(`${API_URL}/api/v1/analyze`, { method: 'POST', body: form })
  if (!res.ok) throw apiError(res)
  return res.json()
}

// ─── Photo validation ─────────────────────────────────────────────────────────

export type PhotoValidationStatus = 'valid' | 'retake' | 'not_plant'

export interface PhotoValidationUserMessage {
  title: string
  description: string
  cta: string
}

export interface PhotoValidationResult {
  status: PhotoValidationStatus
  confidence: number | null
  reason: string
  userMessage: PhotoValidationUserMessage
  debug?: Record<string, unknown>
}

const _VALIDATION_UNAVAILABLE: PhotoValidationResult = {
  status: 'retake',
  confidence: 0,
  reason: 'photo_validation_unavailable',
  userMessage: {
    title: 'Не удалось проверить фото',
    description: 'Попробуйте загрузить фото растения крупным планом при хорошем освещении.',
    cta: 'Загрузить другое фото',
  },
  debug: { qualityIssues: ['validation_unavailable'] },
}

export async function validatePlantPhoto(image: File): Promise<PhotoValidationResult> {
  const url = `${API_URL}/api/v1/validate-photo`
  console.log('[PHOTO_VALIDATION] → POST', url, 'file:', image.name, image.type, image.size, 'bytes')
  const form = new FormData()
  form.append('image', image)
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(135_000),
    })
    console.log('[PHOTO_VALIDATION_RESPONSE_STATUS]', res.status)
    if (!res.ok) {
      console.warn('[PHOTO_VALIDATION] non-OK response → UNAVAILABLE fallback')
      return _VALIDATION_UNAVAILABLE
    }
    const text = await res.text()
    console.log('[PHOTO_VALIDATION_RAW_TEXT]', text)
    let data: PhotoValidationResult
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('[PHOTO_VALIDATION_JSON_PARSE_ERROR]', e)
      return _VALIDATION_UNAVAILABLE
    }
    console.log('[PHOTO_VALIDATION_PARSED]', data)
    return data
  } catch (e) {
    console.error('[PHOTO_VALIDATION] fetch error:', e)
    return _VALIDATION_UNAVAILABLE
  }
}

export async function generateVideo(
  analysis_id: string,
  selected_issue_id: string,
  tone: VideoTone = 'calm_consultant',
): Promise<{ status: string; video_job_id: string; preview_metadata: Record<string, unknown> }> {
  const res = await apiFetch(`${API_URL}/api/v1/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis_id, selected_issue_id, response_style: tone }),
  })
  if (!res.ok) throw apiError(res)
  return res.json()
}
