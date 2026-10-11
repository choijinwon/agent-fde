import type { Metadata } from "next";
import { SITE_URL, siteMetadata, safeJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...siteMetadata({ title: "업무 자동화 · AI 개발 | 최진원", description: "학원·병원, 제조 ERP, 엑셀·회계, 쇼핑몰·유통 등 업종별 업무 자동화를 만듭니다. 2006년부터 쌓은 개발 경험으로 업무 분석부터 운영까지 함께합니다. 첫 상담은 무료입니다.", path: "/" }),
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}/>{children}</body></html>;
}
