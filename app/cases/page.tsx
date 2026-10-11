import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { CASE_STUDIES } from "@/lib/case-studies";
import { SITE_URL, safeJsonLd, siteMetadata, webPageJsonLd } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import CaseDiagram from "./CaseDiagram";
import "./cases.css";

const title = "자동화 개발 경험 · 제조·교육·AI 에이전트";
const description = "워크오토 운영자의 실제 개발 경험을 살펴보세요. 스마트팩토리 실시간 대시보드, 디자인 자동화와 학습 시스템, AI 에이전트·내부 문서 검색의 구현 범위를 회사명 없이 소개합니다.";

export const metadata = siteMetadata({ title, description, path: "/cases" });

export default function CasesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { ...webPageJsonLd({ title, description, path: "/cases" }), "@type": "CollectionPage", breadcrumb: { "@id": `${SITE_URL}/cases#breadcrumb` }, mainEntity: { "@id": `${SITE_URL}/cases#experiences` } },
      { "@type": "BreadcrumbList", "@id": `${SITE_URL}/cases#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "개발 경험", item: `${SITE_URL}/cases` },
      ] },
      { "@type": "ItemList", "@id": `${SITE_URL}/cases#experiences`, numberOfItems: CASE_STUDIES.length, itemListElement: CASE_STUDIES.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: `${SITE_URL}/cases/${item.slug}` })) },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    <SiteHeader />
    <main id="main" className="cases-page">
      <section className="section-wrap cases-intro">
        <p className="case-kicker">직접 개발한 경험</p>
        <h1>경험에서 시작하는,<br /><span>업무 자동화.</span></h1>
        <p className="cases-intro-description">현장의 데이터를 화면에 연결하고,<br />반복되는 작업을 도구와 시스템으로 바꿔왔습니다.</p>
        <p className="cases-source-note">운영자의 경력기술서에 기재된 개발 경험입니다. 회사명과 고객 정보는 제외했으며, 워크오토의 고객 도입 사례와는 구분합니다.</p>
      </section>
      <section className="section-wrap cases-list" aria-labelledby="cases-title">
        <div className="cases-section-heading"><h2 id="cases-title">다룬 업무와 만든 것.</h2><span>세 가지 개발 경험</span></div>
        <div className="case-card-grid">
          {CASE_STUDIES.map(item => <article className="case-card" key={item.slug}>
            <div className="case-card-top"><p className="case-kicker">{item.category}</p><h3><Link href={`/cases/${item.slug}`}>{item.title}</Link></h3><p>{item.description}</p></div>
            <CaseDiagram study={item} compact />
            <div className="case-card-bottom"><span>{item.period}</span><Link href={`/cases/${item.slug}`} aria-label={`${item.title} 자세히 보기`}>개발 내용 보기<ChevronRight size={16} aria-hidden="true" /></Link></div>
          </article>)}
        </div>
        <p className="cases-figure-note">도식은 구현 범위를 설명하기 위한 구성 설명입니다. 실제 제품 화면이나 고객 데이터가 아닙니다.</p>
      </section>
      <section className="section-wrap cases-invitation">
        <div><p className="case-kicker">이제, 지금 하는 일로.</p><h2>비슷한 고민이 있다면<br />함께 살펴보겠습니다.</h2><p>사용하는 프로그램과 반복하는 일을 알려주세요.<br />작게 시작할 수 있는 자동화부터 찾습니다.</p></div>
        <div><Link className="button button-dark" href="/consultation">내 업무로 무료 상담 신청<ArrowUpRight size={17} aria-hidden="true" /></Link><span>첫 상담 0원 · 개발 비용은 상담 후 별도 안내</span></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
