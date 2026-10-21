import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { SERVICE_CATALOG, findServiceBySlug } from "@/lib/service-catalog";
import { CASE_STUDIES } from "@/lib/case-studies";
import { SERVICE_GUIDES } from "@/lib/service-guides";
import { siteMetadata, serviceJsonLd, safeJsonLd } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "../../components/SiteChrome";
import "../services.css";

type DetailPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICE_CATALOG.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: DetailPageProps) {
  const offering = findServiceBySlug((await params).slug);
  if (!offering) return { title: `서비스를 찾을 수 없습니다 | ${BRAND_NAME}` };
  return siteMetadata({ title: offering.seoTitle, description: offering.seoDescription, path: `/services/${offering.slug}` });
}

export default async function ServiceDetailPage({ params }: DetailPageProps) {
  const offering = findServiceBySlug((await params).slug);
  if (!offering) notFound();
  const guide = SERVICE_GUIDES[offering.slug];
  const relatedServices = guide.relatedSlugs.map(slug => findServiceBySlug(slug)).filter(item => item !== undefined);
  const relatedCases = CASE_STUDIES.filter(item => item.serviceSlug === offering.slug);
  const applicationHref = `/consultation?service=${offering.slug}`;

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceJsonLd(offering)) }}/><SiteHeader />
    <main id="main" className="industry-page industry-detail-page">
      <section className="section-wrap industry-detail-hero">
        <nav className="industry-breadcrumb" aria-label="현재 위치"><Link href="/">홈</Link><span aria-hidden="true">/</span><Link href="/services">업종별 자동화</Link><span aria-hidden="true">/</span><span aria-current="page">{offering.title}</span></nav>
        <p className="industry-kicker">{offering.title}의 일하는 방식에 맞게</p>
        <h1>{offering.service}</h1>
        <p className="industry-detail-description">{offering.description}</p>
      </section>

      <div className="section-wrap industry-detail-layout">
        <div className="industry-detail-content">
          <section className="industry-problem" aria-labelledby="problem-title">
            <h2 id="problem-title">{guide.problem.title}</h2>
            <p>{guide.problem.description}</p>
          </section>
          <section className="industry-task-section" aria-labelledby="possible-tasks-title">
            <div className="industry-section-top"><h2 id="possible-tasks-title">이런 업무를 연결할 수 있습니다.</h2><span>적용 예시</span></div>
            <ol className="industry-task-list">{offering.tasks.map((task, index) => <li key={task}><span aria-hidden="true">0{index + 1}</span><h3>{task}</h3></li>)}</ol>
          </section>

          <section className="industry-flow-section" aria-labelledby="workflow-title">
            <p className="industry-kicker">쓰던 자료에서, 필요한 결과로</p>
            <h2 id="workflow-title">{guide.workflow.title}</h2>
            <div className="industry-flow">
              <div className="industry-flow-step"><span className="industry-flow-label">01 · 자료 모으기</span><h3>지금 사용하는 자료</h3><p>{guide.workflow.input}</p><ul>{offering.inputs.map(input => <li key={input}>{input}</li>)}</ul></div>
              <div className="industry-flow-arrow" aria-hidden="true"><ArrowDown size={20} strokeWidth={1.3} /></div>
              <div className="industry-flow-step industry-flow-middle"><span className="industry-flow-label">02 · 기준 연결하기</span><h3>업무 규칙에 맞춰 정리</h3><p>{guide.workflow.rules}</p></div>
              <div className="industry-flow-arrow" aria-hidden="true"><ArrowDown size={20} strokeWidth={1.3} /></div>
              <div className="industry-flow-step"><span className="industry-flow-label">03 · 확인하고 활용하기</span><h3>검토할 수 있는 결과물</h3><p>{guide.workflow.output}</p></div>
            </div>
            <p className="industry-examples-note">위 흐름은 구성 예시입니다. 상세 단계와 결과물은 상담에서 함께 정합니다.</p>
          </section>

          <section className="industry-review-section" aria-labelledby="review-title"><span aria-hidden="true"><Check size={21} strokeWidth={1.4} /></span><div><h2 id="review-title">함께 확인할 부분</h2><p>{offering.reviewNote}</p></div></section>
          <section className="industry-preparation"><h2>상담 전에 준비하면 좋은 것</h2><p>가장 자주 반복하는 작업, 사용 중인 프로그램, 원하는 결과를 알려주세요. 자료를 미리 정리하지 않아도 현재의 업무 방식부터 설명해 주시면 됩니다.</p><Link href="/services" className="text-link">다른 업종도 살펴보기<ArrowRight size={17} aria-hidden="true" /></Link></section>
          <section className="industry-faq" aria-labelledby="service-faq-title">
            <p className="industry-kicker">상담 전에 궁금한 점</p>
            <h2 id="service-faq-title">{offering.service} 자주 묻는 질문</h2>
            <div className="industry-faq-list">{guide.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
          </section>
          {relatedCases.length > 0 && <section className="industry-related" aria-labelledby="related-experience-title">
            <h2 id="related-experience-title">관련 개발 경험</h2>
            <p className="industry-experience-note">운영자가 직접 구현한 기능과 개발 범위를 살펴보세요. 개인 개발 경력이며, 워크오토 고객 도입 실적과는 구분합니다.</p>
            <div className="industry-experience-list">{relatedCases.map(item => <Link key={item.slug} href={`/cases/${item.slug}`}><h3>{item.title}<ArrowUpRight size={18} aria-hidden="true" /></h3><p>{item.description}</p></Link>)}</div>
          </section>}
          <section className="industry-related" aria-labelledby="related-services-title">
            <h2 id="related-services-title">함께 살펴볼 자동화</h2>
            <div className="industry-related-grid">{relatedServices.map(item => <Link key={item.slug} href={`/services/${item.slug}`}><h3>{item.service}<ArrowUpRight size={18} aria-hidden="true" /></h3><p>{item.description}</p></Link>)}</div>
          </section>
        </div>

        <aside className="industry-consultation" aria-label="무료 초기 상담 안내">
          <span className="industry-consultation-top">함께 시작하는 첫 단계</span>
          <h2>{offering.title}<br />자동화 상담</h2>
          <div className="industry-price"><span>첫 상담 비용</span><strong>0<small>원</small></strong></div>
          <p className="industry-price-note">개발 비용은 상담 후<br />범위에 맞춰 별도로 안내합니다.</p>
          <ul><li><Check size={15} aria-hidden="true" />현재 업무와 불편한 점 확인</li><li><Check size={15} aria-hidden="true" />자동화 가능 범위 논의</li><li><Check size={15} aria-hidden="true" />진행 방향과 다음 단계 안내</li></ul>
          <Link className="button button-dark" href={applicationHref}>이 업무로 무료 상담 신청<ArrowUpRight size={17} aria-hidden="true" /></Link>
          <p className="industry-consultation-foot">신청 내용 확인 후 남겨주신 이메일로 답변드립니다.</p>
        </aside>
      </div>
      <div className="industry-mobile-action"><div><span>첫 상담 <strong>0원</strong></span><small>개발 비용 별도 안내</small></div><Link className="button button-dark" href={applicationHref}>무료 상담 신청<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    </main>
    <SiteFooter />
  </>;
}
