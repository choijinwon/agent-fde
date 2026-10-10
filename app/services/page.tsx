import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { siteMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import "./services.css";

export const metadata = siteMetadata({
  title: "업종별 업무 자동화 · 무료 상담 | 최진원",
  description: "학원, 병원, 제조, 쇼핑몰, 물류, 매장과 일반 사무까지. 업무에 맞는 자동화를 살펴보고 0원 초기 상담을 신청하세요. 개발 비용은 상담 후 안내합니다.",
  path: "/services",
});

export default function ServicesPage() {
  return <>
    <SiteHeader />
    <main id="main" className="industry-page">
      <section className="section-wrap industry-intro">
        <nav className="industry-breadcrumb" aria-label="현재 위치"><Link href="/">홈</Link><span aria-hidden="true">/</span><span aria-current="page">업종별 자동화</span></nav>
        <div className="industry-intro-grid">
          <div><p className="industry-kicker">하는 일은 달라도, 반복 업무는 있으니까요.</p><h1>내 업무에 맞는<br /><span>자동화를 찾아보세요.</span></h1></div>
          <div className="industry-intro-note"><p>학원, 병원, 제조부터 작은 매장과 사무 업무까지.<br className="industry-desktop-break" /> 지금 쓰는 도구와 일하는 방식에서 시작합니다.</p><div><span>첫 상담</span><strong>0<small>원</small></strong><p>자동화할 업무와 가능 범위를 함께 살펴봅니다.<br />개발 비용은 상담 후 별도로 안내합니다.</p></div></div>
        </div>
      </section>

      <section className="section-wrap industry-catalog" aria-labelledby="industry-list-title">
        <div className="industry-section-top"><h2 id="industry-list-title">어떤 일을 하고 계신가요?</h2><span>업종을 선택해 적용 예시를 살펴보세요.</span></div>
        <div className="industry-card-grid">
          {SERVICE_CATALOG.map((offering, index) => <article className="industry-card" key={offering.slug}>
            <div className="industry-card-index"><span>{String(index + 1).padStart(2, "0")}</span><span>{offering.slug === "custom" ? "업무에 맞춰 함께" : "반복 업무부터 차근차근"}</span></div>
            <h3><Link href={`/services/${offering.slug}`}>{offering.title}<ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" /></Link></h3>
            <p>{offering.description}</p>
            <ul className="industry-input-tags" aria-label="연결할 수 있는 자료">{offering.inputs.map(input => <li key={input}>{input}</li>)}</ul>
            <div className="industry-card-bottom"><span>첫 상담 <strong>0원</strong></span><Link href={`/services/${offering.slug}`}>자세히 보기<ArrowRight size={16} aria-hidden="true" /></Link></div>
          </article>)}
        </div>
        <p className="industry-examples-note">소개된 업무는 적용 가능한 구성 예시입니다. 실제 구현 범위는 사용하는 도구와 자료를 확인한 뒤 정합니다.</p>
      </section>

      <section className="section-wrap industry-start">
        <div><p className="industry-kicker">어디서 시작할지 고민된다면</p><h2>반복하는 업무 하나만<br />이야기해 주세요.</h2><p>정리된 요구사항이 없어도 괜찮습니다.<br />지금 불편한 점부터 함께 살펴보겠습니다.</p></div>
        <Link className="button button-dark" href="/consultation">무료 상담 신청<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>
    </main>
    <SiteFooter />
  </>;
}
