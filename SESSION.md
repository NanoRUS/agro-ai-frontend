# SESSION.md — agro-ai-frontend

## Статус: production, активен

---

## Что реализовано

- Полный UI flow: upload → questionnaire → results → premium paywall
- `send-order/route.ts`: Telegram уведомление + Video Factory job + callback pipeline
- Callback webhook (`video-webhook.py` на 192.168.10.70:7900) — получает видео от factory и пересылает в Telegram
- История анализов в localStorage
- Типизация через `lib/api.ts`

## Последние изменения (апр 2026)

- Добавлены `VFACTORY_CALLBACK_URL` и `VFACTORY_CALLBACK_TOKEN` в `send-order/route.ts`
- `vfCreateJob()` теперь принимает и передаёт `callbackUrl` / `callbackToken`
- E2E pipeline подтверждён: factory → callback → Telegram sendVideo OK

## Анализ навигации (апр 2026)

Проанализирована нижняя навигация и вопрос добавления таба "Профиль".

**Ключевой факт:** таб-бар захардкожен inline в `upload/page.tsx` — нет переиспользуемого компонента.

**Варианты внедрения (от безопасного к сложному):**
1. Создать `components/BottomNav.tsx` (вынос без изменения поведения)
2. Добавить `/profile` страницу (localStorage, PaywallModal) + 4-й таб
3. Подключить данные из `lib/history.ts` (покупки, статус premium)
4. Auth + backend (только после подтверждения монетизации)

**MVP профиля:** имя (localStorage) + остаток анализов + кнопка "Купить" → PaywallModal.
**Название:** "Профиль". **Позиция:** крайний правый.

Статус: анализ завершён. Шаг 1 выполнен — BottomNav вынесен в компонент. Онбординг реализован.

---

## Шаг 1 выполнен (апр 2026)

Нижняя навигация вынесена в `components/BottomNav.tsx`.
- Новый файл: `components/BottomNav.tsx` — props: `active`, `onScan`
- Изменён: `app/upload/page.tsx` — inline nav заменён на `<BottomNav active="home" onScan={...} />`
- TSC: 0 ошибок
- Поведение 1:1, маршруты не изменены, Сканер — по-прежнему action trigger

**Следующий возможный шаг:** Шаг 2 — добавить `/profile` страницу и 4-й таб (требует отдельного подтверждения).

---

## Онбординг реализован (апр 2026)

## Сегментация result screen (апр 2026)

- Изменён: `app/results/page.tsx` — читает `localStorage("userType")`, вычисляет `seg` (`farm|home|dacha|null`)
- 6 адаптированных текстов: заголовок раздела действий, сообщение "здорово", upsell заголовок + подпись, CTA кнопка, подпись кнопки повтора
- Fallback: `seg === null` → прежние тексты без изменений
- Сегменты: `farm` (🚜 Фермер) / `home` (🌸 Цветовод) / `dacha` (🌱 Дачник + 🌿 Садовод)

---

## Онбординг реализован (апр 2026)

- Файл: `app/onboarding/page.tsx` — переписан по Stitch-референсу: 2-col grid, карточки с description, check icon в углу, sticky CTA с helper text
- Изменён: `app/upload/page.tsx` — `useEffect` guard: если нет `localStorage("userType")` → `router.replace('/onboarding')`
- Типы: `home` / `dacha` / `garden` / `farm`
- При выборе и нажатии «Продолжить»: `localStorage.setItem("userType", value)` → `/upload`

---

## Следующий шаг (Vercel)

Установить env vars в Vercel и сделать redeploy:
```
VFACTORY_CALLBACK_URL   = http://192.168.10.70:7900/video-callback
VFACTORY_CALLBACK_TOKEN = vf-callback-secret-2026
```

## Важно не забыть

- `results/page.tsx` — визуальный эталон, любые новые экраны должны соответствовать его стилю
- `buildVideoScript()` в `send-order/route.ts` генерирует ~550-символьный скрипт (~35-40 сек TTS)
- Короткие тестовые скрипты (<130 символов) дают видео с тишиной после 10 сек — это не баг
