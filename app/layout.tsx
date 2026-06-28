import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASG Towers — квартиры, офисы и коммерция у реки Кура в Тбилиси",
  description:
    "ASG Towers — комплекс с жилой башней, офисами, отелем, коммерцией, инфраструктурой и паркингом у реки Кура. Выберите квартиру, офис или коммерческое помещение.",
  openGraph: {
    title: "ASG Towers",
    description:
      "Вертикальный город у Куры: квартиры, офисы, отель, коммерция и инфраструктура в одном комплексе.",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASG Towers",
    description:
      "Вертикальный город у Куры: квартиры, офисы, отель, коммерция и инфраструктура в одном комплексе.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050505",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
