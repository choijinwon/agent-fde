"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Building2, CheckCircle2, Factory, FileSpreadsheet, GraduationCap, Workflow } from "lucide-react";

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
    "slug": "academy"
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
    "slug": "excel-accounting"
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
    "slug": "manufacturing"
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
    "slug": "hospital"
  }
];

export default function HomeExamples() {
  const [activeExample, setActiveExample] = useState(0);
  const example = examples[activeExample];

  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % examples.length : event.key === "ArrowLeft" ? (index + examples.length - 1) % examples.length : event.key === "Home" ? 0 : event.key === "End" ? examples.length - 1 : null;
    if (next !== null) { event.preventDefault(); setActiveExample(next); document.getElementById(`example-tab-${next}`)?.focus(); }
  }

  return (
    <section className="solutions-section section-space" id="solutions"><div className="section-wrap"><div className="section-heading"><div><div className="eyebrow section-label">업무에 적용하는 방법</div><h2>매일 하던 업무,<br/>이렇게 바꿀 수 있습니다.</h2></div><p>대표적인 네 가지 적용 예시입니다.<br/>이 밖의 업무도 편하게 문의해 주세요.</p></div><div className="example-tabs" role="tablist" aria-label="업무 자동화 적용 예시">{examples.map((item, index) => <button key={item.title} type="button" role="tab" id={`example-tab-${index}`} aria-selected={activeExample === index} aria-controls={`example-panel-${index}`} tabIndex={activeExample === index ? 0 : -1} onKeyDown={event => changeTab(event, index)} onClick={() => setActiveExample(index)}><span>0{index + 1}</span>{item.title}<ArrowUpRight size={16}/></button>)}</div><div className="example-panel" id={`example-panel-${activeExample}`} role="tabpanel" aria-labelledby={`example-tab-${activeExample}`} key={activeExample}><div className="example-copy"><span className="mini-label">{example.title}에 적용하면</span><h3>{example.heading.split("\n").map((line, index) => <span key={line}>{index > 0 && <br/>}{line}</span>)}</h3><p>{example.description}</p><a href={`/consultation?service=${example.slug}`} className="text-link">이 업무 무료 상담 신청 <ArrowUpRight size={17}/></a><span className="example-disclaimer">이해를 돕기 위한 적용 예시입니다.</span></div><div className="workflow-demo"><div className="demo-topbar"><span><i/><i/><i/></span><small>업무 흐름 예시</small><span className="demo-tag">예시</span></div><div className="workflow-input"><div className="workflow-file-icon">{activeExample === 0 ? <GraduationCap size={22}/> : activeExample === 1 ? <FileSpreadsheet size={22}/> : activeExample === 2 ? <Factory size={22}/> : <Building2 size={22}/>}</div><div><strong>{example.input}</strong><span>{example.inputSub}</span></div></div><div className="workflow-connector"><span/><div><Workflow size={13}/>{example.middle}</div><span/></div><div className="workflow-output"><div className="output-heading"><CheckCircle2 size={18}/>{example.output}</div>{example.rows.map(([label, value]) => <div className="output-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="workflow-foot"><span className="tiny-dot"/>{example.foot}</p></div></div></div></section>
  );
}
