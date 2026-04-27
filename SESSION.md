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

### plant_category — вертикальный срез (апр 2026)

**Frontend (agro-ai-frontend):**
- `app/upload/page.tsx`: добавлен `HOME_CROPS` (5 элементов: houseplant/flowering/succulent/decorative/unknown), константа `PLANT_CATEGORY_LABELS`. `isHomeDacha` вычисляется из userType. `activeCrops` ветвится по userType. `handleNext` сохраняет в `agro_plant_category` (home/dacha) или `agro_crop` (farm) — взаимоисключающие ключи. Img-кружок рендерится только при `c.img`. Error message адаптирован под тип пользователя.
- `lib/api.ts`: `analyzeImages()` принимает `crop_type?: string | null` и `plant_category?: string | null`. В requestBody условно включается только нужное поле.
- `app/questionnaire/page.tsx`: читает `agro_crop` и `agro_plant_category` из sessionStorage. Редирект если оба пусты. Передаёт `crop_type` или `plant_category` в `analyzeImages`.
- `app/results/page.tsx`: добавлен `PLANT_CATEGORY_LABELS` (покрывает оба домена — home/dacha + farm) и `cropDisplayLabel()`. `tomato→Томат`, `cucumber→Огурец`, `potato→Картофель`, `pepper→Перец`, `strawberry→Клубника`, `unknown→Растение`. Raw values больше не отображаются нигде.

**Backend (agro-ai):**
- `app/schemas/analyze.py`: добавлен `PlantCategory` Literal. `crop_type: Optional[CropType] = None`. `plant_category: Optional[PlantCategory] = None` в `AnalyzeRequest`. `CropResult.selected: str` (было `CropType`).
- `app/rules/crops/generic.json`: новый файл — 6 универсальных issues (overwatering, underwatering, root_rot, aphids, spider_mites, general_stress).
- `app/api/v1/analyze.py`: `effective_crop = crop_type or "generic"`, `display_selected = crop_type or plant_category or "unknown"`. CV hint = crop_type или plant_category. DB и response используют `display_selected`. `CROP_NAMES_RU` расширен home-категориями.

**Контракт:**
- farm: `crop_type=<value>`, `plant_category=None` → crop-specific scoring
- home/dacha: `crop_type=None`, `plant_category=<value>` → generic scoring (6 issues)
- Farmer flow не тронут

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

## Главная страница — Stitch landing (апр 2026)

- Изменён: `app/upload/page.tsx` — полная перестройка главного экрана
- **Пустое состояние (no photos)** = Stitch landing:
  - Hero: `aspect-[4/5]` с `/categories/fungal.jpg`, gradient overlay, badge "Технология AI + Агрономия", h1, subtitle — из code.html
  - Scanner card: `/demos/tomato-blight.jpg` grayscale-0.5, scan line, "Обнаружена угроза" glass-pill, accuracy bar 85% / 98.2% — из code.html
  - Benefits: 3 строки с icon circles (#aeeecb bg) — Clock/Brain/Leaf — текст 1:1 из code.html
  - CTA primary: `py-24 px-32 bg #1b4332 rounded-2xl shadow-lg`, Camera icon — из code.html
  - CTA secondary: white bg, border, ImagePlus icon — из code.html
  - Trust: "Это займет ~10 секунд" + ShieldCheck + "AI + агрономическая модель" — из code.html
  - Demo section: "Примеры диагностики" (сохранена как discovery)
- **Состояние с фото** = post-upload flow (farmerCtx + headline + photo grid + crop selection + Continue)
- Sticky CTA "Продолжить" скрыт в landing state, показывается только при наличии фото
- Отклонения от code.html: TopAppBar сохранён без изменений ("Диагностика" вместо "BOTANICA"); BottomNav наш (не Stitch)

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

## Landing page polish — "wow" (апр 2026)

- Изменён: `app/upload/page.tsx` — точечный polish без изменения flow
- **Удалено**: TopAppBar (X, "Диагностика", три точки), `MoreVertical` из импортов; `paddingTop: 64 → 0`
- **Hero**: full-bleed без горизонтальных отступов, `borderRadius: '0 0 2.5rem 2.5rem'`; gradient усилен: `rgba(1,45,29,0.90) 0% → rgba(0,0,0,0.15) 70% → transparent 100%`
- **Scanner card**: стал интерактивным `<button>` с `active:scale-[0.98]`, border `1.5px rgba(44,105,78,0.22)`, shadow; добавлена micro-hint "Камера откроется сразу" (Camera icon + текст)
- **Primary CTA**: shadow `0 16px 48px rgba(27,67,50,0.55), 0 4px 16px rgba(27,67,50,0.25)`, добавлены `hover:scale-[1.01] hover:brightness-110`
- **Benefits icons**: убран `marginTop: 4` — все иконки теперь строго по верхней линии
- **Demo labels**: добавлен `minHeight: 32` — все карточки одинаковой высоты

---

## Farmer profile rebuild (апр 2026)

- **Farmer layout** — early return для `userType === 'farm'`, полностью отдельный экран
- **Hero card**: dark gradient `#1b4332→#012d1d` + radial glow, identity + crops (с Leaf icon) + field + stats bento (N диагностик / N культур)
- **История**: кликабельные карточки `bg #f8faf8` с thumbnail 52px + urgency badge (color-coded) + ChevronRight — структура из LEFT-референса (results v1)
- **Premium**: headline "Снизьте риск потерь урожая", 3 numbered plan items (полупрозрачные карточки + #aeeecb нумер) — структура из RIGHT-референса (results v2)
- **Non-farmer**: layout без изменений по смыслу, убран MoreVertical
- **Цвета urgency**: critical=#dc2626, high=#ea580c, medium=#d97706, low=#16a34a

---

## Physical UI depth — главная (апр 2026)

- **Hero shadow**: `0 24px 64px rgba(1,45,29,0.22), 0 8px 24px rgba(0,0,0,0.12)` — глубокое отделение от фона
- **Hero overlays**: 2 слоя — линейный градиент + `radial-gradient` вигнет по краям
- **Hero текст**: `backdrop-blur(2px)` + `textShadow` — читаемость + ощущение глубины
- **Scanner card**: bg `#ffffff` (был `#f2f4f2`), shadow `0 8px 40px rgba(27,67,50,0.10)`, border `rgba(193,200,194,0.18)` — физическая карточка
- **Scanner section**: paddingTop `52px` (было 40px) — больше воздуха, scanner = визуальный якорь
- **Zap + demo header**: добавлен в предыдущем коммите (не закоммичен, откат не нужен)

---

## Bugfix: hero radius + history 404 (апр 2026)

- **Hero**: `borderRadius: '2rem'` (все углы одинаковые), убран `'0 0 2.5rem 2.5rem'` — крышка исчезла; секция добавила `padding: '... 20px'` — hero как карточка
- **История 404**: `app/history/page.tsx` существовал ЛОКАЛЬНО но никогда не был в git — Vercel его не видел. Исправлено: файл добавлен в коммит `50840b2`; старый inline nav (Главная/Сканер/История) заменён на `<BottomNav active="history" />`

---

## Bugfix: hero padding + history route (апр 2026)

- Hero section: `paddingTop: 'max(env(safe-area-inset-top), 48px)'` — на notch-устройствах использует safe-area, иначе 48px
- История: `app/history/page.tsx` существует, `/history` в билде ✓ — 404 был из-за старого Vercel preview URL

---

## Video delivery pipeline — vf-poller (апр 2026)

**Корневая причина:** Factory API (`/create_plant_analysis`) не поддерживает `callback_url` — поле игнорируется, callback никогда не вызывается.

**Решение (Вариант A):** Polling-скрипт на 192.168.10.70.
- Файл: `/home/cerberus/vf-poller.py`
- Env: `~/webhook.env` (добавлен `VFACTORY_URL=http://109.195.103.40:7861`)
- State: `~/.vf-poller-state.json` (хранит обработанные job_id)
- Cron: `*/3 * * * *` — каждые 3 минуты
- Лог: `/tmp/vf-poller.log`

**Что делает:** `GET /my_jobs` → фильтрует completed + не в state → скачивает mp4 → `sendVideo` в Telegram оператору (caption: контакт пользователя)

**Протестировано:** 11 накопленных видео успешно доставлено при первом запуске.

**Webhook `video-webhook.py`:** по-прежнему запущен, но фактически не используется (factory не вызывает callback). Можно оставить или убрать.

---

## Следующий шаг (Vercel)

Установить env vars в Vercel и сделать redeploy:
```
VFACTORY_CALLBACK_URL   = http://192.168.10.70:7900/video-callback
VFACTORY_CALLBACK_TOKEN = vf-callback-secret-2026
```

## Recommendations block — финальный стандарт (апр 2026)

Проанализирован и унифицирован блок рекомендаций на result screen.

**Зафиксированные решения:**
- `action` cards: без ChevronRight, без onClick — не кликабельны
- `link` cards (re-scan): ChevronRight сохранён, реальный `router.push`
- `paywall` cards (video upsell): ChevronRight + onClick → setPaywallOpen(true), outer div кликабелен
- farm: title `"План действий"` + helper `"Приоритетные шаги для защиты урожая"`
- home / dacha / default: title `"Что делать сейчас"` + helper `"Следуйте этим шагам, чтобы помочь растению восстановиться"`
- Urgency-subtitle (агрессивный тон) — убран
- fontWeight 700 / fontSize 15 — единый для всех сегментов
- Визуал: glass-panel, `#1b4332` иконка-круг, без chevron — единый для всех

**Что не менялось:** layout экрана, data model, маршруты, PaywallModal, sticky CTA

---

## Bugfix: видео-upsell карточка farm layout (апр 2026)

**Причина бага:** карточка "Персональный видео-разбор" (farm layout, lines 647–707) имела только play-кнопку с onClick. Клик по заголовку/буллетам не давал реакции.

**Решение (Вариант A):** outer `<div>` стал кликабельным:
- `onClick={() => setPaywallOpen(true)}`
- `cursor: 'pointer'`
- `className: 'active:opacity-90 transition-opacity'` (мягкий feedback)
- Добавлен `ChevronRight` справа от заголовка (`rgba(255,255,255,0.45)`)
- Play-кнопка внутри оставлена с тем же handler (не вложенный button — outer `<div>`)

**Изменён:** `app/results/page.tsx` — оба upsell-блока (farm + default/dacha)

**Не менялось:** PaywallModal, sticky CTA, home/dacha/default plan actions, in-progress/ready состояния

**Финальный паттерн для upsell-карточек:**
- outer `<div>`: `onClick → setPaywallOpen`, `cursor: pointer`, `hover:opacity-95 active:opacity-90 transition-opacity`
- ChevronRight рядом с заголовком, `rgba(255,255,255,0.65)`
- Inner CTA-кнопка / play-кнопка — дублируют тот же handler (не вложенный button, т.к. outer — div)

**Осталось нерешённым:** нет открытых вопросов.

---

## Sticky CTA bugfix (апр 2026)

**Баг 1 — конфликт состояний:** sticky CTA "Получить разбор" показывался одновременно с карточкой "Видеоразбор в работе". Guard отсутствовал.
**Фикс:** оба sticky CTA (farm line ~821, home line ~1219) обёрнуты условием `premiumStatus !== 'video_review_in_progress' && premiumStatus !== 'video_review_ready'`. Коммит `63d51b5`.

**Баг 2 — прилипание к nav:** `bottom: 60/76` не учитывал iOS safe-area-inset-bottom.
**Фикс:** `bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))'` (farm) и `calc(76px + ...)` (home).

Файл: только `app/results/page.tsx`.

---

## Farm in_progress card — унификация (апр 2026)

**Проблема:** farm `video_review_in_progress` карточка была упрощённой — только badge + заголовок + subtitle + avatar. Без шагов, stepper и ETA. Default/home карточка — полноценная.

**Решение:** farm карточка заменена на полный шаблон (коммит `d65c968`). Изменён только `app/results/page.tsx`, один блок `premiumStatus === 'video_review_in_progress'` в farm layout.

**Farmer-специфичные тексты:**
- Label: `Заявка зарегистрирована`
- Subtitle: `Агроном уже получил данные по вашему полю`
- Шаг 2: `Подбирает препараты и схему обработки`
- Шаг 3: `Составляет план действий по полю`

**Не тронуто:** `video_review_ready`, остальной farm layout, логика статусов, backend.

---

## Bugfix: premiumStatus не восстанавливается из истории (апр 2026)

**Симптом:** Пользователь открывает кейс с `video_review_in_progress` из Истории → попадает на result screen → вместо карточки "Видеоразбор в работе" видит upsell.

**Корневая причина — race condition:**
- `handleOrderSubmit` вызывает `setPremiumOrder(id, 'video_review_in_progress')` синхронно (до async canvas thumbnail)
- `setPremiumOrder` делает `getHistory().map(...)` — обновляет только **существующие** записи, не создаёт новых
- `buildHistoryEntry → upsertHistoryEntry` в `useEffect` — async, не дожидаемся
- Если `upsertHistoryEntry` ещё не завершился → в localStorage нет записи → `setPremiumOrder.map()` итерирует пустой массив → статус потерян
- `upsertHistoryEntry` создаёт запись позже — **без** `premiumOrderStatus`
- При открытии из истории: `getPremiumStatusForAnalysis` → null → upsell показывается

**Проверка: не перетирает ли повторный `upsertHistoryEntry`?**
`mergeHistoryEntry` делает `{ ...incoming, ...preserved }` — `preserved` (включая `premiumOrderStatus`) спредится **последним** → всегда побеждает. Повторный `upsertHistoryEntry` из `useEffect` не затирает уже сохранённый статус. ✓

**Фикс** (`handleOrderSubmit` в `app/results/page.tsx`):
```js
// Перед setPremiumOrder: гарантируем наличие записи в localStorage
await buildHistoryEntry(result, heroImage ?? null).then(upsertHistoryEntry).catch((e) => {
  console.error('[handleOrderSubmit] upsertHistoryEntry failed:', e)
})
setPremiumOrder(result.analysis_id, 'video_review_in_progress', contact)
```

**Race полностью устранён:** запись в localStorage создаётся до `setPremiumOrder`. Дублей нет — `upsertHistoryEntry` делает upsert по `id`, а `mergeHistoryEntry` сохраняет `premiumOrderStatus` из prev.

Коммиты: `f7d6d02` (race fix) + `ae95f8d` (logging).

---

## Farmer setup — custom crop flow (апр 2026)

**Коммит:** `e2b003c`. Изменён только `app/farmer-setup/page.tsx`.

**Проблема:** "Добавить культуру" и "Другая культура" были dead buttons без onClick.

**Что реализовано:**

Новые state:
- `customCrops: string[]` — добавленные пользователем культуры
- `showAddInput: boolean` — показывает inline input
- `inputVal: string` — текущее значение поля

Новые handlers:
- `confirmAddCrop()` — trim, capitalize first letter, dedupe (при дубликате выбирает существующий chip), добавляет в customCrops + сразу в selectedCrops, закрывает input
- `removeCustomCrop(crop)` — убирает из customCrops и selectedCrops

Поведение:
- Обе кнопки открывают один inline input внутри flex-wrap chips
- Input: autoFocus, Enter = confirm, placeholder "Например: орех, манго, виноград"
- Custom chips: те же стили что у стандартных, с × для удаления
- `handleNext()` не изменён — сохраняет весь `selectedCrops` включая custom

---

## PaywallModal — keyboard-aware contact step (апр 2026)

**Коммит:** `c439ca4`. Изменён только `components/paywall/PaywallModal.tsx`.

**Проблема:** iOS Safari при открытии клавиатуры перекрывал нижнюю часть bottom sheet. CTA ("Подтвердить и получить разбор") уходила под клавиатуру.

**Фикс 1 — visualViewport listener:**
- `kbOffset = Math.max(0, window.innerHeight - vp.height - vp.offsetTop)`
- Sheet: `transform: translateY(-${kbOffset}px)` + `transition: 0.2s ease-out`
- Работает для всех шагов модалки, безопасно для desktop (kbOffset = 0)

**Фикс 2 — ContactContent вертикальный ритм (-28px):**
- wrapper: `py-2` → `py-1`
- banner: `mb-5 py-2.5` → `mb-3 py-2`
- subtitle: `marginTop 6` → `4`
- telegram hint: `mt-6 mb-3` → `mt-4 mb-2.5`
- убран дублирующий параграф "Отправим видеоразбор сюда", оставлен только "Никаких лишних сообщений"

**Не тронуто:** paywall step, success step, flow, тексты CTA, backend.

---

## Indoor copy adaptation — home/default result screen (апр 2026)

**Коммит:** `5d04a35`. Изменены только `app/questionnaire/page.tsx` и `app/results/page.tsx`.

**Суть:** `growing_environment` не возвращается в `AnalyzeResponse` — нужно было сохранить отдельно.

**Что сделано:**
- `questionnaire/page.tsx`: при успехе `sessionStorage.setItem('agro_env', form.growing_environment)`
- `results/page.tsx`: `useState growingEnv`, читается из `agro_env`, вычисляется `isIndoor`

**Адаптированные строки (только home/default layout):**
1. home layout plan helper (line ~1110): `"...восстановиться"` → `"...восстановиться в помещении"` if indoor
2. default layout plan helper (line ~1439): то же самое
3. default re-scan subtitle (line ~1925): `"Отслеживайте динамику и корректируйте лечение"` → `"Следите за состоянием растения дома"` if indoor

**Не тронуто:** farm layout, today_actions, backend, сегментация.

---

## Questionnaire — опция "В помещении" (апр 2026)

**Изменён:** только `app/questionnaire/page.tsx`. Коммит `cb05393`.

- `type Env`: добавлен `'indoor'` → `'indoor' | 'greenhouse' | 'open_field'`
- Список опций обновлён: **В помещении** / В теплице / В открытом грунте (indoor первый)
- Дефолт изменён: `open_field` → `indoor` (open_field давал неверные данные для рассады и домашних сценариев)
- В том же коммите: ранее незакоммиченные UX-фиксы LoadingOverlay (таймер elapsed, кнопка Отменить после 15с, error блок перемещён в sticky CTA зону)

---

## Важно не забыть

- `results/page.tsx` — визуальный эталон, любые новые экраны должны соответствовать его стилю
- `buildVideoScript()` в `send-order/route.ts` генерирует ~600-символьный скрипт (~50-55 сек TTS)
- Короткие тестовые скрипты (<130 символов) дают видео с тишиной после 10 сек — это не баг

---

## Статус доставки (апр 2026)

**Доставка работает end-to-end:**
- `app/api/send-order/route.ts` — был Untracked, никогда не деплоился. Исправлено: закоммичен `fbb7fb2`.
- Telegram-уведомление приходит с фото ✓
- Factory job создаётся ✓
- Поллер (`vf-poller.py`) скачивает и доставляет видео в Telegram ✓

**Новая проблема — truncation на ~45 сек:**

**Локализация:** factory truncation. mp4 на диске = ровно 45.000000 сек, size 2.0 MB.
Причина: `duration: 45` хардкодится в `vfCreateJob()` (`send-order/route.ts`).
Фабрика режет видео по этому лимиту. TTS скрипта занимает ~50-55 сек → финал обрезается.
Поллер и Telegram — чисты (передают файл 1:1).

**Финальный fix (двухуровневый):**

1. `send-order/route.ts`: `duration: 90` — API-уровень, fallback (задеплоен, коммит `79eece9`)
2. `gen_plant_analysis_video.py` на factory-сервере — патч после TTS:
   - измеряет реальную длину `voice.mp3` через ffprobe
   - `computed_dur = ceil(audio_dur + 1.5)`
   - передаёт computed_dur в `assemble()` вместо payload-значения
   - бэкап: `gen_plant_analysis_video.py.bak`
   - лог-строка: `⏱  audio=43.39s → duration=45s (was 90s)`

**Патч 1 — динамический duration** (`gen_plant_analysis_video.py`):
После TTS: `ffprobe voice.mp3` → `computed_dur = ceil(audio_dur + 1.5)` → передаётся в `assemble()`.
Лог: `⏱  audio=57.89s → duration=60s (was 90s)`

**Патч 2 — динамический fade-out** (`gen_plant_analysis_video.py`):
`st=44.5` → `st={dur - 0.5}` — финальное затемнение теперь в конце видео, не на 44.5s.
До патча: длинные ролики давали чёрный экран с 44.5s до конца.

**Бэкап:** `gen_plant_analysis_video.py.bak` на factory-сервере.

**Итог:** стандартный скрипт → TTS=43.39s → 45s. Длинный скрипт → TTS=57.89s → 60s. Payload `duration` из API игнорируется фабрикой — используется реальная длина аудио. E2E пайплайн полностью рабочий.
