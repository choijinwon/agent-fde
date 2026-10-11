import type { Metadata } from "next";
import { BRAND_NAME, BRAND_ENGLISH_NAME, BRAND_TAGLINE } from "./brand";

// Keep canonical URLs stable across local, preview, and production builds.
export const SITE_URL = "https://workauto.co.kr";

export function siteMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const fullTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: fullTitle, description, url: `${SITE_URL}${path}`, siteName: `${BRAND_NAME} | ${BRAND_ENGLISH_NAME}`,
      locale: "ko_KR", type: "website",
      images: [{ url: `${SITE_URL}/workauto-og.png`, width: 1200, height: 630, alt: `${BRAND_NAME} · ${BRAND_TAGLINE}` }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [`${SITE_URL}/workauto-og.png`] },
  };
}

export function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "최진원", url: SITE_URL, jobTitle: "업무 자동화 · AI 엔지니어", email: "abyys1004@naver.com", knowsAbout: ["업무 자동화", "AI 에이전트", "스마트팩토리", "ERP 연동", "웹 서비스 개발"] },
    { "@type": "Brand", "@id": `${SITE_URL}/#brand`, name: BRAND_NAME, alternateName: BRAND_ENGLISH_NAME, slogan: BRAND_TAGLINE, url: SITE_URL, logo: `${SITE_URL}/favicon.svg` },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: BRAND_NAME, alternateName: BRAND_ENGLISH_NAME, description: `${BRAND_NAME}의 업종별 업무 자동화와 AI 개발 서비스`, url: SITE_URL, inLanguage: "ko-KR", about: { "@id": `${SITE_URL}/#brand` }, publisher: { "@id": `${SITE_URL}/#person` } },
  ],
};

export function serviceJsonLd(item: { slug: string; title: string; service: string; description: string }) {
  const url = `${SITE_URL}/services/${item.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", "@id": `${url}#service`, name: item.service, serviceType: item.service, description: item.description, url, brand: { "@id": `${SITE_URL}/#brand` }, provider: { "@id": `${SITE_URL}/#person` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "업종별 업무 자동화", item: `${SITE_URL}/services` },
        { "@type": "ListItem", position: 3, name: item.title, item: url },
      ] },
    ],
  };
}
