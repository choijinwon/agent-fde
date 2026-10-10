export const INQUIRY_SERVICES = [
  "학원 운영 자동화", "엑셀·회계 자동화", "제조 ERP 자동화", "병원 운영 자동화", "기타 맞춤 자동화",
  "쇼핑몰·유통 자동화", "물류·재고 자동화", "매장 운영 자동화", "일반 사무·전문서비스 자동화",
  "AI 도입 진단", "맞춤형 AI PoC", "문서·지식 자동화", "서비스 구축·운영 개선", "아직 정하지 못했어요",
] as const;

export const INQUIRY_BUDGETS = [
  "협의 후 결정", "500만 원 미만", "500만~1,000만 원", "1,000만~3,000만 원", "3,000만 원 이상",
] as const;

export const MAX_REQUEST_BYTES = 24 * 1024;
export const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const RATE_LIMIT_MAX = 5;

export type InquiryInput = {
  name: string;
  email: string;
  company: string;
  service: (typeof INQUIRY_SERVICES)[number];
  budget: (typeof INQUIRY_BUDGETS)[number];
  message: string;
  consent: true;
  requestId: string;
};

export class InquiryError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "InquiryError";
    this.status = status;
  }
}

function getText(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string") throw new InquiryError(`${label}을(를) 확인해 주세요.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(normalized)) {
    throw new InquiryError(`${label}은(는) ${min}~${max}자로 입력해 주세요.`);
  }
  return normalized;
}

export function validateInquiry(value: unknown, now = Date.now()): InquiryInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InquiryError("문의 내용을 확인해 주세요.");
  }
  const data = value as Record<string, unknown>;
  if (data.website !== undefined && data.website !== "") {
    throw new InquiryError("요청을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (typeof data.startedAt !== "number" || !Number.isFinite(data.startedAt) || data.startedAt > now || now - data.startedAt < 1000 || now - data.startedAt > 24 * 60 * 60 * 1000) {
    throw new InquiryError("페이지를 새로고침한 뒤 문의 내용을 확인하고 다시 보내 주세요.");
  }
  const name = getText(data.name, "성함", 2, 80);
  const email = getText(data.email, "이메일", 3, 254).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new InquiryError("올바른 이메일 주소를 입력해 주세요.");
  const company = getText(data.company ?? "", "회사명", 0, 100);
  const message = getText(data.message, "프로젝트 내용", 20, 5000);
  if (typeof data.service !== "string" || !INQUIRY_SERVICES.includes(data.service as InquiryInput["service"])) {
    throw new InquiryError("관심 서비스를 선택해 주세요.");
  }
  if (typeof data.budget !== "string" || !INQUIRY_BUDGETS.includes(data.budget as InquiryInput["budget"])) {
    throw new InquiryError("예산 범위를 선택해 주세요.");
  }
  if (data.consent !== true) throw new InquiryError("개인정보 수집·이용에 동의해 주세요.");
  if (typeof data.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId)) {
    throw new InquiryError("접수 번호를 확인할 수 없습니다. 페이지를 새로고침해 주세요.");
  }
  return { name, email, company, message, service: data.service as InquiryInput["service"], budget: data.budget as InquiryInput["budget"], consent: true, requestId: data.requestId.toLowerCase() };
}

export function isAdminEmail(email: unknown, configuredEmail: unknown): boolean {
  return typeof email === "string" && typeof configuredEmail === "string" && configuredEmail.trim().length > 3 && email.trim().toLowerCase() === configuredEmail.trim().toLowerCase();
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new InquiryError("허용되지 않은 요청입니다.", 403);
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new InquiryError("허용되지 않은 요청입니다.", 403);
}

export async function readBoundedJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") throw new InquiryError("JSON 형식으로 보내 주세요.", 415);
  const length = request.headers.get("content-length");
  if (length && Number(length) > MAX_REQUEST_BYTES) throw new InquiryError("문의 내용이 너무 깁니다.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new InquiryError("문의 내용을 입력해 주세요.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new InquiryError("문의 내용이 너무 깁니다.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(data)); }
  catch { throw new InquiryError("문의 내용을 읽을 수 없습니다. 다시 입력해 주세요."); }
}
