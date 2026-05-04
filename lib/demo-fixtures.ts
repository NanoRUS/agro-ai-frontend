/**
 * Client-side demo fixtures — прямая загрузка без вызова backend.
 * Вызов backend /api/v1/demo/cases/{id} нужен для live scoring;
 * эти данные используются для instant demo (offline-capable).
 */
import type { AnalyzeResponse } from './api'

export interface DemoCase {
  id: string
  label: string
  description: string
  crop: string
  plant_stage: string
  questionnaire: Record<string, unknown>
  staticResult?: AnalyzeResponse
  userType?: string
}

const SLUG_DEMO_RESULT: AnalyzeResponse = {
  analysis_id: 'demo_slugs',
  crop: { selected: 'vegetable' },
  growth_stage: 'growing',
  top_issues: [{
    id: 'slugs',
    title: 'Слизни',
    category: 'pest',
    score: 0.82,
    confidence_label: 'high',
    why: [
      'Объедают листья и молодые побеги, оставляя характерные слизистые следы',
      'Активны ночью и в сырую погоду — после дождя активность резко возрастает',
      'Прячутся под листьями и комьями почвы у основания растения днём',
    ],
    today_actions: [
      'Соберите слизней вручную и поставьте простые ловушки',
      'Осмотрите нижнюю сторону листьев и землю вокруг растения',
      'Соберите слизней вручную',
      'Поставьте ловушки или барьеры',
      'Повторите проверку завтра вечером',
    ],
    what_to_check_next: [],
  }],
  urgency: { level: 'high', reason: 'Повреждают листья и молодые побеги, часто оставляют слизистые следы.' },
  today_actions: [
    'Убрать укрытия и влажные растительные остатки рядом с грядкой',
    'Поливать утром, а не вечером — меньше влаги ночью',
    'Использовать барьеры (зола, яичная скорлупа) вокруг грядки',
    'При сильном заражении использовать разрешённые средства от слизней',
  ],
  what_to_check_next: [],
  upsell: { video_available: true, video_type: 'echomimic' },
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'tomato_phytophthora_rain',
    label: '🍅 Фитофтора на томате — критично',
    description: 'Дождливая осень, тёмные пятна с белым налётом снизу листа',
    crop: 'tomato',
    plant_stage: 'fruiting',
    questionnaire: {
      growing_environment: 'open_field', plant_stage: 'fruiting',
      days_since_problem_started: 4, watering_frequency: 'every_2_days', soil_moisture: 'wet',
      has_spots: true, has_dark_spots: true, has_stem_darkening: true, has_fruit_rot: true,
      had_cold_nights: true, had_recent_rain: true,
      has_white_powder: false, has_holes_in_leaves: false, has_webbing: false,
      insects_visible: false, has_yellowing_lower_leaves: false, has_uniform_yellowing: false,
      has_leaf_edge_burn: false, has_curled_leaves: false, has_wilting: false,
      has_blossom_end_rot: false, has_slow_growth: false, had_heat_stress: false,
      recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'tomato_overwatering',
    label: '🍅 Переполив томата',
    description: 'Желтеют нижние листья, почва постоянно мокрая',
    crop: 'tomato',
    plant_stage: 'growing',
    questionnaire: {
      growing_environment: 'greenhouse', plant_stage: 'growing',
      days_since_problem_started: 7, watering_frequency: 'daily', soil_moisture: 'very_wet',
      has_yellowing_lower_leaves: true, has_wilting: true, has_slow_growth: true,
      has_spots: false, has_dark_spots: false, has_white_powder: false,
      has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
      has_uniform_yellowing: false, has_leaf_edge_burn: false, has_curled_leaves: false,
      has_stem_darkening: false, has_fruit_rot: false, has_blossom_end_rot: false,
      had_cold_nights: false, had_heat_stress: false, had_recent_rain: false,
      recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'tomato_blossom_end_rot',
    label: '🍅 Вершинная гниль томата',
    description: 'Чёрный сухой кончик плода — дефицит кальция',
    crop: 'tomato',
    plant_stage: 'fruiting',
    questionnaire: {
      growing_environment: 'greenhouse', plant_stage: 'fruiting',
      days_since_problem_started: 5, watering_frequency: 'every_2_days', soil_moisture: 'dry',
      has_fruit_rot: true, has_blossom_end_rot: true, had_heat_stress: true,
      has_spots: false, has_dark_spots: false, has_white_powder: false,
      has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
      has_yellowing_lower_leaves: false, has_uniform_yellowing: false, has_leaf_edge_burn: false,
      has_curled_leaves: false, has_wilting: false, has_stem_darkening: false, has_slow_growth: false,
      had_cold_nights: false, had_recent_rain: false, recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'tomato_aphids',
    label: '🍅 Тля на томате',
    description: 'Видны насекомые, скрученные листья — колония тли',
    crop: 'tomato',
    plant_stage: 'flowering',
    questionnaire: {
      growing_environment: 'greenhouse', plant_stage: 'flowering',
      days_since_problem_started: 3, watering_frequency: 'every_2_days', soil_moisture: 'normal',
      insects_visible: true, has_curled_leaves: true,
      has_spots: false, has_dark_spots: false, has_white_powder: false,
      has_holes_in_leaves: false, has_webbing: false,
      has_yellowing_lower_leaves: false, has_uniform_yellowing: false, has_leaf_edge_burn: false,
      has_wilting: false, has_stem_darkening: false, has_fruit_rot: false, has_blossom_end_rot: false,
      has_slow_growth: false, had_cold_nights: false, had_heat_stress: false, had_recent_rain: false,
      recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'cucumber_powdery_mildew',
    label: '🥒 Мучнистая роса огурца',
    description: 'Белый налёт на листьях в теплице — срочно',
    crop: 'cucumber',
    plant_stage: 'fruiting',
    questionnaire: {
      growing_environment: 'greenhouse', plant_stage: 'fruiting',
      days_since_problem_started: 5, watering_frequency: 'every_2_days', soil_moisture: 'normal',
      has_spots: true, has_white_powder: true, has_yellowing_lower_leaves: true,
      has_dark_spots: false, has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
      has_uniform_yellowing: false, has_leaf_edge_burn: false, has_curled_leaves: false,
      has_wilting: false, has_stem_darkening: false, has_fruit_rot: false, has_blossom_end_rot: false,
      has_slow_growth: false, had_cold_nights: false, had_heat_stress: false, had_recent_rain: false,
      recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'cucumber_spider_mites_heat',
    label: '🥒 Паутинный клещ огурца',
    description: 'Паутинка + жара — классический паутинный клещ',
    crop: 'cucumber',
    plant_stage: 'fruiting',
    questionnaire: {
      growing_environment: 'greenhouse', plant_stage: 'fruiting',
      days_since_problem_started: 4, watering_frequency: 'daily', soil_moisture: 'dry',
      has_spots: true, has_webbing: true, insects_visible: true, had_heat_stress: true,
      has_dark_spots: false, has_white_powder: false, has_holes_in_leaves: false,
      has_yellowing_lower_leaves: false, has_uniform_yellowing: false, has_leaf_edge_burn: false,
      has_curled_leaves: false, has_wilting: false, has_stem_darkening: false,
      has_fruit_rot: false, has_blossom_end_rot: false, has_slow_growth: false,
      had_cold_nights: false, had_recent_rain: false, recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'potato_phytophthora_critical',
    label: '🥔 Фитофтора картофеля — критично',
    description: 'Дождь + холод + тёмные пятна — P. infestans',
    crop: 'potato',
    plant_stage: 'growing',
    questionnaire: {
      growing_environment: 'open_field', plant_stage: 'growing',
      days_since_problem_started: 3, watering_frequency: 'every_3_days', soil_moisture: 'wet',
      has_spots: true, has_dark_spots: true, has_stem_darkening: true,
      had_cold_nights: true, had_recent_rain: true,
      has_white_powder: false, has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
      has_yellowing_lower_leaves: false, has_uniform_yellowing: false, has_leaf_edge_burn: false,
      has_curled_leaves: false, has_wilting: false, has_fruit_rot: false, has_blossom_end_rot: false,
      has_slow_growth: false, had_heat_stress: false, recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'pepper_blossom_end_rot_fruiting',
    label: '🌶 Вершинная гниль перца',
    description: 'Чёрный кончик плода перца при нерегулярном поливе',
    crop: 'pepper',
    plant_stage: 'fruiting',
    questionnaire: {
      growing_environment: 'greenhouse', plant_stage: 'fruiting',
      days_since_problem_started: 6, watering_frequency: 'every_3_days', soil_moisture: 'dry',
      has_fruit_rot: true, has_blossom_end_rot: true, had_heat_stress: true,
      has_spots: false, has_dark_spots: false, has_white_powder: false,
      has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
      has_yellowing_lower_leaves: false, has_uniform_yellowing: false, has_leaf_edge_burn: false,
      has_curled_leaves: false, has_wilting: false, has_stem_darkening: false, has_slow_growth: false,
      had_cold_nights: false, had_recent_rain: false, recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'strawberry_root_rot',
    label: '🍓 Корневая гниль клубники — критично',
    description: 'Постоянный перелив + увядание — корневая гниль',
    crop: 'strawberry',
    plant_stage: 'growing',
    questionnaire: {
      growing_environment: 'open_field', plant_stage: 'growing',
      days_since_problem_started: 7, watering_frequency: 'daily', soil_moisture: 'very_wet',
      has_yellowing_lower_leaves: true, has_wilting: true, has_stem_darkening: true, has_slow_growth: true,
      had_recent_rain: true,
      has_spots: false, has_dark_spots: false, has_white_powder: false,
      has_holes_in_leaves: false, has_webbing: false, insects_visible: false,
      has_uniform_yellowing: false, has_leaf_edge_burn: false, has_curled_leaves: false,
      has_fruit_rot: false, has_blossom_end_rot: false, had_cold_nights: false, had_heat_stress: false,
      recently_transplanted: false, recently_fertilized: false,
    },
  },
  {
    id: 'dacha_slugs',
    label: '🥬 Слизни на грядке',
    description: 'Объедены листья, слизистые следы — слизни активны ночью',
    crop: 'vegetable',
    plant_stage: 'growing',
    userType: 'dacha',
    staticResult: SLUG_DEMO_RESULT,
    questionnaire: {
      growing_environment: 'open_field', plant_stage: 'growing',
      days_since_problem_started: 2, watering_frequency: 'every_2_days', soil_moisture: 'wet',
      has_holes_in_leaves: true, insects_visible: false, had_recent_rain: true,
      has_spots: false, has_dark_spots: false, has_white_powder: false, has_webbing: false,
      has_yellowing_lower_leaves: false, has_uniform_yellowing: false, has_leaf_edge_burn: false,
      has_curled_leaves: false, has_wilting: false, has_stem_darkening: false,
      has_fruit_rot: false, has_blossom_end_rot: false, has_slow_growth: false,
      had_cold_nights: false, had_heat_stress: false, recently_transplanted: false, recently_fertilized: false,
    },
  },
]

/** Загрузить демо-результат с backend. Возвращает данные или выбрасывает Error с описанием причины. */
export async function loadDemoResult(
  fixtureId: string,
  apiUrl: string,
): Promise<AnalyzeResponse> {
  const fixture = DEMO_CASES.find(c => c.id === fixtureId)
  if (fixture?.staticResult) return fixture.staticResult

  const url = `${apiUrl}/api/v1/demo/cases/${fixtureId}`
  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  } catch (e) {
    const isLocalhost = apiUrl.includes('localhost')
    if (isLocalhost) {
      throw new Error(`Backend недоступен (${apiUrl}). Проверьте, что сервер запущен локально.`)
    }
    throw new Error(`Нет соединения с сервером (${apiUrl}). Проверьте интернет.`)
  }
  if (!res.ok) {
    throw new Error(`Сервер вернул ошибку ${res.status} для ${url}`)
  }
  return res.json()
}
