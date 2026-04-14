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

## Farmer Setup экран (апр 2026)

- Новый файл: `app/farmer-setup/page.tsx` — перенесён из Stitch code.html
- Маршрут: `/farmer-setup` → сохраняет crops + field в sessionStorage → redirect `/upload`
- Структура: TopAppBar + progress bar + crops multi-select + field creation card + decorative image + sticky CTA

---

## Сегментация result screen (апр 2026)

- Изменён: `app/results/page.tsx` — читает `localStorage("userType")`, вычисляет `seg` (`farm|home|dacha|null`)
- 6 адаптированных текстов: заголовок раздела действий, сообщение "здорово", upsell заголовок + подпись, CTA кнопка, подпись кнопки повтора
- Fallback: `seg === null` → прежние тексты без изменений
- Сегменты: `farm` (🚜 Фермер) / `home` (🌸 Цветовод) / `dacha` (🌱 Дачник + 🌿 Садовод)

---

## Онбординг реализован (апр 2026)

- Файл: `app/onboarding/page.tsx` — перенесён 1:1 из Stitch code.html: TopAppBar, column cards (flex-col gap-6), decorative image, sticky footer CTA h-64
- Файл: `app/layout.tsx` — добавлен Manrope (headline font из Stitch), bg-body = #f8faf8
- Изменён: `app/upload/page.tsx` — `useEffect` guard: если нет `localStorage("userType")` → `router.replace('/onboarding')`
- Типы: `home` / `dacha` / `garden` / `farm`
- При выборе и нажатии «Продолжить»: `localStorage.setItem("userType", value)` → `/upload`

---

## Профиль + навигация (апр 2026)

- **BottomNav.tsx** переписан: убран Сканер + `onScan` prop, добавлен Профиль → /profile; `active` теперь `'home' | 'history' | 'profile'`
- **app/profile/page.tsx** создан — полноценный экран:
  - Карточка пользователя: userType + emoji + farmerCrops/farmerField для фермеров
  - История диагностик: последние 3 записи из `getHistory()` с thumbnail, кнопка → /history
  - Блок монетизации: bg #1b4332, bullet-list адаптирован под сегмент (farm/other), CTA → PaywallModal
  - Действия: сменить тип → /onboarding, очистить данные (удаляет agro_history + userType + sessionStorage)
- **app/upload/page.tsx**: убран prop `onScan` из `<BottomNav>`
- **app/results/page.tsx**: обновлены все 3 inline bottom nav (farm, home, default) — Сканер → Профиль → /profile
- Данные: `userType` из localStorage, `agro_farmer_crops/field` из sessionStorage, история из `lib/history.ts`

---

## Upload UX — gallery input fix (апр 2026)

- Добавлен `galleryRef` — отдельный `<input>` без `multiple`, используется только для "Выбрать из галереи"
- `inputRef` (с `multiple`) сохранён для кнопки "Добавить" в photo grid
- Android: "Выбрать из галереи" открывает галерею напрямую
- iOS: action sheet сокращён с 3 до 2 пунктов (нет "Выбрать файлы"); прямой переход в галерею на iOS через HTML невозможен (ограничение Safari)

---

## Upload screen переработан (апр 2026)

- Изменён: `app/upload/page.tsx` — полная перестройка визуального слоя по Stitch
- Удалён Hero card с градиентом и бейджами
- Добавлены: TopAppBar + контекст-чип (из sessionStorage фермера) + центрированный H2
- Upload zone: dashed border, min-h-340px, иконка w-20 h-20, hover scale
- После загрузки: photo grid в Stitch карточке (rounded-[3rem])
- Карточки советов: "Образец фото" + "Рекомендации" (bg #f2f4f2, rounded-[2rem])
- Crop chips: pill с круглым фото, selected = bg #1b4332
- CTA: h-16 rounded-full, bg #1b4332 / text #86af99, выше BottomNav (bottom: 60)

---

## Farmer result screen (апр 2026)

- Изменён: `app/results/page.tsx` — добавлен отдельный layout для `seg === 'farm'` (early return)
- Структура: TopAppBar + Hero (aspect-[4/3], title+badge внутри) + Bento metrics + План действий + Видео блок + Sticky CTA + Bottom nav
- **Hero**: `aspect-[4/3]`, gradient overlay, urgency badge + % уверенности + название болезни внутри
- **Bento metrics**: Срочность (full-width, цвет urgencyColor), Масштаб (crop + поле), Риск потерь (bg #1b4332, белый текст)
- **Риск**: derived из urgency: critical→"до 60%", high→"до 40%", medium→"до 20%", low→"до 5%"
- **Масштаб**: `result.crop.selected` + `farmerField.area` га из sessionStorage
- **План действий**: `today_actions.slice(0,3)` разбит по ". " → title + desc, номер в `bg #aeeecb`
- **Видео upsell**: тёмная карточка `bg #012d1d`, aspect-video preview с play, 3 bullet с иконками
- **Sticky CTA**: "Получить разбор от агронома" — fixed bottom 60px, `bg #1b4332`, открывает PaywallModal
- Нетронуты: home/dacha/null layout, PaywallModal, вся бизнес-логика, in-progress/ready states
- `farmerField` читается из `sessionStorage("agro_farmer_field")`

---

## Home result screen (апр 2026)

- Изменён: `app/results/page.tsx` — добавлен отдельный layout для `seg === 'home' && topIssue` (early return)
- Активируется только когда есть диагноз болезни; здоровые растения → default layout
- **Hero**: `aspect-[4/5]` (портретное), `opacity-90`, glass panel overlay (rgba(255,255,255,0.70) + backdrop-blur-24) с: "Анализ завершен" label + название + 2 badge (совпадение + угроза)
- **Что с растением**: карточка белая `bg #fff` shadow, Leaf icon, `result.urgency.reason` как текст
- **Почему произошло**: карточка светло-серая `bg #f2f4f2`, Thermometer icon, `topIssue.why` bullet list с cycling icons (Droplet/Wind/Leaf/Thermometer)
- **План восстановления**: section `bg rgba(242,244,242,0.50)`, numbered cards с colored circles: #1b4332 / #aeeecb / #cba72f, разбивает action по ". "
- **Советы эксперта**: горизонтальный scroll, карточки `bg #e6e9e7 w-192px`, icon `bg-white rounded-full`, данные из `today_actions.slice(3)` или `topIssue.why`
- **CTA**: `fixed bottom: 76`, `bg #1b4332 text #86af99`, `rounded-[1rem]`, "Получить советы эксперта" + MessageCircle icon → PaywallModal
- **Bottom nav**: 4 таба (Обзор/Сканер/История/Профиль) в Stitch стиле с `bg #f8faf8/80 backdrop-blur`
- Нетронуты: farm layout, dacha/null layout, вся бизнес-логика

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
