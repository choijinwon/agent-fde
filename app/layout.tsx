import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { SITE_URL, siteMetadata, safeJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...siteMetadata({ title: `${BRAND_NAME} | 업무 자동화 · AI 개발`, description: `${BRAND_NAME}. ${BRAND_TAGLINE} 학원·병원, 제조 ERP, 엑셀·회계, 쇼핑몰 등 업종별 업무 자동화와 AI 개발을 제공합니다. 첫 상담은 무료입니다.`, path: "/" }),
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg?v=workauto", shortcut: "/favicon.svg?v=workauto" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}/>{children}</body></html>;
}
