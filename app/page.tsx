import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { ArrowRight, ArrowUpRight, Check, GraduationCap, Factory, Building2, FileSpreadsheet, Workflow } from "lucide-react";

import WorkflowDesk from "./components/WorkflowDesk";
import HomeExamples from "./components/HomeExamples";
import CareerSection from "./components/CareerSection";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { webPageJsonLd, safeJsonLd } from "@/lib/seo";

const contactEmail = "abyys1004@naver.com";
const offerings = [
  { icon: GraduationCap, ...{"number":"01","title":"학원 운영 자동화","english":"ACADEMY OPERATIONS","description":"원생 명단과 수납 자료를 연결해 납부 현황을 정리합니다. 출결 집계와 안내 대상 확인까지, 학원의 반복 업무를 줄입니다.","tags":["수납 대조","출결 집계","안내 준비"]} },
  { icon: FileSpreadsheet, ...{"number":"02","title":"엑셀·회계 자동화","english":"EXCEL & ACCOUNTING","description":"여러 엑셀의 매출·지출 자료를 모으고 양식을 통일합니다. 중복과 금액 차이를 찾아 월별 대사와 보고를 돕습니다.","tags":["파일 통합","매출·지출 대사","월별 보고"]} },
  { icon: Factory, ...{"number":"03","title":"제조 ERP 자동화","english":"MANUFACTURING & ERP","description":"주문·재고·생산 자료를 연결해 반복 입력과 현황 집계를 줄입니다. 사용 중인 ERP의 연동 기능부터 확인합니다.","tags":["수주·재고","생산 현황","ERP 연동"]} },
  { icon: Building2, number: "04", title: "병원 운영 자동화", english: "HOSPITAL OPERATIONS", description: "예약·접수 현황, 수납·정산 자료와 소모품 재고를 정리합니다. 사용 중인 프로그램과 데이터 형식을 확인해 연동 범위를 설계합니다.", tags: ["예약·접수", "수납·정산", "소모품 재고"] },
  { icon: Workflow, ...{"number":"05","title":"기타 맞춤 자동화","english":"YOUR WORKFLOW, CONNECTED","description":"문서 취합, 고객 관리, 주문 정리와 정기 보고까지. 다양한 업종의 반복 업무를 기존 도구와 연결합니다.","tags":["문서·보고","고객·주문 관리","시스템 연결"]} }
];

function detailHref(service: string) {
  return `/services/${SERVICE_CATALOG.find(item => item.service === service)?.slug ?? "custom"}`;
}

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd({ title: `${BRAND_NAME} | 엑셀·ERP 업무 자동화 · AI 개발`, description: "학원·병원부터 제조·유통·일반 사무까지, 기존 도구와 연결하는 업무 자동화 개발 서비스입니다.", path: "/" })) }} />
    <SiteHeader/>
    <main id="main">
      <section className="hero section-wrap" id="home">
        <div className="hero-content"><div className="eyebrow">{BRAND_NAME} · 업무 자동화 &amp; AI</div><h1>반복되는 업무,<br/>이제 <span>자동화로.</span></h1><p className="hero-description">학원·병원부터 제조·유통·일반 사무까지.<br/>매일 반복하는 입력·정리·보고를 연결하고,<br className="mobile-break"/> 업무에 맞는 자동화를 만듭니다.</p><div className="hero-actions"><a href="/consultation" className="button button-dark">무료 상담 신청 <ArrowUpRight size={19}/></a><Link href="/services" className="text-link">업종별 상담 보기 <ArrowUpRight size={16}/></Link></div><div className="hero-note"><span className="mini-ring"/> 첫 상담은 무료입니다. 편하게 이야기해 주세요.</div></div>
        <div className="hero-visual"><WorkflowDesk/></div>
      </section>
      <div className="principles section-wrap"><div className="principle-intro">복잡한 기술은 뒤로.<br/><strong>변화는 업무의 앞에.</strong></div><div className="principle"><span>지금 쓰는 도구</span><p>쓰던 도구와 연결</p></div><div className="principle"><span>부담 없는 시작</span><p>작은 업무부터 시작</p></div><div className="principle"><span>꾸준한 운영</span><p>운영을 생각하는 설계</p></div></div>
      <CareerSection/>
      <section className="services-section section-wrap section-space" id="services"><div className="section-heading"><div><div className="eyebrow section-label">함께할 수 있는 일</div><h2>필요한 곳에서 시작해,<br/>실제 변화까지.</h2></div><p>학원·병원·제조업부터 유통·일반 사무까지.<br/>업종과 도구에 맞춰 반복 업무를 살피고<br/>원하는 분야를 골라 상담을 신청하세요.</p></div><p className="service-pricing-note"><span>첫 상담 0원</span>개발 범위와 비용은 상담 후 안내합니다.</p><div className="services-grid">{offerings.map(({ icon: Icon, number, title, description, tags }) => <a href={detailHref(title)} className={`service-card${title === "기타 맞춤 자동화" ? " service-card-wide" : ""}`} key={number}><div className="service-card-top"><Icon size={26} strokeWidth={1.4}/><span>{number}</span></div><div className="service-card-title"><h3>{title}</h3></div><p>{description}</p><div className="service-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="service-apply-row"><div className="service-fee"><span>첫 상담</span><strong>0<small>원</small></strong></div><span className="service-apply-label">상담 내용 보기 <ArrowUpRight size={18}/></span></div></a>)}</div><Link className="all-services-link" href="/services">쇼핑몰·유통, 물류, 매장 등 전체 분야 보기 <ArrowUpRight size={18}/></Link></section>
      <HomeExamples/>
      <section className="process-section section-space" id="process"><div className="section-wrap"><div className="process-heading"><div><div className="eyebrow section-label">이렇게 진행합니다</div><h2>당신의 현장에 가깝게.<br/><span>해결의 끝까지.</span></h2></div><p>첫 상담에서 업무와 필요한 범위를 살핍니다.<br/>개발 범위와 비용을 합의한 뒤,<br/>작은 자동화부터 만들고 검증해<br/>일상 업무에 자연스럽게 연결합니다.</p></div><div className="process-grid">{[{title:"문제 정의",en:"DISCOVER",text:"반복하는 작업, 사용하는 파일과 프로그램을 확인하고 자동화 범위를 정합니다."},{title:"빠른 검증",en:"VALIDATE",text:"샘플 데이터로 작은 자동화를 구현합니다. 예외와 결과를 담당자와 함께 확인합니다."},{title:"서비스 구축",en:"BUILD",text:"확인된 업무 규칙으로 기존 도구를 연결합니다. 중복 실행과 오류 처리도 점검합니다."},{title:"운영 개선",en:"EVOLVE",text:"자동화 결과와 실행 이력을 확인합니다. 업무가 바뀌면 규칙과 연결 방식도 다듬습니다."}].map((step,index) => <div className="process-step" key={step.en}><div className="step-number"><span>0{index+1}</span>{index<3 ? <ArrowRight size={21}/> : <Check size={21}/>}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div><div className="process-bottom"><span><span className="status-dot"/> 문제를 이해하는 것부터, 잘 작동하는 것까지.</span><a href="/consultation">함께 시작하기 <ArrowUpRight size={18}/></a></div></div></section>
      <section className="faq-section section-wrap section-space"><div><div className="eyebrow section-label">자주 묻는 이야기</div><h2>시작하기 전에,<br/>궁금한 이야기.</h2></div><div className="faq-list">{[{q:"상담은 무료인가요?",a:"네. 업무 내용과 자동화 가능 범위를 살펴보는 첫 상담은 무료입니다. 실제 개발은 필요한 기능과 연동 범위를 확인하고, 비용을 안내한 뒤 합의한 범위에 따라 진행합니다."},{"q":"여기에 없는 업종이나 업무도 가능한가요?","a":"네. 학원, 병원, 엑셀·회계, 제조 ERP는 대표적인 예시입니다. 고객 관리, 주문 정리, 문서 취합, 정기 보고 등 다양한 반복 업무를 살펴보고 데이터와 도구에 맞는 자동화 범위를 제안합니다."},{"q":"기존 엑셀이나 ERP를 그대로 사용할 수 있나요?","a":"현재 도구를 활용하는 방법부터 검토합니다. 엑셀 구조, ERP의 API·파일 입출력 기능, 접근 권한과 보안 정책에 따라 구현 방식이 달라집니다. 기존 데이터는 검증한 뒤 반영합니다."},{"q":"상담 전에 무엇을 준비하면 되나요?","a":"반복 업무 설명, 사용 중인 프로그램 이름, 개인정보를 제거한 샘플 파일을 준비하면 좋습니다. 첫 문의에는 업무 설명만 남겨주세요. 범위와 데이터 상태를 확인한 뒤 일정과 비용을 제안합니다."}].map(item => <details key={item.q}><summary>{item.q}<span className="faq-plus">+</span></summary><p>{item.a}</p></details>)}</div></section>
      <section className="contact-section" id="contact"><div className="section-wrap home-contact-invite"><div><div className="eyebrow section-label">첫 상담은 무료입니다</div><h2>어떤 업종이든,<br/>일 이야기부터 시작해요.</h2></div><div><p>{BRAND_NAME}에 반복하는 업무를 들려주세요.<br/>필요한 자동화와 연동 범위를 함께 살펴봅니다.<br/>실제 개발 비용은 상담 후 별도로 안내합니다.</p><a className="button button-dark" href="/consultation">무료 상담 신청 <ArrowUpRight size={19}/></a><a className="contact-email" href={`mailto:${contactEmail}`}><span>이메일로 직접 문의</span><strong>{contactEmail} <ArrowUpRight size={18}/></strong></a></div></div></section>
    </main>
    <SiteFooter/>
    <a className="mobile-contact-cta" href="/consultation">무료 상담 신청 <ArrowUpRight size={19}/></a>
  </>;
}
