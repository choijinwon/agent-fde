import type { ServiceSlug } from "./service-catalog";

type CaseStudy = {
  slug: string;
  category: string;
  title: string;
  headline: string;
  description: string;
  period: string;
  role: string;
  serviceSlug: ServiceSlug;
  serviceLabel: string;
  technologies: readonly string[];
  context: string;
  implementations: readonly { title: string; description: string }[];
  result: string;
  diagram: readonly { title: string; description: string }[];
  diagramConnected: boolean;
  application: { title: string; description: string; checks: readonly string[] };
};

// Source: the operator's supplied FDE career document, mirrored in CareerSection.
// These describe personal development experience, not WORKAUTO customer results.
export const CASE_STUDIES = [
  {
    slug: "smart-factory",
    category: "제조 · 실시간 데이터",
    title: "스마트팩토리 실시간 모니터링",
    headline: "생산 데이터를,\n확인할 수 있는 화면으로.",
    description: "React 대시보드와 Node.js API, WebSocket을 연결해 생산 데이터를 실시간으로 확인하는 스마트팩토리 시스템을 개발했습니다.",
    period: "2024.08 — 2025.07",
    role: "프로젝트 리더 · 프론트엔드 및 API 개발",
    serviceSlug: "manufacturing",
    serviceLabel: "제조·생산 자동화",
    technologies: ["React", "Node.js", "WebSocket"],
    context: "생산 데이터를 시각화하고 현장 상황을 확인하는 스마트팩토리 솔루션 개발에 참여했습니다. 화면뿐 아니라 데이터를 전달하는 API와 실시간 처리 구조를 함께 다뤘습니다.",
    implementations: [
      { title: "생산 데이터를 보여주는 대시보드", description: "React 기반 대시보드 화면을 개발해 생산 데이터를 시각적으로 확인할 수 있도록 구성했습니다." },
      { title: "데이터와 화면을 연결하는 API", description: "Node.js 기반 API 서버를 구축하고 대시보드에 필요한 데이터를 연결했습니다." },
      { title: "상태 변화를 반영하는 실시간 처리", description: "WebSocket 기반 실시간 데이터 처리를 구현해 갱신되는 정보를 모니터링 화면에서 확인하도록 했습니다." },
    ],
    result: "생산 데이터 시각화와 실시간 모니터링 시스템을 구현했습니다. 현장 데이터를 전달하는 서버와 이를 확인하는 화면을 함께 개발한 경험입니다.",
    diagram: [
      { title: "생산 데이터", description: "모니터링할 현장 정보" },
      { title: "API · 실시간 처리", description: "Node.js · WebSocket" },
      { title: "대시보드", description: "React 기반 시각화" },
    ],
    diagramConnected: true,
    application: {
      title: "우리 현장의 생산·재고 자료도 연결할 수 있을까요?",
      description: "기존 ERP나 생산 기록에서 가져올 수 있는 자료를 살펴보고, 현황 조회부터 연결하는 방법을 논의할 수 있습니다. 아래 항목은 새 상담에서 확인할 내용입니다.",
      checks: ["현재 ERP의 API 또는 파일 내보내기 기능", "생산·품목 코드와 갱신 주기", "담당자가 확인할 지표와 예외 상황"],
    },
  },
  {
    slug: "design-learning",
    category: "콘텐츠 제작 · 교육 시스템",
    title: "디자인 자동화와 학습 시스템 개발",
    headline: "만드는 도구부터,\n배우는 화면까지.",
    description: "콘텐츠 저작도구의 스킬과 로컬 플러그인을 개발하고, 학습 시스템의 프론트엔드 구조·공통 UI·인증·배포 환경을 구축했습니다.",
    period: "2025.08 — 2026.05",
    role: "프론트엔드 팀장 · 아키텍처 설계 및 개발",
    serviceSlug: "academy",
    serviceLabel: "학원·교육 자동화",
    technologies: ["Next.js", "Turborepo", "OAuth2", "CI/CD"],
    context: "디자인 에이전트와 컴퓨터 기반 학습 시스템의 프론트엔드 개발을 담당했습니다. 콘텐츠 제작 도구 개발과 학습 서비스의 화면·인증·배포 기반을 각각 구축한 경험입니다.",
    implementations: [
      { title: "콘텐츠 제작 도구 연결", description: "Claude와 GPT를 활용하는 콘텐츠 저작도구의 스킬과 로컬 플러그인을 개발해 디자인 작업 자동화 기반을 마련했습니다." },
      { title: "학습 화면의 공통 구조", description: "Next.js의 서버·클라이언트 렌더링을 함께 사용하는 구조를 설계했습니다. Turborepo로 공통 UI·상태·API 패키지를 나누고 MUI·Emotion 기반 디자인 시스템을 구축했습니다." },
      { title: "로그인과 배포 환경", description: "OAuth2 기반 SSO 인증과 서버 렌더링 환경의 세션 처리를 구현했습니다. CI/CD와 공통 모듈로 개발·배포 환경을 정리했습니다." },
    ],
    result: "디자인 도구의 자동화 기반과 학습 서비스의 프론트엔드 구조를 구현했습니다. 공통 화면과 인증, 배포까지 이어지는 개발 환경을 함께 다뤘습니다.",
    diagram: [
      { title: "콘텐츠 제작", description: "저작도구 스킬 · 플러그인" },
      { title: "학습 화면", description: "Next.js · 공통 UI" },
      { title: "운영 기반", description: "SSO 인증 · CI/CD" },
    ],
    diagramConnected: false,
    application: {
      title: "학원에서 반복하는 자료 정리도 줄일 수 있을까요?",
      description: "교육 시스템 개발 경험을 바탕으로 원생·출결·수납 자료의 흐름부터 살펴볼 수 있습니다. 학원 수납 자동화는 상담 가능한 적용 예시이며, 위 경력의 구축 실적과는 구분합니다.",
      checks: ["사용 중인 학습·학원 관리 프로그램", "명단·출결·수납 자료의 저장 방식", "자동 정리할 항목과 담당자 확인 단계"],
    },
  },
  {
    slug: "ai-agent-data",
    category: "AI 에이전트 · 업무 데이터",
    title: "AI 에이전트와 내부 문서 검색",
    headline: "업무 문서와 도구를,\nAI의 실행 흐름에 연결합니다.",
    description: "AI 에이전트의 실행 흐름과 외부 도구 연동, 내부 문서 RAG, Python 데이터 처리 자동화와 모델 배포·모니터링 환경을 개발하고 있습니다.",
    period: "2026.06 — 현재",
    role: "팀장 · AI Agent 플랫폼 및 MLOps 개발",
    serviceSlug: "custom",
    serviceLabel: "맞춤 업무 자동화",
    technologies: ["LangGraph", "RAG", "Python", "MLflow"],
    context: "업무를 분석해 AI 에이전트의 시나리오를 구체화하고, 실행 흐름부터 외부 시스템 연결과 운영 환경까지 개발하고 있습니다. 사내 문서와 업무 데이터를 활용하는 검색 구조도 함께 다루고 있습니다.",
    implementations: [
      { title: "질의에 맞는 에이전트와 도구 연결", description: "의도 분류에 따른 에이전트 라우팅, Tool Calling과 상태 관리를 구현했습니다. LangGraph 기반 워크플로우와 MCP·A2A를 활용한 도구 연동·에이전트 협업 구조를 개발했습니다." },
      { title: "내부 문서 검색과 데이터 처리", description: "LLM·sLLM·임베딩 모델·벡터 DB를 연결하는 RAG 파이프라인을 구축했습니다. Python으로 데이터 수집·정제·적재 과정을 자동화했습니다." },
      { title: "모델의 배포와 운영 연결", description: "MLflow 기반 실험 추적과 모델 등록·배포·모니터링 환경을 구축했습니다. Docker·Kubernetes와 Argo Workflows를 이용해 학습·배포 자동화를 다뤘습니다." },
    ],
    result: "AI 에이전트와 업무 워크플로우를 연결하고, 내부 문서를 검색에 활용하는 기반을 마련했습니다. 모델 실험부터 배포·모니터링까지 운영 과정을 함께 구성한 경험입니다.",
    diagram: [
      { title: "문서 · 업무 데이터", description: "수집 · 정제 · 적재" },
      { title: "검색 · 에이전트", description: "RAG · 업무 워크플로우" },
      { title: "도구 · 운영 환경", description: "외부 시스템 연동 · 모니터링" },
    ],
    diagramConnected: true,
    application: {
      title: "사내 문서에서 답을 찾고, 반복 작업까지 이어갈 수 있을까요?",
      description: "문서 검색이나 보고 초안처럼 범위가 분명한 업무부터 검토할 수 있습니다. 실제 적용 전에는 자료 접근 권한, 답변의 근거와 담당자가 확인할 단계를 함께 정합니다.",
      checks: ["검색에 사용할 문서와 접근 가능한 범위", "연동할 업무 도구와 허용할 작업", "정확도를 확인할 질문·예외와 사람의 검토 단계"],
    },
  },
] as const satisfies readonly CaseStudy[];

export type CaseStudyEntry = (typeof CASE_STUDIES)[number];

export function findCaseStudy(slug: string) {
  return CASE_STUDIES.find(item => item.slug === slug);
}
