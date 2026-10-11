import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { SITE_URL, siteMetadata, safeJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";
import { CommunityAuthProvider } from "./components/CommunityAuth";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...siteMetadata({ title: `${BRAND_NAME} | 엑셀·ERP 업무 자동화 · AI 개발`, description: `${BRAND_NAME}는 엑셀·회계 정리, 제조 ERP 연동, 학원·병원·쇼핑몰 운영 업무를 자동화합니다. 기존 도구와 AI 에이전트를 연결하고 업무 분석부터 개발·배포·운영까지 함께합니다. 첫 상담은 무료이며 개발 비용은 별도 안내합니다.`, path: "/" }),
  robots: { index: true, follow: true },
  verification: { other: { "naver-site-verification": "f844a5bbbbddb350bc25d6db93351850cf613e33" } },
  icons: { icon: "/favicon.svg?v=workauto", shortcut: "/favicon.svg?v=workauto" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" data-scroll-behavior="smooth"><body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}/><CommunityAuthProvider>{children}</CommunityAuthProvider></body></html>;
}
