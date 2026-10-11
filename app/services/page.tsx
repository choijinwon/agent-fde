import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Check, GraduationCap, HeartPulse, Factory, Table2, ShoppingBag, Package, Store, BriefcaseBusiness, Workflow, MessageCircle } from "lucide-react";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { siteMetadata, catalogJsonLd, safeJsonLd } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import "./services.css";

export const metadata = siteMetadata({
  title: `업종별 업무 자동화 · 엑셀·ERP·운영 업무 | ${BRAND_NAME}`,
  description: "학원 수납·출결, 병원 운영 행정, 제조 ERP, 엑셀·회계, 쇼핑몰 주문, 물류·재고, 매장과 사무 업무까지. 9개 분야의 자동화 적용 예시와 필요한 자료를 살펴보세요. 첫 상담은 무료이며 개발 비용은 상담 후 별도 안내합니다.",
  path: "/services",
});

const categoryIcons = [GraduationCap, HeartPulse, Factory, Table2, ShoppingBag, Package, Store, BriefcaseBusiness, Workflow];
const categoryLabels = ["학원·교육", "병원·의원", "제조·생산", "엑셀·회계", "쇼핑몰", "물류·재고", "매장·외식", "사무·전문", "맞춤 자동화"];
const cardHeadlines = ["원생 관리부터\n수납 확인까지.", "반복되는 운영 업무에\n여유를 더하세요.", "현장과 ERP를\n하나의 흐름으로.", "흩어진 엑셀을\n하나의 기준으로.", "여러 판매 채널을\n한눈에 정리하세요.", "입고부터 출고까지.\n자료가 이어지도록.", "매일의 마감이\n조금 더 가볍도록.", "자료 정리는 줄이고.\n중요한 일에 집중하고.", "어떤 일이든,\n함께 살펴볼까요?"];

export default function ServicesPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(catalogJsonLd(SERVICE_CATALOG)) }} />
    <SiteHeader />
    <main id="main" className="industry-page">
      <div className="industry-announcement">첫 상담은 0원. 개발 비용은 상담 후 안내합니다.<Link href="/consultation">무료 상담 신청<ChevronRight size={14} aria-hidden="true" /></Link></div>
      <section className="section-wrap industry-intro">
        <div className="industry-intro-grid">
          <div><p className="industry-kicker">{BRAND_NAME}의 업무 자동화</p><h1>업종별 업무 자동화.<br /><span>내 일에 꼭 맞게.</span></h1></div>
          <div className="industry-intro-note"><p>지금 쓰는 도구는 익숙하게.<br />반복되는 일은 더 간결하게.</p><Link href="/consultation"><MessageCircle size={21} aria-hidden="true" /><span>어디서 시작할지 고민된다면<br /><strong>직접 상담하기<ChevronRight size={15} aria-hidden="true" /></strong></span></Link></div>
        </div>
        <nav className="industry-categories" aria-label="업종 바로가기">
          {SERVICE_CATALOG.map((offering,index) => { const Icon = categoryIcons[index]; return <a href={`#category-${offering.slug}`} key={offering.slug}><span><Icon size={37} strokeWidth={1.4} aria-hidden="true" /></span>{categoryLabels[index]}</a>; })}
        </nav>
      </section>

      <section className="section-wrap industry-catalog" aria-labelledby="industry-list-title">
        <div className="industry-section-top"><h2 id="industry-list-title">업종별 자동화. <span>지금 하는 일에서 시작합니다.</span></h2></div>
        <div className="industry-card-grid">
          {SERVICE_CATALOG.map((offering, index) => { const Icon = categoryIcons[index]; return <article className={`industry-card${index === 2 || index === 8 ? " industry-card-dark" : ""}`} key={offering.slug} id={`category-${offering.slug}`}>
            <Link className="industry-card-link" href={`/services/${offering.slug}`} aria-labelledby={`service-${offering.slug} service-detail-${offering.slug}`}>
              <p className="industry-card-label" id={`service-${offering.slug}`}>{offering.title}</p>
              <h3>{cardHeadlines[index].split("\n").map((line,i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</h3>
              <div className="industry-card-visual" aria-hidden="true">
                <div className="industry-object-back"><Icon size={58} strokeWidth={1.15} /></div>
                <div className="industry-object-panel">
                  <div className="industry-object-toolbar"><i /><i /><i /><span>업무 자료</span></div>
                  <div className="industry-object-title"><Icon size={19} strokeWidth={1.6} />{categoryLabels[index]}</div>
                  {offering.inputs.map(input => <div className="industry-object-row" key={input}><span>{input}</span><Check size={13} strokeWidth={2} /></div>)}
                  <div className="industry-object-lines"><i /><i /><i /></div>
                </div>
              </div>
              <p className="industry-card-description">{offering.description}</p>
              <span className="industry-card-detail" id={`service-detail-${offering.slug}`}>자세히 보기<ChevronRight size={15} aria-hidden="true" /></span>
            </Link>
            <div className="industry-card-bottom">
              <span>첫 상담 <strong>0원</strong></span>
              <Link className="button button-dark industry-card-apply" href={`/consultation?service=${offering.slug}`} aria-label={`${offering.title} 0원 상담 신청`}>0원 상담 신청<ArrowUpRight size={15} aria-hidden="true" /></Link>
              <p className="industry-card-fee-note">개발 비용은 상담 후 별도 안내</p>
            </div>
          </article>; })}
        </div>
        <p className="industry-examples-note">카드의 그래픽과 소개된 업무는 적용 가능한 구성 예시입니다. 실제 구현 범위와 개발 비용은 사용하는 도구와 자료를 확인한 뒤 정합니다.</p>
      </section>

      <section className="section-wrap industry-start">
        <div><p className="industry-kicker">당신의 업무를 듣는 것부터.</p><h2>작은 반복 하나가,<br />좋은 시작이 됩니다.</h2><p>정리된 요구사항이 없어도 괜찮습니다.<br />지금 불편한 점부터 함께 살펴보겠습니다.</p></div>
        <div className="industry-start-action"><span>첫 상담 비용 <strong>0원</strong></span><Link className="button button-dark" href="/consultation">무료 상담 신청<ArrowUpRight size={18} aria-hidden="true" /></Link><p>개발 비용은 상담 후 별도 안내</p></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
