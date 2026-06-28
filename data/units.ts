export type UnitType = "apartment" | "office" | "commercial" | "parking";
export type UnitStatus = "Свободно" | "Бронь" | "Продано";

export interface Unit {
  id: string;
  type: UnitType;
  title: string;
  floor: string;
  area: string;
  view: string;
  price: string;
  status: UnitStatus;
  yield?: string;
  cta: string;
}

export interface PlansTab {
  key: UnitType;
  label: string;
}

export const plansTabs: PlansTab[] = [
  { key: "apartment", label: "Квартиры" },
  { key: "office", label: "Офисы" },
  { key: "commercial", label: "Коммерция" },
  { key: "parking", label: "Паркинг" },
];

// TODO: подключить Google Sheets как источник данных
// TODO: заменить mock data на реальные объекты
// TODO: добавить настоящую шахматку (этаж × стояк) с фильтрами
export const units: Unit[] = [
  // ── Квартиры ───────────────────────────────────────────────
  {
    id: "A-1204",
    type: "apartment",
    title: "A-1204",
    floor: "12 этаж",
    area: "52.4 м²",
    view: "Вид на Куру",
    price: "$86 500",
    status: "Свободно",
    yield: "до 8.5% годовых",
    cta: "Получить расчет",
  },
  {
    id: "A-1507",
    type: "apartment",
    title: "A-1507",
    floor: "15 этаж",
    area: "68.2 м²",
    view: "Город + река",
    price: "$119 000",
    status: "Свободно",
    yield: "до 8.2% годовых",
    cta: "Получить расчет",
  },
  {
    id: "A-0903",
    type: "apartment",
    title: "A-0903",
    floor: "9 этаж",
    area: "41.8 м²",
    view: "Город",
    price: "$66 900",
    status: "Бронь",
    yield: "до 7.9% годовых",
    cta: "Получить расчет",
  },
  // ── Офисы ──────────────────────────────────────────────────
  {
    id: "B-0501",
    type: "office",
    title: "B-0501",
    floor: "5 этаж",
    area: "124 м²",
    view: "Город",
    price: "$198 000",
    status: "Свободно",
    cta: "Узнать об офисе",
  },
  {
    id: "B-0702",
    type: "office",
    title: "B-0702",
    floor: "7 этаж",
    area: "210 м²",
    view: "Город + река",
    price: "$346 000",
    status: "Свободно",
    cta: "Узнать об офисе",
  },
  // ── Коммерция ──────────────────────────────────────────────
  {
    id: "C-101",
    type: "commercial",
    title: "C-101",
    floor: "1 этаж",
    area: "74 м²",
    view: "Фасадный вход",
    price: "$185 000",
    status: "Свободно",
    cta: "Узнать о помещении",
  },
  {
    id: "C-204",
    type: "commercial",
    title: "C-204",
    floor: "2 этаж",
    area: "132 м²",
    view: "Торговая галерея",
    price: "$290 000",
    status: "Свободно",
    cta: "Узнать о помещении",
  },
  // ── Паркинг ────────────────────────────────────────────────
  {
    id: "P-034",
    type: "parking",
    title: "P-034",
    floor: "-1 уровень",
    area: "Паркоместо",
    view: "Крытый паркинг",
    price: "$18 000",
    status: "Свободно",
    cta: "Забронировать",
  },
  {
    id: "P-112",
    type: "parking",
    title: "P-112",
    floor: "-2 уровень",
    area: "Паркоместо",
    view: "Крытый паркинг",
    price: "$16 500",
    status: "Свободно",
    cta: "Забронировать",
  },
];
