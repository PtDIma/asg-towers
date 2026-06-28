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
  metadataBase: new URL("https://towers.asggroup.io"),
  title: "ASG Towers — квартиры, офисы и коммерция у реки Кура в Тбилиси",
  description:
    "ASG Towers — комплекс с жилой башней, офисами, отелем, коммерцией, инфраструктурой и паркингом у реки Кура. Выберите квартиру, офис или коммерческое помещение.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ASG Towers — вертикальный город у реки Кура",
    description:
      "Вертикальный город у Куры: квартиры, офисы, отель, коммерция и инфраструктура в одном комплексе.",
    url: "/",
    siteName: "ASG Towers",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "ASG Towers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASG Towers — вертикальный город у реки Кура",
    description:
      "Вертикальный город у Куры: квартиры, офисы, отель, коммерция и инфраструктура в одном комплексе.",
    images: ["/og.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ResidentialComplex",
  name: "ASG Towers",
  description:
    "Комплекс с жилой башней, офисами, отелем, коммерцией, инфраструктурой и паркингом у реки Кура в Тбилиси.",
  url: "https://towers.asggroup.io",
  image: "https://towers.asggroup.io/og.jpg",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Тбилиси",
    addressCountry: "GE",
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
