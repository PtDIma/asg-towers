import type { InfraIconId } from "@/components/infraIcons";

export interface InfraItem {
  number: string;
  icon: InfraIconId;
  image: string;
  title: string;
  description: string;
}

export const infraIntro = {
  eyebrow: "Внутри комплекса",
  title: "Двери открываются — город уже внутри.",
};

// Full-screen vertical renders (lie in /public/images/infra/*.webp).
// Shown one by one inside the opened elevator doorway.
export const infraItems: InfraItem[] = [
  {
    number: "01",
    icon: "cart",
    image: "/images/infra/supermarket.webp",
    title: "Супермаркет",
    description: "Всё нужное для дома — просто спуститься на лифте.",
  },
  {
    number: "02",
    icon: "coffee",
    image: "/images/infra/coffee.webp",
    title: "Кофейня",
    description: "Утро начинается не с дороги, а с хорошего кофе внизу.",
  },
  {
    number: "03",
    icon: "dumbbell",
    image: "/images/infra/fitness.webp",
    title: "Фитнес",
    description: "Тренировка рядом — без пробок, отговорок и лишних поездок.",
  },
  {
    number: "04",
    icon: "waves",
    image: "/images/infra/pool-spa.webp",
    title: "Бассейн и спа",
    description: "Восстановление после дня — прямо внутри вашего дома.",
  },
  {
    number: "05",
    icon: "balloon",
    image: "/images/infra/kids.webp",
    title: "Детская комната",
    description: "У детей своё пространство для игр, у родителей — больше свободы.",
  },
  {
    number: "06",
    icon: "cross",
    image: "/images/infra/pharmacy.webp",
    title: "Аптека",
    description: "Когда важно быстро — всё необходимое рядом.",
  },
  {
    number: "07",
    icon: "scissors",
    image: "/images/infra/beauty.webp",
    title: "Салон красоты",
    description: "Привести себя в порядок можно, не выходя из комплекса.",
  },
  {
    number: "08",
    icon: "washer",
    image: "/images/infra/laundry.webp",
    title: "Химчистка",
    description: "Чистые вещи без лишней логистики и потерянного времени.",
  },
  {
    number: "09",
    icon: "parking",
    image: "/images/infra/parking.webp",
    title: "Паркинг и кладовые",
    description: "Машина и вещи — в безопасности, порядок — дома.",
  },
];

export const infraClosing = {
  ctaLabel: "Продолжить маршрут",
};
