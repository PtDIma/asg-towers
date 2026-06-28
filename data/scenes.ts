export type SceneAlign = "bottom" | "center" | "top";
export type SceneTheme = "dark" | "light" | "light-transition";

export interface Scene {
  id: string;
  videoSrc: string;
  posterSrc?: string;
  eyebrow: string;
  title: string;
  description: string;
  secondaryText?: string;
  microText?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align: SceneAlign;
  theme: SceneTheme;
  /** Scroll distance (px) the scene is pinned for. Higher = slower scrub. */
  scrollLength: number;
  isLoop?: boolean;
  hideStickyCta?: boolean;
  /** This clip continues the previous clip's copy — text stays on screen, no re-animation. */
  continueText?: boolean;
}

/**
 * Video scenes BEFORE the infrastructure block (01–06).
 * The white infrastructure block is injected after scene 06.
 */
export const scenesBeforeInfra: Scene[] = [
  {
    id: "scene-01",
    videoSrc: "/videos/01-orbit-facade.mp4",
    posterSrc: "/posters/01.jpg",
    eyebrow: "ASG Towers",
    title: "Город в городе.\nДом, из которого не хочется выходить.",
    description:
      "Квартиры, офисы, отель, коммерция и инфраструктура у реки Кура — в одном комплексе.",
    microText: "Тбилиси · первая линия у реки",
    ctaLabel: "Выбрать планировку",
    align: "bottom",
    theme: "dark",
    scrollLength: 2400,
  },
  {
    id: "scene-02",
    videoSrc: "/videos/02-fly-to-corner.mp4",
    posterSrc: "/posters/02.jpg",
    eyebrow: "Жилая башня",
    title: "Снаружи — две башни. Внутри — целая жизнь.",
    description:
      "Здесь каждый уровень создан для вас: жильё, сервисы, работа, отдых и люди соединены в одном месте.",
    ctaLabel: "Смотреть квартиры",
    align: "bottom",
    theme: "dark",
    scrollLength: 2200,
  },
  {
    id: "scene-03",
    videoSrc: "/videos/03-enter-apartment-window.mp4",
    posterSrc: "/posters/03.jpg",
    eyebrow: "Внутри жилой башни",
    title: "Квартира — это только начало.",
    description:
      "Она идеальна как для жизни, так и для получения пассивного дохода. Но ценность этой квартиры продолжается далеко за её пределами.",
    ctaLabel: "Получить подборку квартир",
    align: "bottom",
    theme: "dark",
    scrollLength: 2200,
  },
  {
    id: "scene-04",
    videoSrc: "/videos/04-apartment-to-elevator-door.mp4",
    posterSrc: "/posters/04.jpg",
    // Continues scene 03 — same copy stays on screen through the fly-through.
    eyebrow: "Внутри жилой башни",
    title: "Квартира — это только начало.",
    description:
      "Она идеальна как для жизни, так и для получения пассивного дохода. Но ценность этой квартиры продолжается далеко за её пределами.",
    ctaLabel: "Получить подборку квартир",
    align: "bottom",
    theme: "dark",
    scrollLength: 2600,
    continueText: true,
  },
  {
    id: "scene-05",
    videoSrc: "/videos/05-enter-elevator.mp4",
    posterSrc: "/posters/05.jpg",
    eyebrow: "От квартиры — к жизни внутри дома",
    title: "Одна кнопка — и ты уже не просто дома.",
    description:
      "Ниже начинается то, ради чего обычно приходится ехать через весь город.",
    ctaLabel: "Что внутри комплекса",
    align: "center",
    theme: "dark",
    scrollLength: 1800,
  },
  {
    id: "scene-06",
    videoSrc: "/videos/06-elevator-to-white.mp4",
    posterSrc: "/posters/06.jpg",
    eyebrow: "Инфраструктура",
    title: "Выходить можно. Просто уже не обязательно.",
    description: "Потому что в вашем доме есть всё:",
    ctaLabel: "Листать инфраструктуру",
    align: "center",
    theme: "light-transition",
    scrollLength: 1800,
  },
];

/**
 * Video scenes AFTER the infrastructure block (07–14).
 */
export const scenesAfterInfra: Scene[] = [
  {
    id: "scene-07",
    videoSrc: "/videos/07-elevator-to-residential-lobby.mp4",
    posterSrc: "/posters/07.jpg",
    eyebrow: "Лобби жилой башни",
    title: "Кура — не где-то рядом. Она прямо перед домом.",
    description: "Между комплексом и рекой — только дорога.",
    ctaLabel: "Смотреть дальше",
    align: "bottom",
    theme: "dark",
    scrollLength: 2200,
  },
  {
    id: "scene-08",
    videoSrc: "/videos/08-lobby-to-street.mp4",
    posterSrc: "/posters/08.jpg",
    // Continues scene 07.
    eyebrow: "Лобби жилой башни",
    title: "Кура — не где-то рядом. Она прямо перед домом.",
    description: "Между комплексом и рекой — только дорога.",
    ctaLabel: "Смотреть дальше",
    align: "bottom",
    theme: "dark",
    scrollLength: 2400,
    continueText: true,
  },
  {
    id: "scene-09",
    videoSrc: "/videos/09-turn-to-second-tower.mp4",
    posterSrc: "/posters/09.jpg",
    eyebrow: "Вторая башня",
    title: "А ведь это была только первая башня.",
    description:
      "Офисы и отель во второй башне — идеальное место для вас и ваших гостей.",
    ctaLabel: "Войти во вторую башню",
    align: "bottom",
    theme: "dark",
    scrollLength: 2400,
  },
  {
    id: "scene-10",
    videoSrc: "/videos/10-enter-second-tower.mp4",
    posterSrc: "/posters/10.jpg",
    eyebrow: "Отель и офисы",
    title: "Это не жилой дом, который засыпает днём.",
    description:
      "Здесь работают, встречаются, приезжают, остаются, возвращаются и пользуются сервисами.",
    ctaLabel: "Смотреть офисы",
    align: "bottom",
    theme: "dark",
    scrollLength: 2200,
  },
  {
    id: "scene-11",
    videoSrc: "/videos/11-elevator-office-view.mp4",
    posterSrc: "/posters/11.jpg",
    eyebrow: "Офисные этажи",
    title: "Офисы дают комплексу дневной ритм.",
    description:
      "Здание живёт весь день: сотрудники, клиенты, встречи, кофе, обеды и сервисы.",
    ctaLabel: "Узнать об офисах",
    align: "bottom",
    theme: "dark",
    scrollLength: 2400,
  },
  {
    id: "scene-12",
    videoSrc: "/videos/12-elevator-to-hotel-lobby.mp4",
    posterSrc: "/posters/12.jpg",
    eyebrow: "Гостиничная часть",
    title: "Отель приводит в комплекс новых людей каждый день.",
    description:
      "Гости приезжают ненадолго, но создают постоянный спрос на всё, что находится внизу.",
    ctaLabel: "Смотреть номер",
    align: "bottom",
    theme: "dark",
    scrollLength: 2400,
  },
  {
    id: "scene-13",
    videoSrc: "/videos/13-hotel-room-door.mp4",
    posterSrc: "/posters/13.jpg",
    // Continues scene 12.
    eyebrow: "Гостиничная часть",
    title: "Отель приводит в комплекс новых людей каждый день.",
    description:
      "Гости приезжают ненадолго, но создают постоянный спрос на всё, что находится внизу.",
    ctaLabel: "Смотреть номер",
    align: "bottom",
    theme: "dark",
    scrollLength: 2200,
    continueText: true,
  },
  {
    id: "scene-14",
    videoSrc: "/videos/14-hotel-room-to-window.mp4",
    posterSrc: "/posters/14.jpg",
    eyebrow: "Вид из второй башни",
    title: "С высоты становится понятно главное.",
    description:
      "ASG Towers — это не набор помещений. Это место, где разные сценарии жизни усиливают друг друга.",
    ctaLabel: "Перейти к выбору",
    align: "bottom",
    theme: "dark",
    scrollLength: 2800,
  },
];

/** Final looped river scene used as background of the closing CTA. */
export const finalScene = {
  id: "scene-15",
  videoSrc: "/videos/15-river-loop.mp4",
  posterSrc: "/posters/15.jpg",
  eyebrow: "",
  title: "С видом на реку, выбирать приятнее:",
  useCases: [
    "Квартира для жизни",
    "Квартира под аренду",
    "Офис для команды",
    "Коммерция для бизнеса",
    "Паркинг для удобства",
  ],
  primaryCta: "Выбрать планировку",
  secondaryCta: "Связаться с менеджером",
  thirdCta: "Расчёт доходности",
};
