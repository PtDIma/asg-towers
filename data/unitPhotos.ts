/**
 * Фото интерьеров по планировкам: /images/photos/<план>-<n>.webp, n с 1.
 * Источник — Plan/Renders: «A_4-7_6:3.jpeg» (в Finder «A_4-7_6/3») = третье фото;
 * файл без номера идёт первым.
 */
export const unitPhotoCount: Record<string, number> = {
  "A_1-3_8": 3,
  "A_1-3_9": 2,
  "A_4-7_1": 4,
  "A_4-7_2": 4,
  "A_4-7_3": 1,
  "A_4-7_4": 1,
  "A_4-7_6": 3,
  "A_4-7_7": 4,
  "A_4-7_8": 3,
};

export const unitPhotos = (plan: string) =>
  Array.from({ length: unitPhotoCount[plan] ?? 0 }, (_, i) => `/images/photos/${plan}-${i + 1}.webp`);
