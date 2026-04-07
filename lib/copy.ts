/**
 * lib/copy.ts — все тексты продукта в одном месте.
 * Меняй здесь, не трогай компоненты.
 */

// ─── Urgency ─────────────────────────────────────────────────────────────────

export interface UrgencyCopy {
  icon: string
  badge: string          // короткий лейбл в badges
  headline: string       // главная строка Hero
  consequence: string    // "Это может уничтожить..."
  cta: string            // "Требует действий сегодня"
  bg: string
  text: string
  border: string
  badgeBg: string
  badgeText: string
}

export const URGENCY_COPY: Record<string, UrgencyCopy> = {
  critical: {
    icon: '🚨',
    badge: 'Критично',
    headline: 'Нужно действовать сегодня',
    consequence: 'Без обработки растение может погибнуть за 3–7 дней',
    cta: 'Немедленная обработка',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
  },
  high: {
    icon: '⚠️',
    badge: 'Срочно',
    headline: 'Действуйте в ближайший день-два',
    consequence: 'Проблема будет распространяться, если не принять меры',
    cta: 'Обработка в течение 48 часов',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  medium: {
    icon: '⏳',
    badge: 'Требует внимания',
    headline: 'Примите меры в ближайшие дни',
    consequence: 'Раннее вмешательство предотвратит ухудшение',
    cta: 'Рекомендуется принять меры',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-700',
  },
  low: {
    icon: 'ℹ️',
    badge: 'Наблюдение',
    headline: 'Понаблюдайте за динамикой',
    consequence: 'Симптомы слабые — следите за изменениями',
    cta: 'Повторная проверка через 3–4 дня',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
}

// ─── Confidence ───────────────────────────────────────────────────────────────

export interface ConfidenceCopy {
  label: string
  explanation: string
  retakeHint: string | null
  color: string
  barWidth: string
  barColor: string
}

export const CONFIDENCE_COPY: Record<string, ConfidenceCopy> = {
  high: {
    label: 'Высокая уверенность',
    explanation:
      'Мы видим характерные признаки и условия, при которых эта проблема встречается чаще всего.',
    retakeHint: null,
    color: 'text-green-700',
    barWidth: 'w-full',
    barColor: 'bg-green-500',
  },
  medium: {
    label: 'Средняя уверенность',
    explanation:
      'Часть признаков совпадает, но картина неполная. Дополнительные фото или данные повысят точность.',
    retakeHint: 'Снимайте крупным планом при ярком дневном свете: пятна, изнанку листа, стебель.',
    color: 'text-amber-600',
    barWidth: 'w-2/3',
    barColor: 'bg-amber-400',
  },
  low: {
    label: 'Слабые признаки',
    explanation:
      'Симптомы неспецифичны — возможно несколько причин. Подождите 2–3 дня и повторите диагностику.',
    retakeHint: 'Добавьте фото поражённых плодов, корней (если пересаживали), разных листьев.',
    color: 'text-gray-500',
    barWidth: 'w-1/3',
    barColor: 'bg-gray-300',
  },
}

// ─── If-nothing risks by urgency ─────────────────────────────────────────────

export const IF_NOTHING_RISKS: Record<string, string[]> = {
  critical: [
    'Болезнь распространится на всё растение за 3–7 дней',
    'Заражение соседних кустов через воздух и воду',
    'Полная потеря урожая на этом растении',
    'Необходимость замены грунта или дезинфекции теплицы',
  ],
  high: [
    'Проблема усилится в ближайшие 5–10 дней',
    'Увеличение поражённой площади листьев',
    'Снижение урожайности и качества плодов',
    'Риск перехода к более тяжёлой стадии',
  ],
  medium: [
    'Симптомы продолжат развиваться медленно',
    'Ослабление растения и снижение иммунитета',
    'Повышенная уязвимость к другим болезням',
  ],
}

// ─── Category-specific consequence addons ────────────────────────────────────

export const CATEGORY_RISK_ADDON: Record<string, string> = {
  fungal: 'Грибковые споры быстро распространяются при влажной погоде',
  bacterial: 'Бактериальные инфекции не лечатся фунгицидами — нужна другая обработка',
  pest: 'Колония вредителей удваивается каждые 7–14 дней',
  nutrient: 'Дефицит питания замедляет восстановление даже после подкормки',
  water: 'Корневая система восстанавливается медленно — недели или месяцы',
  stress: 'Стресс снижает иммунитет и делает растение уязвимым к болезням',
}

// ─── Actions block ───────────────────────────────────────────────────────────

export const ACTIONS_COPY = {
  title: 'Сделайте это прямо сейчас',
  subtitle: 'Эти шаги помогут остановить распространение проблемы',
  showMore: (n: number) => `Показать ещё ${n} шагов`,
  showLess: 'Скрыть',
}

// ─── Alternatives block ───────────────────────────────────────────────────────

export const ALTERNATIVES_COPY = {
  title: 'Также возможно',
  subtitle: 'Если ситуация не улучшится, сделайте повторную проверку',
  mainLabel: 'Главная версия',
}

// ─── Follow-up block ──────────────────────────────────────────────────────────

export const FOLLOWUP_COPY = {
  title: 'Проверьте снова через 2–3 дня',
  body: 'Сравним состояние и скорректируем рекомендации на основе изменений',
  cta: 'Повторная диагностика',
}

// ─── Video upsell (in-page teaser) ────────────────────────────────────────────

export const VIDEO_TEASER_COPY = {
  title: '🎥 Персональный разбор от агронома',
  subtitle: '30–60 секунд · как консультация эксперта',
  bullets: [
    'Объяснит вероятную причину именно в вашем случае',
    'Скажет, что делать — с учётом культуры и стадии роста',
    'Поможет снизить риск потери урожая',
  ],
  cta: 'Получить разбор',
  scriptPreviewLabel: 'Фрагмент скрипта:',
}

// ─── Video tone labels ────────────────────────────────────────────────────────

export const VIDEO_TONE_LABELS: Record<string, { label: string; desc: string }> = {
  urgent_expert: {
    label: '🔴 Срочный разбор',
    desc: 'Жёстко и по делу — риски, факты, немедленные действия',
  },
  calm_consultant: {
    label: '🟢 Спокойная консультация',
    desc: 'Объяснение причин, понятные шаги, без паники',
  },
  crop_doctor: {
    label: '🩺 Доктор растений',
    desc: 'Диагноз → лечение → прогноз, врачебный стиль',
  },
}
