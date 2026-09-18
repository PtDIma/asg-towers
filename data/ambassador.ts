/**
 * Амбассадор проекта.
 *
 * Цитата — реальная, из авторского текста самого игрока в The Players' Tribune
 * («I bring always with me Georgia. All the people»). Она про Грузию, не про
 * комплекс, поэтому источник подписан рядом: читатель должен видеть, что это
 * слова о родине, а не рекламная реплика о ЖК. Если по договору появится
 * согласованная фраза именно о проекте — меняем quote и убираем quoteSource.
 */

export interface Ambassador {
  eyebrow: string;
  name: string;
  /** Фактическая справка. Только текст: клубная символика правами не покрыта. */
  role: string;
  quote: string;
  /** Откуда цитата. undefined — значит фраза согласована застройщиком напрямую. */
  quoteSource?: string;
  /** Реплика от лица проекта — отделена от слов игрока. */
  note: string;
  photo: string;
  photoAlt: string;
}

export const ambassador: Ambassador = {
  eyebrow: "Амбассадор проекта",
  name: "Хвича Кварацхелия",
  role: "Футболист сборной Грузии. Родился в Тбилиси в 2001 году.",
  quote: "Я всегда беру Грузию с собой. Всех её людей.",
  quoteSource: "The Players’ Tribune",
  note:
    "Тбилисец, который играет в Европе и возвращается домой. ASG Towers — про тот же город: место, в которое хочется возвращаться.",
  photo: "/images/ambassador/khvicha-avatar.webp",
  photoAlt: "Хвича Кварацхелия — амбассадор проекта ASG Towers",
};
