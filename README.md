# ASG Towers — mobile-first scroll-video лендинг

Премиальный кинематографичный лендинг ЖК ASG Towers. 15 вертикальных видео
сменяются по скроллу (GSAP ScrollTrigger pin + scrub `video.currentTime`), поверх
видео — HTML-тексты и CTA. Между сценами 06 и 07 — белый editorial-блок
инфраструктуры. Финальное видео реки зациклено как фон CTA-экрана.

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # прод
```

Открывать как мобильную версию (DevTools → 390×844 / 393×852 / 430×932).

## Стек

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · GSAP +
ScrollTrigger · Framer Motion · HTML5 video. Шрифт — Manrope (next/font).

## Структура

```
app/                layout (metadata, Manrope, viewport), page (композиция), globals.css
components/         Header, StickyCTA, ScrollVideoReel, LoopVideoScene,
                   InfrastructureSection (doorway carousel), SceneProgress,
                   PlansSection, UnitCard, LeadModal, LeadForm, Button, icons
data/               scenes.ts · infrastructure.ts · units.ts  (весь контент здесь)
hooks/              useScrollVideo (pin + scrub), useLeadModal (UIProvider)
lib/                analytics (trackEvent) · lead (submitLead) · scroll
public/videos/      01..15 (переименованы из «Compressed video»)
public/posters/     01..15 (кадры-постеры, оптимизированы)
```

## Поведение видео

- Весь маршрут (видео 01–06 → инфраструктура → видео 07–14) — ОДНА запинённая
  сцена `JourneyReel`, без перелистываний между блоками. Скролл перетекает с конца
  одного клипа в начало следующего (клипы кадрово-непрерывны); лифт открывается
  прямо в супермаркет и выходит прямо в лобби — переходы внутри одного pin.
- Видна только активная дорожка, остальные `opacity:0`. Видео `object-cover`,
  `muted` `playsInline`, без контролов; скролл проматывает `currentTime`
  (scrub 0.6, rAF-сглаживание сидов). Вверх/вниз — назад/вперёд.
- Текст: появляется по входу в кадр (стагер eyebrow→title→desc→cta), исчезает по
  прогрессу скролла к концу сцены.
- `preload` повышается до `auto` при приближении сцены (IntersectionObserver).
- Инфраструктура — фаза внутри `JourneyReel` (между видео 06 и 07). Рамка лифта
  `/public/images/elevator-frame.png` (PNG с ПРОЗРАЧНЫМ дверным проёмом, вырезан
  через sharp) лежит СВЕРХУ карточек, поэтому металл всегда перекрывает края
  карточки — контент не вылезает. Карточки (иконка + название + фото) листаются
  ◂▸ при вертикальном скролле. Координаты проёма — `JourneyReel` (DOOR);
  иконки — `components/infraIcons.tsx`; данные — `data/infrastructure.ts`.
- Финальная сцена — `autoplay loop`, не scrub.
- `prefers-reduced-motion`: pin/scrub отключаются, показывается постер + статичный
  текст, обычная прокрутка.
- Desktop: вертикальное видео в центрированной портрет-колонке с ambient-фоном.

## TODO (подключение бэкенда)

- `lib/lead.ts` → `submitLead()`: Telegram Bot API / CRM / Google Sheets.
- `data/units.ts`: заменить mock на Google Sheets, добавить настоящую шахматку.
- `lib/analytics.ts` → `trackEvent()`: Google Analytics / Meta Pixel / CRM.
- `public/images/infrastructure/*.webp`: заменить градиент-плейсхолдеры (см. README там).
