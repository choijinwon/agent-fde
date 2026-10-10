import { ArrowUpRight } from "lucide-react";
import "./career-section.css";

const experience = [
  { period: "2026.06 — 현재", title: "AI 에이전트 · 업무 자동화", description: "업무별 AI 에이전트와 외부 시스템을 연결합니다. 내부 문서를 활용한 검색, 데이터 처리 자동화, 모델 배포·모니터링 환경을 구축하고 있습니다.", tags: "AI Agent · RAG · MLOps" },
  { period: "2025.08 — 2026.05", title: "디자인 자동화 · 학습 시스템", description: "콘텐츠 제작 도구와 플러그인을 개발하고, 학습 시스템의 화면 구조를 설계했습니다. 공통 UI와 인증, 배포 자동화까지 함께 구축했습니다.", tags: "Next.js · 디자인 시스템 · CI/CD" },
  { period: "2024.08 — 2025.07", title: "스마트팩토리 · 실시간 모니터링", description: "생산 데이터를 확인하는 대시보드와 API 서버를 개발했습니다. 실시간 데이터 처리로 현장 상황을 화면에서 확인할 수 있도록 연결했습니다.", tags: "React · Node.js · WebSocket" },
  { period: "2022.01 — 2024.08", title: "관리자 도구 · 데이터 서비스", description: "사용자·권한 관리, 실시간 협업 에디터, 데이터 시각화와 금융 서비스 화면을 개발했습니다. 개발팀을 이끌며 코드 리뷰와 공통 개발 체계를 만들었습니다.", tags: "관리자 시스템 · 협업 도구 · 팀 리딩" },
  { period: "2017.07 — 2021.12", title: "금융 · 헬스케어 · AI 모니터링", description: "금융 백오피스, 건강 데이터 관리 앱, AI 학습·추론 모니터링 화면을 개발했습니다. 프로젝트를 관리하고, 반복하던 배포 과정을 자동화했습니다.", tags: "업무 시스템 · 모바일 앱 · 배포 자동화" },
  { period: "2006.11 — 2016.05", title: "ERP · 교육 · 문서와 결제", description: "웹 서비스 개발을 시작으로 ERP와 교육 플랫폼, 문서 승인 절차, 결제·정산 시스템을 만들었습니다. 다양한 서비스의 개발과 운영 경험을 쌓았습니다.", tags: "ERP · 교육 플랫폼 · 결제·정산" },
];

export default function CareerSection() {
  return <section className="career-section section-space" id="about" aria-labelledby="career-title">
    <div className="section-wrap career-layout">
      <div className="career-intro">
        <div className="eyebrow section-label">소개와 경력</div>
        <h2 id="career-title">경험을 바탕으로,<br/>직접 만듭니다.</h2>
        <div className="career-person"><strong>최진원</strong><span>업무 자동화 · AI 엔지니어</span></div>
        <p className="career-description">2006년 웹 서비스 개발을 시작으로 교육, 제조, 금융, 헬스케어 분야의 시스템을 만들고 운영해 왔습니다.</p>
        <p className="career-description">최근에는 AI 에이전트와 사내 문서를 활용한 검색 기술로 반복 업무를 자동화하고 있습니다. 업무 분석부터 설계, 개발, 배포와 운영까지 직접 함께합니다.</p>
        <dl className="career-strengths">
          <div><dt>업무부터 이해합니다</dt><dd>사용하는 도구와 반복 작업, 예외를 살핍니다.</dd></div>
          <div><dt>필요한 부분을 연결합니다</dt><dd>화면, 데이터, API와 AI를 함께 다룹니다.</dd></div>
          <div><dt>운영까지 생각합니다</dt><dd>배포와 모니터링, 유지보수 구조를 설계합니다.</dd></div>
        </dl>
        <p className="career-qualification">컴퓨터과학 학사 · 정보처리기사</p>
        <a className="text-link career-contact" href="/consultation">최진원에게 무료 상담 신청 <ArrowUpRight size={17}/></a>
      </div>
      <div className="career-history">
        <div className="career-history-heading"><h3>주요 개발 경험</h3><span>최근 경력부터</span></div>
        <ol className="career-timeline">{experience.map(item => <li key={item.period}>
          <span className="career-period">{item.period}</span>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <span className="career-tags">{item.tags}</span>
        </li>)}</ol>
      </div>
    </div>
  </section>;
}
