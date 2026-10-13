import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL, siteMetadata, safeJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";
import { CommunityAuthProvider } from "./components/CommunityAuth";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...siteMetadata({ title: `${BRAND_NAME} | 업무 자동화 · AI 개발·교육`, description: `${BRAND_NAME}는 엑셀·회계, 제조 ERP, 학원·병원·쇼핑몰 업무 자동화와 AI 개발을 제공합니다. AI를 배우고 싶은 누구나 기초부터 생활·업무 활용까지 실습하며 배울 수 있습니다. 첫 상담은 무료이며 개발비·교육비는 별도 안내합니다.`, path: "/" }),
  robots: { index: true, follow: true },
  verification: { other: { "naver-site-verification": "f844a5bbbbddb350bc25d6db93351850cf613e33" } },
  icons: { icon: "/favicon.svg?v=workauto", shortcut: "/favicon.svg?v=workauto" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}/><CommunityAuthProvider>{children}</CommunityAuthProvider></body></html>;
}
