import { SERVICE_CATALOG, type ServiceSlug } from "./service-catalog";

export const DIAGNOSIS_TASKS = [
  { value: "collect", label: "여러 파일 취합·정리", detail: "자료를 모으고 같은 양식으로 옮겨요", suggestion: "흩어진 자료를 같은 양식으로 모으기", steps: ["파일마다 다른 열과 항목을 맞춥니다.", "중복·누락 후보를 별도로 표시합니다.", "정해진 양식으로 취합한 뒤 담당자가 확인합니다."] },
  { value: "compare", label: "금액·수량 대조", detail: "두 자료를 비교하고 차이를 찾아요", suggestion: "차이가 있는 항목부터 확인하기", steps: ["날짜·품목·금액 등 대조 기준을 정합니다.", "맞지 않는 항목과 예외 사유를 모읍니다.", "담당자가 확인한 결과만 최종 반영합니다."] },
  { value: "report", label: "정기 보고서 작성", detail: "매번 같은 표와 보고서를 만들어요", suggestion: "정기 보고서의 초안 만들기", steps: ["기존 보고서 양식과 집계 기준을 확인합니다.", "필요한 자료를 모아 표와 초안을 만듭니다.", "집계 결과를 검토하고 보고서를 확정합니다."] },
  { value: "entry", label: "프로그램 간 반복 입력", detail: "같은 내용을 여러 번 입력해요", suggestion: "도구 사이의 반복 입력 줄이기", steps: ["연결할 프로그램의 API·파일 제공 범위를 확인합니다.", "필수 항목과 예외 처리 기준을 맞춥니다.", "작은 범위로 테스트한 뒤 확인 절차를 두고 연결합니다."] },
  { value: "schedule", label: "일정·진행 현황 확인", detail: "예약·마감·업무 상태를 자주 확인해요", suggestion: "확인이 필요한 일부터 모아보기", steps: ["기준이 되는 일정과 상태값을 정리합니다.", "누락·중복·변경이 있는 확인 목록을 만듭니다.", "담당자 확인 후 일정이나 상태에 반영합니다."] },
  { value: "notice", label: "안내 문구·문서 준비", detail: "비슷한 내용의 문서를 반복 작성해요", suggestion: "반복 문서와 안내의 초안 준비하기", steps: ["사용하는 문구와 문서 양식을 모읍니다.", "정해진 항목을 넣어 초안을 준비합니다.", "대상과 내용을 담당자가 확인한 뒤 공유합니다."] },
] as const;

export const DIAGNOSIS_TOOLS = [
  { value: "excel", label: "엑셀·CSV 파일" },
  { value: "sheets", label: "구글 스프레드시트" },
  { value: "erp", label: "ERP·업종 전용 프로그램" },
  { value: "web", label: "웹사이트·관리자 페이지" },
  { value: "documents", label: "문서·이메일" },
  { value: "mixed", label: "여러 도구를 함께 사용" },
  { value: "unknown", label: "아직 잘 모르겠어요" },
] as const;

export const DIAGNOSIS_FREQUENCIES = [
  { value: "daily", label: "매일 반복해요" },
  { value: "weekly", label: "매주 반복해요" },
  { value: "monthly", label: "매월 반복해요" },
  { value: "irregular", label: "필요할 때마다 해요" },
] as const;

export type DiagnosisAnswers = {
  industry: ServiceSlug;
  task: (typeof DIAGNOSIS_TASKS)[number]["value"];
  tool: (typeof DIAGNOSIS_TOOLS)[number]["value"];
  frequency: (typeof DIAGNOSIS_FREQUENCIES)[number]["value"];
};

export type SavingsInput = { minutes: number; timesPerWeek: number; people: number; automationPercent: number };
export const SAVINGS_LIMITS = {
  minutes: { min: 1, max: 480, label: "한 번에 걸리는 시간" },
  timesPerWeek: { min: 1, max: 100, label: "한 사람이 일주일에 반복하는 횟수" },
  people: { min: 1, max: 1000, label: "같은 업무를 하는 사람 수" },
  automationPercent: { min: 0, max: 100, label: "줄일 수 있다고 가정할 비율" },
} as const;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function validateDiagnosis(value: unknown): DiagnosisAnswers | null {
  const data = record(value);
  if (!data || !SERVICE_CATALOG.some(item => item.slug === data.industry) || !DIAGNOSIS_TASKS.some(item => item.value === data.task) || !DIAGNOSIS_TOOLS.some(item => item.value === data.tool) || !DIAGNOSIS_FREQUENCIES.some(item => item.value === data.frequency)) return null;
  return { industry: data.industry, task: data.task, tool: data.tool, frequency: data.frequency } as DiagnosisAnswers;
}

export function calculateSavings(value: unknown) {
  const data = record(value);
  if (!data) throw new Error("계산할 값을 입력해 주세요.");
  for (const key of Object.keys(SAVINGS_LIMITS) as (keyof SavingsInput)[]) {
    const number = data[key];
    const limit = SAVINGS_LIMITS[key];
    if (typeof number !== "number" || !Number.isFinite(number) || !Number.isInteger(number) || number < limit.min || number > limit.max) throw new Error(`${limit.label}: ${limit.min}~${limit.max} 사이의 정수로 입력해 주세요.`);
  }
  const { minutes, timesPerWeek, people, automationPercent } = data as SavingsInput;
  if (minutes * timesPerWeek > 7 * 24 * 60) throw new Error("1인 기준 주간 업무 시간이 168시간을 넘습니다. 시간과 반복 횟수를 다시 확인해 주세요.");
  const weeklyHours = minutes * timesPerWeek * people / 60;
  const monthlyHours = weeklyHours * 52 / 12;
  const monthlySavedHours = monthlyHours * (automationPercent / 100);
  return { weeklyHours, monthlyHours, monthlySavedHours, monthlyRemainingHours: monthlyHours - monthlySavedHours, yearlySavedHours: monthlySavedHours * 12 };
}

export function diagnosisResult(input: DiagnosisAnswers) {
  const answers = validateDiagnosis(input);
  if (!answers) throw new Error("선택 내용을 다시 확인해 주세요.");
  const industry = SERVICE_CATALOG.find(item => item.slug === answers.industry)!;
  const task = DIAGNOSIS_TASKS.find(item => item.value === answers.task)!;
  const tool = DIAGNOSIS_TOOLS.find(item => item.value === answers.tool)!;
  const frequency = DIAGNOSIS_FREQUENCIES.find(item => item.value === answers.frequency)!;
  return { industry, task, tool, frequency, message: `[1분 자동화 진단]\n업종: ${industry.title}\n반복 업무: ${task.label}\n사용 도구: ${tool.label}\n반복 빈도: ${frequency.label}\n\n상담하고 싶은 방향: ${task.suggestion}\n실제 연동 가능 범위와 검토가 필요한 단계를 함께 확인하고 싶습니다.` };
}

export const CONSULTATION_DRAFT_KEY = "workauto.consultation-draft.v1";
export const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;
export type DraftSource = "diagnosis" | "calculator";
type ConsultationDraft = { version: 1; createdAt: number } & ({ source: "diagnosis"; answers: DiagnosisAnswers } | { source: "calculator"; inputs: SavingsInput });

export function createDiagnosisDraft(answers: DiagnosisAnswers, now = Date.now()): string {
  const validated = validateDiagnosis(answers);
  if (!validated) throw new Error("진단 내용을 다시 확인해 주세요.");
  return JSON.stringify({ version: 1, source: "diagnosis", createdAt: now, answers: validated } satisfies ConsultationDraft);
}

export function createCalculatorDraft(inputs: SavingsInput, now = Date.now()): string {
  calculateSavings(inputs);
  const { minutes, timesPerWeek, people, automationPercent } = inputs;
  return JSON.stringify({ version: 1, source: "calculator", createdAt: now, inputs: { minutes, timesPerWeek, people, automationPercent } } satisfies ConsultationDraft);
}

export function readConsultationDraft(raw: string | null, source: DraftSource, now = Date.now()) {
  if (!raw || raw.length > 2048) return null;
  try {
    const data = record(JSON.parse(raw));
    if (!data || data.version !== 1 || data.source !== source || typeof data.createdAt !== "number" || !Number.isFinite(data.createdAt) || data.createdAt > now || now - data.createdAt > DRAFT_TTL_MS) return null;
    if (source === "diagnosis") {
      const answers = validateDiagnosis(data.answers);
      if (!answers) return null;
      const result = diagnosisResult(answers);
      return { source, createdAt: data.createdAt, service: result.industry.service, message: result.message };
    }
    const result = calculateSavings(data.inputs);
    const inputs = data.inputs as SavingsInput;
    return { source, createdAt: data.createdAt, service: "아직 정하지 못했어요", message: `[절감 시간 계산]\n1인 기준 업무 1회: ${inputs.minutes}분\n1인 기준 주간 반복: ${inputs.timesPerWeek}회\n동일 업무 인원: ${inputs.people}명\n절감 비율 가정: ${inputs.automationPercent}%\n월 예상 절감 시간: 약 ${result.monthlySavedHours.toFixed(1)}시간\n\n연 52주를 월평균으로 환산한 단순 계산이며, 실제 절감 시간은 구현 범위와 검토 시간에 따라 달라집니다. 자동화 가능한 범위를 상담하고 싶습니다.` };
  } catch { return null; }
}
