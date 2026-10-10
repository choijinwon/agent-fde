"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, GraduationCap, Factory, Building2, FileSpreadsheet, Workflow } from "lucide-react";

import WorkflowDesk from "./components/WorkflowDesk";
import CareerSection from "./components/CareerSection";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import { SERVICE_CATALOG } from "@/lib/service-catalog";

const contactEmail = "abyys1004@naver.com";
const offerings = [
  { icon: GraduationCap, ...{"number":"01","title":"학원 운영 자동화","english":"ACADEMY OPERATIONS","description":"원생 명단과 수납 자료를 연결해 납부 현황을 정리합니다. 출결 집계와 안내 대상 확인까지, 학원의 반복 업무를 줄입니다.","tags":["수납 대조","출결 집계","안내 준비"]} },
  { icon: FileSpreadsheet, ...{"number":"02","title":"엑셀·회계 자동화","english":"EXCEL & ACCOUNTING","description":"여러 엑셀의 매출·지출 자료를 모으고 양식을 통일합니다. 중복과 금액 차이를 찾아 월별 대사와 보고를 돕습니다.","tags":["파일 통합","매출·지출 대사","월별 보고"]} },
  { icon: Factory, ...{"number":"03","title":"제조 ERP 자동화","english":"MANUFACTURING & ERP","description":"주문·재고·생산 자료를 연결해 반복 입력과 현황 집계를 줄입니다. 사용 중인 ERP의 연동 기능부터 확인합니다.","tags":["수주·재고","생산 현황","ERP 연동"]} },
  { icon: Building2, number: "04", title: "병원 운영 자동화", english: "HOSPITAL OPERATIONS", description: "예약·접수 현황, 수납·정산 자료와 소모품 재고를 정리합니다. 사용 중인 프로그램과 데이터 형식을 확인해 연동 범위를 설계합니다.", tags: ["예약·접수", "수납·정산", "소모품 재고"] },
  { icon: Workflow, ...{"number":"05","title":"기타 맞춤 자동화","english":"YOUR WORKFLOW, CONNECTED","description":"문서 취합, 고객 관리, 주문 정리와 정기 보고까지. 다양한 업종의 반복 업무를 기존 도구와 연결합니다.","tags":["문서·보고","고객·주문 관리","시스템 연결"]} }
];
const examples = [
  {
    "title": "학원 운영",
    "label": "ACADEMY WORKFLOW",
    "heading": "수납 확인부터,\n안내 준비까지 한 번에.",
    "description": "원생 명단과 입금 내역을 대조해 납부 현황을 정리합니다. 미납·환불 등 확인이 필요한 항목은 따로 모아 검토합니다.",
    "input": "원생명단.xlsx + 입금내역.xlsx",
    "inputSub": "명단 · 수납 자료 취합",
    "middle": "납부 대조 & 확인 대상 분류",
    "output": "수납 현황이 정리되었어요",
    "rows": [
      [
        "정리 결과",
        "완납 · 미납 · 확인 필요"
      ],
      [
        "추가 검토",
        "동명이인 · 부분 납부"
      ],
      [
        "다음 단계",
        "담당자 확인 후 안내"
      ]
    ],
    "foot": "안내 발송은 대상과 내용을 확인한 후 진행합니다.",
    "service": "학원 운영 자동화"
  },
  {
    "title": "엑셀·회계",
    "label": "EXCEL & ACCOUNTING",
    "heading": "흩어진 회계 자료를,\n검토 가능한 월별 보고로.",
    "description": "매출·지출 파일과 거래 내역을 모아 정해진 양식으로 정리합니다. 중복·누락 후보와 금액 차이를 표시해 대사와 마감을 돕습니다.",
    "input": "매출.xlsx + 지출.xlsx + 거래내역",
    "inputSub": "파일 취합 · 양식 통일",
    "middle": "중복 확인 & 금액 대조",
    "output": "월별 검토 자료가 준비됐어요",
    "rows": [
      [
        "정리 결과",
        "매출 · 지출 · 월별 합계"
      ],
      [
        "확인 항목",
        "중복 후보 · 금액 차이"
      ],
      [
        "다음 단계",
        "담당자 검토 후 확정"
      ]
    ],
    "foot": "회계 처리와 신고 자료의 최종 확정은 담당자가 검토합니다.",
    "service": "엑셀·회계 자동화"
  },
  {
    "title": "제조 ERP",
    "label": "MANUFACTURING WORKFLOW",
    "heading": "주문부터 생산·재고까지,\n흐름이 이어지도록.",
    "description": "ERP와 현장 자료를 연결해 수주, 생산 실적, 재고 현황을 모읍니다. 반복 입력을 줄이고 확인이 필요한 항목을 담당자에게 보여줍니다.",
    "input": "ERP 수주 자료 + 생산 실적 파일",
    "inputSub": "연동 기능 · 품목 코드 확인",
    "middle": "품목 매핑 & 현황 집계",
    "output": "생산·재고 현황이 모였어요",
    "rows": [
      [
        "연결 자료",
        "수주 · 생산 실적 · 재고"
      ],
      [
        "확인 항목",
        "품목 코드 · 수량 차이"
      ],
      [
        "다음 단계",
        "검토 후 ERP 반영"
      ]
    ],
    "foot": "ERP의 API·파일 입출력 지원 범위에 맞춰 연동합니다.",
    "service": "제조 ERP 자동화"
  },
  {
    "title": "병원 운영",
    "label": "HOSPITAL OPERATIONS",
    "heading": "예약·접수 현황을,\n한눈에 확인하도록.",
    "description": "예약 일정과 접수 상태를 모아 변경·중복 확인 대상을 정리합니다. 직원이 내용을 확인하고 필요한 안내를 준비할 수 있도록 연결합니다.",
    "input": "예약 일정 + 접수 상태",
    "inputSub": "필요한 운영 항목만 연결",
    "middle": "일정 대조 & 확인 대상 분류",
    "output": "오늘의 운영 현황이 모였어요",
    "rows": [
      [
        "집계 항목",
        "예약 · 접수 · 일정 변경"
      ],
      [
        "확인 대상",
        "중복 예약 · 변경 요청"
      ],
      [
        "다음 단계",
        "직원 확인 후 안내"
      ]
    ],
    "foot": "사용 권한과 프로그램 연동 범위를 확인해 설계합니다.",
    "service": "병원 운영 자동화"
  }
];

function detailHref(service: string) {
  return `/services/${SERVICE_CATALOG.find(item => item.service === service)?.slug ?? "custom"}`;
}
function consultationHref(service: string) {
  return `/consultation?service=${SERVICE_CATALOG.find(item => item.service === service)?.slug ?? "custom"}`;
}

export default function Home() {
  const [activeExample, setActiveExample] = useState(0);
  const example = examples[activeExample];

  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % examples.length : event.key === "ArrowLeft" ? (index + examples.length - 1) % examples.length : event.key === "Home" ? 0 : event.key === "End" ? examples.length - 1 : null;
    if (next !== null) { event.preventDefault(); setActiveExample(next); document.getElementById(`example-tab-${next}`)?.focus(); }
  }


  return <>
    <SiteHeader/>
    <main id="main">
      <section className="hero section-wrap" id="home">
        <div className="hero-content"><div className="eyebrow">최진원 · 업무 자동화 &amp; AI 엔지니어</div><h1>반복되는 업무,<br/>이제 <span>자동화로.</span></h1><p className="hero-description">학원·병원부터 제조·유통·일반 사무까지.<br/>매일 반복하는 입력·정리·보고를 연결하고,<br className="mobile-break"/> 업무에 맞는 자동화를 만듭니다.</p><div className="hero-actions"><a href="/consultation" className="button button-dark">무료 상담 신청 <ArrowUpRight size={19}/></a><a href="/services" className="text-link">업종별 상담 보기 <ArrowUpRight size={16}/></a></div><div className="hero-note"><span className="mini-ring"/> 첫 상담은 무료입니다. 편하게 이야기해 주세요.</div></div>
        <div className="hero-visual"><WorkflowDesk/></div>
      </section>
      <div className="principles section-wrap"><div className="principle-intro">복잡한 기술은 뒤로.<br/><strong>변화는 업무의 앞에.</strong></div><div className="principle"><span>지금 쓰는 도구</span><p>쓰던 도구와 연결</p></div><div className="principle"><span>부담 없는 시작</span><p>작은 업무부터 시작</p></div><div className="principle"><span>꾸준한 운영</span><p>운영을 생각하는 설계</p></div></div>
      <CareerSection/>
      <section className="services-section section-wrap section-space" id="services"><div className="section-heading"><div><div className="eyebrow section-label">함께할 수 있는 일</div><h2>필요한 곳에서 시작해,<br/>실제 변화까지.</h2></div><p>학원·병원·제조업부터 유통·일반 사무까지.<br/>업종과 도구에 맞춰 반복 업무를 살피고<br/>원하는 분야를 골라 상담을 신청하세요.</p></div><p className="service-pricing-note"><span>첫 상담 0원</span>개발 범위와 비용은 상담 후 안내합니다.</p><div className="services-grid">{offerings.map(({ icon: Icon, number, title, description, tags }) => <a href={detailHref(title)} className={`service-card${title === "기타 맞춤 자동화" ? " service-card-wide" : ""}`} key={number}><div className="service-card-top"><Icon size={26} strokeWidth={1.4}/><span>{number}</span></div><div className="service-card-title"><h3>{title}</h3></div><p>{description}</p><div className="service-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="service-apply-row"><div className="service-fee"><span>첫 상담</span><strong>0<small>원</small></strong></div><span className="service-apply-label">상담 내용 보기 <ArrowUpRight size={18}/></span></div></a>)}</div><a className="all-services-link" href="/services">쇼핑몰·유통, 물류, 매장 등 전체 분야 보기 <ArrowUpRight size={18}/></a></section>
      <section className="solutions-section section-space" id="solutions"><div className="section-wrap"><div className="section-heading"><div><div className="eyebrow section-label">업무에 적용하는 방법</div><h2>매일 하던 업무,<br/>이렇게 바꿀 수 있습니다.</h2></div><p>대표적인 네 가지 적용 예시입니다.<br/>이 밖의 업무도 편하게 문의해 주세요.</p></div><div className="example-tabs" role="tablist" aria-label="업무 자동화 적용 예시">{examples.map((item, index) => <button key={item.title} type="button" role="tab" id={`example-tab-${index}`} aria-selected={activeExample === index} aria-controls={`example-panel-${index}`} tabIndex={activeExample === index ? 0 : -1} onKeyDown={event => changeTab(event, index)} onClick={() => setActiveExample(index)}><span>0{index + 1}</span>{item.title}<ArrowUpRight size={16}/></button>)}</div><div className="example-panel" id={`example-panel-${activeExample}`} role="tabpanel" aria-labelledby={`example-tab-${activeExample}`} key={activeExample}><div className="example-copy"><span className="mini-label">{example.title}에 적용하면</span><h3>{example.heading.split("\n").map((line, index) => <span key={line}>{index > 0 && <br/>}{line}</span>)}</h3><p>{example.description}</p><a href={consultationHref(example.service)} className="text-link">이 업무 무료 상담 신청 <ArrowUpRight size={17}/></a><span className="example-disclaimer">이해를 돕기 위한 적용 예시입니다.</span></div><div className="workflow-demo"><div className="demo-topbar"><span><i/><i/><i/></span><small>업무 흐름 예시</small><span className="demo-tag">예시</span></div><div className="workflow-input"><div className="workflow-file-icon">{activeExample === 0 ? <GraduationCap size={22}/> : activeExample === 1 ? <FileSpreadsheet size={22}/> : activeExample === 2 ? <Factory size={22}/> : <Building2 size={22}/>}</div><div><strong>{example.input}</strong><span>{example.inputSub}</span></div></div><div className="workflow-connector"><span/><div><Workflow size={13}/>{example.middle}</div><span/></div><div className="workflow-output"><div className="output-heading"><CheckCircle2 size={18}/>{example.output}</div>{example.rows.map(([label, value]) => <div className="output-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="workflow-foot"><span className="tiny-dot"/>{example.foot}</p></div></div></div></section>
      <section className="process-section section-space" id="process"><div className="section-wrap"><div className="process-heading"><div><div className="eyebrow section-label">이렇게 진행합니다</div><h2>당신의 현장에 가깝게.<br/><span>해결의 끝까지.</span></h2></div><p>첫 상담에서 업무와 필요한 범위를 살핍니다.<br/>개발 범위와 비용을 합의한 뒤,<br/>작은 자동화부터 만들고 검증해<br/>일상 업무에 자연스럽게 연결합니다.</p></div><div className="process-grid">{[{title:"문제 정의",en:"DISCOVER",text:"반복하는 작업, 사용하는 파일과 프로그램을 확인하고 자동화 범위를 정합니다."},{title:"빠른 검증",en:"VALIDATE",text:"샘플 데이터로 작은 자동화를 구현합니다. 예외와 결과를 담당자와 함께 확인합니다."},{title:"서비스 구축",en:"BUILD",text:"확인된 업무 규칙으로 기존 도구를 연결합니다. 중복 실행과 오류 처리도 점검합니다."},{title:"운영 개선",en:"EVOLVE",text:"자동화 결과와 실행 이력을 확인합니다. 업무가 바뀌면 규칙과 연결 방식도 다듬습니다."}].map((step,index) => <div className="process-step" key={step.en}><div className="step-number"><span>0{index+1}</span>{index<3 ? <ArrowRight size={21}/> : <Check size={21}/>}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div><div className="process-bottom"><span><span className="status-dot"/> 문제를 이해하는 것부터, 잘 작동하는 것까지.</span><a href="/consultation">함께 시작하기 <ArrowUpRight size={18}/></a></div></div></section>
      <section className="faq-section section-wrap section-space"><div><div className="eyebrow section-label">자주 묻는 이야기</div><h2>시작하기 전에,<br/>궁금한 이야기.</h2></div><div className="faq-list">{[{q:"상담은 무료인가요?",a:"네. 업무 내용과 자동화 가능 범위를 살펴보는 첫 상담은 무료입니다. 실제 개발은 필요한 기능과 연동 범위를 확인하고, 비용을 안내한 뒤 합의한 범위에 따라 진행합니다."},{"q":"여기에 없는 업종이나 업무도 가능한가요?","a":"네. 학원, 병원, 엑셀·회계, 제조 ERP는 대표적인 예시입니다. 고객 관리, 주문 정리, 문서 취합, 정기 보고 등 다양한 반복 업무를 살펴보고 데이터와 도구에 맞는 자동화 범위를 제안합니다."},{"q":"기존 엑셀이나 ERP를 그대로 사용할 수 있나요?","a":"현재 도구를 활용하는 방법부터 검토합니다. 엑셀 구조, ERP의 API·파일 입출력 기능, 접근 권한과 보안 정책에 따라 구현 방식이 달라집니다. 기존 데이터는 검증한 뒤 반영합니다."},{"q":"상담 전에 무엇을 준비하면 되나요?","a":"반복 업무 설명, 사용 중인 프로그램 이름, 개인정보를 제거한 샘플 파일을 준비하면 좋습니다. 첫 문의에는 업무 설명만 남겨주세요. 범위와 데이터 상태를 확인한 뒤 일정과 비용을 제안합니다."}].map(item => <details key={item.q}><summary>{item.q}<span className="faq-plus">+</span></summary><p>{item.a}</p></details>)}</div></section>
      <section className="contact-section" id="contact"><div className="section-wrap home-contact-invite"><div><div className="eyebrow section-label">첫 상담은 무료입니다</div><h2>어떤 업종이든,<br/>일 이야기부터 시작해요.</h2></div><div><p>최진원에게 반복하는 업무를 들려주세요.<br/>필요한 자동화와 연동 범위를 함께 살펴봅니다.<br/>실제 개발 비용은 상담 후 별도로 안내합니다.</p><a className="button button-dark" href="/consultation">무료 상담 신청 <ArrowUpRight size={19}/></a><a className="contact-email" href={`mailto:${contactEmail}`}><span>이메일로 직접 문의</span><strong>{contactEmail} <ArrowUpRight size={18}/></strong></a></div></div></section>
    </main>
    <SiteFooter/>
    <a className="mobile-contact-cta" href="/consultation">무료 상담 신청 <ArrowUpRight size={19}/></a>
  </>;
}
