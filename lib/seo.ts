import type { Metadata } from "next";

export const SITE_URL = "https://forward-field-studio.abyys9114.chatgpt.site";

export function siteMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const fullTitle = title.includes("최진원") ? title : `${title} | 최진원`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: fullTitle, description, url: `${SITE_URL}${path}`, siteName: "최진원 · 업무 자동화",
      locale: "ko_KR", type: "website",
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "최진원 · 업무 자동화와 AI 개발" }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [`${SITE_URL}/og.png`] },
  };
}

export function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "최진원", url: SITE_URL, jobTitle: "업무 자동화 · AI 엔지니어", email: "abyys1004@naver.com", knowsAbout: ["업무 자동화", "AI 에이전트", "스마트팩토리", "ERP 연동", "웹 서비스 개발"] },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "최진원 · 업무 자동화", url: SITE_URL, inLanguage: "ko-KR", publisher: { "@id": `${SITE_URL}/#person` } },
  ],
};

export function serviceJsonLd(item: { slug: string; title: string; service: string; description: string }) {
  const url = `${SITE_URL}/services/${item.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", "@id": `${url}#service`, name: item.service, serviceType: item.service, description: item.description, url, provider: { "@id": `${SITE_URL}/#person` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "업종별 업무 자동화", item: `${SITE_URL}/services` },
        { "@type": "ListItem", position: 3, name: item.title, item: url },
      ] },
    ],
  };
}
