/**
 * lib/paywall.ts — конфиг и типы для paywall / premium conversion flow.
 *
 * Billing hook points помечены TODO: BILLING — там подключать реальный процессинг.
 */

export type PaywallMode = 'video' | 'premium'

export interface PaywallBullet {
  icon: string
  text: string
}

export interface PaywallConfig {
  title: string
  subtitle: string
  bullets: PaywallBullet[]
  cta: string
  secondaryCta?: string
  microcopy?: string
}

// ─── Copy per mode ────────────────────────────────────────────────────────────

export const PAYWALL_COPY: Record<PaywallMode, PaywallConfig> = {
  video: {
    title: 'Персональный разбор от AI-агронома',
    subtitle: 'Разберём именно ваш случай и подскажем, что делать дальше',
    bullets: [
      { icon: '🎬', text: 'Видеоответ 30–60 секунд — не статья, а живое объяснение' },
      { icon: '🔍', text: 'Объяснение вероятной причины именно по вашим симптомам' },
      { icon: '📋', text: 'Конкретный план действий с учётом культуры и стадии' },
      { icon: '➡️', text: 'Что проверить дальше, если первые шаги не помогут' },
    ],
    cta: 'Получить видеоразбор',
    microcopy: 'Подходит, если хотите более точный и понятный разбор по вашему растению',
  },
  premium: {
    title: 'Получите максимум от AI-агронома',
    subtitle: 'Для тех, кто хочет спасать растения быстрее и увереннее',
    bullets: [
      { icon: '🔓', text: 'Больше диагностик без ограничений' },
      { icon: '📊', text: 'Расширенные рекомендации и подробный анализ' },
      { icon: '📁', text: 'История проверок — отслеживайте прогресс лечения' },
      { icon: '🔄', text: 'Повторные сравнения: видно, улучшилось или нет' },
      { icon: '⚡', text: 'Приоритетный доступ к новым функциям' },
    ],
    cta: 'Открыть Premium',
    secondaryCta: 'Продолжить бесплатно',
    microcopy: undefined,
  },
}

// ─── Billing hook ─────────────────────────────────────────────────────────────

export interface PaywallActionResult {
  success: boolean
  error?: string
}

/**
 * Вызывается при нажатии основного CTA в paywall.
 * TODO: BILLING — заменить stub на реальный вызов Stripe / AppStore / billing API.
 */
export async function handlePaywallAction(
  mode: PaywallMode,
  _userId?: string,
): Promise<PaywallActionResult> {
  if (mode === 'premium') {
    // TODO: BILLING
    // const session = await createCheckoutSession(userId, 'premium_monthly')
    // window.location.href = session.url
    return { success: true }
  }
  // Video mode: handled by the caller (generateVideo call)
  return { success: true }
}
