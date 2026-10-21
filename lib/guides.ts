import type { ServiceSlug } from "./service-catalog";

export type GuideSection = {
  id: string;
  title: string;
  paragraphs?: readonly string[];
  checklist?: readonly { label: string; text: string }[];
  table?: { caption: string; columns: readonly string[]; rows: readonly (readonly string[])[] };
  quote?: { label: string; text: string };
  after?: readonly string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  relatedServiceSlugs: readonly ServiceSlug[];
  introduction: string;
  sections: readonly GuideSection[];
  faqs: readonly { question: string; answer: string }[];
  nextStep: { title: string; description: string; href: string; label: string; note: string };
};

export const GUIDES = [
  {
    slug: "excel-automation-cost",
    title: "엑셀 자동화 외주·개발 비용, 견적 전에 정할 범위",
    description: "엑셀 자동화 견적을 준비하는 입력·규칙·출력·예외·검수 체크리스트입니다. 범위 비교표와 복사해서 쓸 수 있는 문의 예문으로 필요한 작업을 정리해 보세요.",
    category: "자동화 상담 준비",
    publishedAt: "2026-10-21",
    updatedAt: "2026-10-21",
    relatedServiceSlugs: ["excel-accounting", "academy", "manufacturing"],
    introduction: "엑셀 자동화 개발 비용을 문의할 때는 파일 개수보다 ‘어디까지 자동으로 처리할 것인가’를 먼저 설명하는 것이 좋습니다. 자료를 합치는 작업과 다른 시스템에 결과를 입력하는 작업은 확인할 조건이 다릅니다. 다음 항목을 적으면 필요한 범위를 구체적으로 이야기할 수 있습니다.",
    sections: [
      {
        id: "scope",
        title: "입력·규칙·출력·예외·검수를 정하세요",
        checklist: [
          { label: "입력", text: "파일을 어디에서 받고, 어떤 형식이며, 얼마나 자주 받나요?" },
          { label: "규칙", text: "같은 거래를 구분하는 번호와 합계·분류 기준은 무엇인가요?" },
          { label: "출력", text: "정리된 엑셀, 보고서, 시스템 입력 중 무엇이 필요한가요?" },
          { label: "예외", text: "빈 값, 중복, 취소·환불, 바뀐 양식은 어떻게 확인하나요?" },
          { label: "검수", text: "어떤 샘플과 정답을 비교하고, 누가 완료 여부를 확인하나요?" },
        ],
        after: ["답을 모르는 항목은 ‘확인 필요’로 남겨도 됩니다. 모든 규칙을 미리 완성할 필요는 없습니다."],
      },
      {
        id: "comparison",
        title: "견적은 같은 범위끼리 비교하세요",
        table: {
          caption: "자동화 범위별로 견적에서 확인할 내용",
          columns: ["비교 항목", "파일 정리까지", "시스템 반영까지"],
          rows: [
            ["결과물", "통합표·검토 목록", "입력 결과·처리 이력"],
            ["확인 사항", "양식과 집계 기준", "연동 기능·권한·중복 방지"],
            ["오류 처리", "확인할 행 표시", "실패 기록과 재처리 방법"],
          ],
        },
        after: ["개발비 외에 설치·설명, 수정 요청, 양식 변경 대응과 운영 지원이 어디까지 포함되는지도 확인하세요. 위 구분은 가격표가 아니라 범위를 비교하는 기준입니다."],
      },
      {
        id: "inquiry",
        title: "이 문장으로 문의해 보세요",
        quote: {
          label: "복사해서 사용하는 문의 예문",
          text: "[업무]를 [주기]마다 처리합니다. 입력 자료는 [파일 종류]이고, 현재 [수작업 순서]를 거쳐 [결과물]을 만듭니다. [취소·중복 등 예외]는 담당자가 확인합니다. 먼저 [자동화할 단계]까지 가능한지 상담받고 싶습니다. 개인정보를 제거한 예시 양식은 준비할 수 있습니다.",
        },
      },
    ],
    faqs: [
      { question: "파일을 보내야 견적 상담이 가능한가요?", answer: "첫 상담은 업무 순서와 원하는 결과를 설명하는 것으로 시작할 수 있습니다. 자료가 필요하면 개인정보를 제거한 예시와 항목 구조부터 확인합니다." },
      { question: "전체 업무를 한 번에 맡겨야 하나요?", answer: "자료 취합이나 검토표 생성처럼 범위가 분명한 한 단계부터 논의할 수 있습니다. 구현 가능 범위와 비용은 사용하는 자료·프로그램을 확인한 뒤 안내합니다." },
    ],
    nextStep: {
      title: "내 업무의 범위도 정리해 볼까요?",
      description: "사용하는 파일과 반복하는 순서, 원하는 결과부터 알려주세요.",
      href: "/consultation?service=excel-accounting",
      label: "엑셀 자동화 상담 신청",
      note: "첫 상담 무료 · 개발 비용은 범위 확인 후 별도 안내",
    },
  },
  {
    slug: "ai-beginner-practice",
    title: "AI 기초 교육, 초보자가 처음 배우는 순서와 연습",
    description: "AI를 처음 배우는 분을 위한 안내문 작성 실습입니다. 목표 정하기, 질문 개선, 원문 대조를 따라 하며 개인정보 없이 연습하는 방법을 알아보세요.",
    category: "AI 첫 실습",
    publishedAt: "2026-10-21",
    updatedAt: "2026-10-21",
    relatedServiceSlugs: [],
    introduction: "AI를 처음 배울 때는 도구를 많이 익히기보다 작은 결과물 하나를 직접 만들고 확인해 보세요. 이 글에서는 개인정보가 없는 예시로 안내문을 작성하며, 목표 정하기 → 질문 다듬기 → 원문 대조하기를 연습합니다.",
    sections: [
      {
        id: "goal",
        title: "오늘 만들 결과물 하나를 고르세요",
        paragraphs: [
          "‘AI를 잘 쓰기’보다 ‘독서 모임 안내문을 짧게 쓰기’처럼 끝을 확인할 수 있는 목표가 좋습니다. 누구에게 보여줄지, 반드시 들어갈 내용과 원하는 길이를 먼저 적어보세요.",
          "연습 자료는 직접 만든 가상의 일정으로 준비합니다. 실제 고객 명단, 연락처, 계좌 정보나 공개할 수 없는 업무 자료는 넣지 않습니다. 이름을 지워도 사람을 알아볼 수 있는 내용이 남았는지 확인하세요.",
        ],
      },
      {
        id: "questions",
        title: "같은 질문에 조건을 더해 보세요",
        paragraphs: ["먼저 ‘독서 모임 안내문을 써줘’라고 요청합니다. 다음에는 아래처럼 바꿔 결과를 비교해 보세요."],
        quote: {
          label: "가상 자료로 연습하는 질문 예문",
          text: "처음 참여하는 사람에게 보낼 안내문을 5줄로 작성해 줘. 다음은 가상 연습 자료야: 토요일 오후 2시, 모임방, 준비물은 책과 질문 한 가지. 이 정보만 사용하고, 빠진 내용은 지어내지 말고 마지막에 질문으로 적어 줘.",
        },
        after: ["두 결과에서 표현, 길이, 빠진 정보가 어떻게 달라졌는지 적습니다. 마음에 들지 않는 부분은 ‘더 좋게’ 대신 ‘준비물을 별도 줄로 보여줘’처럼 구체적으로 수정해 보세요."],
      },
      {
        id: "verification",
        title: "원문과 비교한 뒤 완성하세요",
        paragraphs: [
          "작성된 문장을 읽기 전에 원자료를 옆에 놓습니다. 날짜·시간·장소·준비물이 모두 맞는지, 없던 비용이나 신청 방법이 추가되지 않았는지 확인하세요. 틀린 부분은 고치고, 실제로 전달할 내용인지 마지막으로 직접 판단합니다.",
          "완성한 글과 사용한 질문을 함께 저장하면 다음 연습에서 바꿀 조건을 찾기 쉽습니다.",
        ],
      },
    ],
    faqs: [
      { question: "유료 도구를 먼저 구독해야 하나요?", answer: "만들고 싶은 결과물과 필요한 기능부터 정하세요. 사용할 도구의 현재 이용 조건을 확인하고, 수업에 필요한 계정·비용은 시작 전에 안내받으면 됩니다." },
      { question: "몇 번 질문했는데도 답이 아쉬우면요?", answer: "원하는 결과의 예시를 짧게 보여주거나, 한 번에 요청한 일을 나눠보세요. 정보가 부족한지와 원자료가 정확한지도 함께 확인합니다." },
    ],
    nextStep: {
      title: "직접 해보며 배우고 싶다면",
      description: "지금의 경험과 AI로 만들고 싶은 결과물을 알려주세요.",
      href: "/consultation?service=ai-education",
      label: "AI 교육 상담 신청",
      note: "첫 상담 무료 · 교육 일정과 비용은 상담 후 별도 안내",
    },
  },
] as const satisfies readonly Guide[];

export function findGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find(guide => guide.slug === slug);
}

export function formatGuideDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}
