import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { GUIDES, formatGuideDate } from "@/lib/guides";
import { SITE_URL, safeJsonLd, siteMetadata, webPageJsonLd } from "@/lib/seo";
import styles from "./guides.module.css";

const title = "업무 자동화·AI 활용 가이드 · 견적 준비와 첫 실습";
const description = "엑셀 자동화 견적 전에 정할 범위와 AI 초보자의 첫 실습을 안내합니다. 체크리스트, 비교표와 질문 예문으로 상담과 학습을 준비해 보세요.";
export const metadata = siteMetadata({ title, description, path: "/guides" });

export default function GuidesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPageJsonLd({ title, description, path: "/guides" }),
        "@type": "CollectionPage",
        breadcrumb: { "@id": `${SITE_URL}/guides#breadcrumb` },
        mainEntity: { "@id": `${SITE_URL}/guides#guides` },
      },
      { "@type": "BreadcrumbList", "@id": `${SITE_URL}/guides#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "활용 가이드", item: `${SITE_URL}/guides` },
      ] },
      { "@type": "ItemList", "@id": `${SITE_URL}/guides#guides`, numberOfItems: GUIDES.length, itemListElement: GUIDES.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, url: `${SITE_URL}/guides/${guide.slug}` })) },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    <SiteHeader />
    <main id="main" className={styles.page}>
      <section className={`section-wrap ${styles.indexHero}`}>
        <p className={styles.kicker}>워크오토 활용 가이드</p>
        <h1>시작하기 전에,<br /><span>함께 정리해 볼 것들.</span></h1>
        <p className={styles.indexLead}>자동화를 의뢰할 때 필요한 준비부터<br />AI로 처음 만들어 보는 작은 결과물까지.<br />내 일에 바로 적용할 수 있는 순서로 안내합니다.</p>
      </section>
      <section className={`section-wrap ${styles.indexList}`} aria-labelledby="guides-title">
        <h2 id="guides-title" className={styles.listHeading}>업무 자동화와 AI, 한 걸음씩.</h2>
        <div className={styles.cards}>{GUIDES.map(guide => <article className={styles.card} key={guide.slug}>
          <p className={styles.kicker}>{guide.category}</p>
          <h3><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h3>
          <p className={styles.cardDescription}>{guide.description}</p>
          <div className={styles.cardBottom}><time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time><Link href={`/guides/${guide.slug}`} aria-label={`${guide.title} 읽기`}>가이드 읽기<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </article>)}</div>
      </section>
      <section className={`section-wrap ${styles.indexNext}`} aria-labelledby="next-title">
        <div><h2 id="next-title">필요한 다음 단계로.</h2><p>자동화할 업무가 있거나 AI를 직접 배워보고 싶다면<br />제공 범위와 커리큘럼을 먼저 살펴보세요.</p></div>
        <div className={styles.nextLinks}><Link href="/services">업종별 업무 자동화<ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/education">AI 기초·활용 교육<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
