import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { CASE_STUDIES, findCaseStudy } from "@/lib/case-studies";
import { SITE_URL, safeJsonLd, siteMetadata, webPageJsonLd } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import CaseDiagram from "../CaseDiagram";
import "../cases.css";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASE_STUDIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const study = findCaseStudy((await params).slug);
  if (!study) return { title: "개발 경험을 찾을 수 없습니다", robots: { index: false, follow: false } };
  return siteMetadata({ title: `${study.title} 개발 경험`, description: study.description, path: `/cases/${study.slug}` });
}

export default async function CaseDetailPage({ params }: PageProps) {
  const study = findCaseStudy((await params).slug);
  if (!study) notFound();
  const url = `${SITE_URL}/cases/${study.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { ...webPageJsonLd({ title: `${study.title} 개발 경험`, description: study.description, path: `/cases/${study.slug}` }), breadcrumb: { "@id": `${url}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "개발 경험", item: `${SITE_URL}/cases` },
        { "@type": "ListItem", position: 3, name: study.title, item: url },
      ] },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    <SiteHeader />
    <main id="main" className="cases-page case-detail-page">
      <section className="section-wrap case-detail-intro">
        <nav className="case-breadcrumb" aria-label="현재 위치"><Link href="/">홈</Link><ChevronRight size={13} aria-hidden="true" /><Link href="/cases">개발 경험</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{study.category}</span></nav>
        <p className="case-kicker">{study.category} · 실제 개발 경험</p>
        <h1>{study.headline.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1>
        <p className="case-detail-description">{study.description}</p>
        <dl className="case-facts"><div><dt>기간</dt><dd>{study.period}</dd></div><div><dt>담당 역할</dt><dd>{study.role}</dd></div></dl>
        <ul className="case-tech-list" aria-label="사용 기술">{study.technologies.map(item => <li key={item}>{item}</li>)}</ul>
      </section>
      <div className="section-wrap case-detail-layout">
        <article className="case-detail-content" aria-label={study.title}>
          <section className="case-editorial-section"><p className="case-kicker">다룬 업무</p><h2>{study.title}</h2><p>{study.context}</p></section>
          <CaseDiagram study={study} />
          <section className="case-editorial-section case-implementation-section" aria-labelledby="implementation-title"><p className="case-kicker">직접 구현한 내용</p><h2 id="implementation-title">화면에서 운영까지.</h2><ol className="case-implementations">{study.implementations.map((item, index) => <li key={item.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol></section>
          <section className="case-result"><p className="case-kicker">구현 결과</p><h2>연결한 범위</h2><p>{study.result}</p></section>
          <p className="cases-source-note case-detail-source">운영자의 경력기술서를 바탕으로 정리했습니다. 회사명과 고객 정보는 공개하지 않으며, 경력 중 수행한 개발 경험과 워크오토의 고객 도입 사례는 구분합니다.</p>
          <section className="case-application" aria-labelledby="application-title"><span className="case-application-label">새 업무에 적용한다면 · 상담 예시</span><h2 id="application-title">{study.application.title}</h2><p>{study.application.description}</p><ul>{study.application.checks.map(item => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul><Link className="text-link" href={`/services/${study.serviceSlug}`}>{study.serviceLabel} 살펴보기<ArrowUpRight size={16} aria-hidden="true" /></Link></section>
        </article>
        <aside className="case-consultation" aria-label="관련 업무 상담"><p className="case-kicker">비슷한 업무가 있나요?</p><h2>{study.serviceLabel}<br />상담으로 이어가세요.</h2><p>지금 사용하는 도구와<br />반복하는 일부터 알려주세요.</p><div className="case-consultation-price"><span>첫 상담</span><strong>0원</strong></div><Link className="button button-dark" href={`/consultation?service=${study.serviceSlug}`}>이 업무로 무료 상담 신청<ArrowUpRight size={16} aria-hidden="true" /></Link><small>개발 비용은 상담 후 별도 안내합니다.</small></aside>
      </div>
      <section className="section-wrap case-related" aria-labelledby="case-related-title"><h2 id="case-related-title">다른 개발 경험도 살펴보세요.</h2><div>{CASE_STUDIES.filter(item => item.slug !== study.slug).map(item => <Link key={item.slug} href={`/cases/${item.slug}`}><span>{item.category}</span><h3>{item.title}<ArrowUpRight size={18} aria-hidden="true" /></h3><p>{item.description}</p></Link>)}</div><Link className="text-link case-back-link" href="/cases">전체 개발 경험 보기<ChevronRight size={16} aria-hidden="true" /></Link></section>
    </main>
    <SiteFooter />
  </>;
}
