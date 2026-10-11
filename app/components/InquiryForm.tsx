"use client";

import { BRAND_NAME } from "@/lib/brand";
import { useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { CONSULTATION_DRAFT_KEY, readConsultationDraft, type DraftSource } from "@/lib/diagnosis";
import { ArrowRight, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { CONSULTATION_SERVICES as services } from "@/lib/service-catalog";
import { INQUIRY_BUDGETS as budgets, validateInquiry } from "@/lib/inquiry-validation";
import { encodeNetlifyConsultation, NETLIFY_FORM_ACTION, NETLIFY_FORM_NAME } from "@/lib/netlify-form";

const subscribeToBrowser = () => () => {};
const browserReady = () => true;
const serverReady = () => false;

export default function InquiryForm({ initialService = "아직 정하지 못했어요", prefillSource }: { initialService?: string; prefillSource?: DraftSource }) {
  const ready = useSyncExternalStore(subscribeToBrowser, browserReady, serverReady);
  const draft = useMemo(() => {
    if (!ready || !prefillSource) return null;
    try { return readConsultationDraft(sessionStorage.getItem(CONSULTATION_DRAFT_KEY), prefillSource); }
    catch { return null; }
  }, [ready, prefillSource]);
  if (prefillSource && !ready) return <div className="contact-form-wrap" role="status">상담 내용을 준비하고 있습니다.</div>;
  return <InquiryFields initialService={draft?.service ?? initialService} initialMessage={draft?.message ?? ""} prefillSource={draft?.source}/>;
}

function InquiryFields({ initialService, initialMessage, prefillSource }: { initialService: string; initialMessage: string; prefillSource?: DraftSource }) {
  const [selection, setSelection] = useState({ initialService, value: initialService });
  const service = selection.initialService === initialService ? selection.value : initialService;
  const [message, setMessage] = useState(initialMessage);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const startedAt = useRef(0);
  const requestId = useRef("");
  const formRef = useRef<HTMLFormElement>(null);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !consent) return;
    const data = new FormData(event.currentTarget);
    setLoading(true); setError("");
    try {
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const input = validateInquiry({ name: data.get("name"), email: data.get("email"), company: data.get("company"), service, budget: data.get("budget"), message: data.get("message"), consent, website: data.get("website"), startedAt: startedAt.current, requestId: requestId.current });
      const response = await fetch(NETLIFY_FORM_ACTION, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeNetlifyConsultation(input, startedAt.current),
      });
      if (!response.ok) throw new Error("상담 요청을 보내지 못했어요. 입력 내용은 그대로 남아 있으니 잠시 후 다시 시도해 주세요.");
      if (prefillSource) {
        try { sessionStorage.removeItem(CONSULTATION_DRAFT_KEY); } catch { /* The submitted form is already saved. */ }
      }
      setSubmitted(true);
    } catch (issue) { setError(issue instanceof Error && !(issue instanceof TypeError) && issue.message !== "Failed to fetch" ? issue.message : "서버에 연결하지 못했어요. 입력 내용은 그대로 남아 있으니 잠시 후 다시 시도해 주세요."); }
    finally { setLoading(false); }
  }

  return <div className="contact-form-wrap">{submitted ? <div className="form-success" role="status" aria-live="polite"><span className="success-icon"><Check size={32}/></span><span className="mini-label">첫 대화의 시작</span><h3>상담 요청을<br/>보냈습니다.</h3><p>남겨주신 내용을 확인하고 답변드리겠습니다.<br/>남겨주신 이메일로 프로젝트에 관한 대화를 이어갑니다.</p><p>상담에 입력한 이메일로 가입·인증하면 진행 상황을 확인할 수 있습니다. 접수 반영까지 잠시 걸릴 수 있습니다.</p><Link className="text-link" href="/requests">내 의뢰 진행 현황 <ArrowRight size={16}/></Link><button type="button" className="button button-dark" onClick={() => { setSubmitted(false); setConsent(false); setMessage(""); setError(""); requestId.current = ""; startedAt.current = Date.now(); }}>새 문의 작성 <ArrowRight size={18}/></button></div> : <form ref={formRef} name={NETLIFY_FORM_NAME} method="POST" action={NETLIFY_FORM_ACTION} data-netlify-honeypot="website" onSubmit={submitInquiry}><input type="hidden" name="form-name" value={NETLIFY_FORM_NAME}/><input type="hidden" name="requestId" ref={element => { if (element) { if (!requestId.current) requestId.current = crypto.randomUUID(); element.value = requestId.current; } }}/><div className="form-top"><h3>무료 상담 신청</h3><span><b>*</b> 필수 항목</span></div><div className="consultation-summary"><div><span>신청할 서비스</span><strong>{service === "아직 정하지 못했어요" ? "맞춤 업무 상담" : service}</strong></div><div className="consultation-fee"><span>상담료</span><strong>0원</strong></div><p>개발 범위와 비용은 상담 후 별도로 안내합니다.</p></div><div className="form-row"><label htmlFor="name">이름 <b>*</b><input id="name" name="name" placeholder="이름을 입력해 주세요" required minLength={2} maxLength={80} autoComplete="name"/></label><label htmlFor="company">회사 / 기관 <span className="optional">선택</span><input id="company" name="company" placeholder="회사, 학원, 병원 또는 팀 이름" maxLength={100} autoComplete="organization"/></label></div><label htmlFor="email">이메일 <b>*</b><input id="email" name="email" type="email" required maxLength={254} placeholder="답변받으실 이메일 주소" autoComplete="email"/></label><div className="form-row"><label htmlFor="service">상담 서비스 <b>*</b><span className="select-wrap"><select id="service" name="service" value={service} onChange={event => setSelection({ initialService, value: event.target.value })}>{services.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16}/></span></label><label htmlFor="budget">개발 예상 예산 <b>*</b><span className="select-wrap"><select id="budget" name="budget" defaultValue={budgets[0]}>{budgets.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16}/></span></label></div><label htmlFor="message">어떤 문제를 해결하고 싶으신가요? <b>*</b><textarea id="message" name="message" value={message} onChange={event => setMessage(event.target.value)} rows={prefillSource ? 8 : 4} minLength={20} maxLength={5000} required placeholder="반복하는 업무, 사용 중인 파일이나 프로그램, 희망 일정을 알려주세요. 예: 매일 주문 내역과 재고를 엑셀로 대조하고 있어요. (20자 이상)"/><span className="field-help">{prefillSource && <>진단·계산 내용을 미리 채웠습니다. 상황에 맞게 자유롭게 수정해 주세요.<br/></>}고객·환자 개인정보, 진료기록, 비밀번호 등 민감한 정보는 넣지 말아주세요.</span></label><div className="honeypot" aria-hidden="true"><label htmlFor="website">Website<input type="text" id="website" name="website" tabIndex={-1} autoComplete="off"/></label></div><input type="hidden" name="startedAt" ref={element => { if (element) { if (!startedAt.current) startedAt.current = Date.now(); element.value = String(startedAt.current); } }}/><div className="privacy-row"><label className="checkbox-label"><input type="checkbox" name="consent" value="true" checked={consent} onChange={event => setConsent(event.target.checked)} required/><span>개인정보 수집 및 이용에 동의합니다. <b>*</b></span></label><details className="privacy-details"><summary>내용 보기 <ChevronDown size={13}/></summary><div><strong>개인정보 수집·이용 안내</strong><p>수집 주체: {BRAND_NAME}(운영자: 최진원)<br/>목적: 프로젝트 문의 접수, 상담 응대 및 의뢰 진행 현황 제공<br/>필수 항목: 이름, 이메일, 관심 서비스, 예산, 문의 내용<br/>선택 항목: 회사 / 기관<br/>저장 및 이용: 입력하신 정보는 Netlify Forms와 Netlify Blobs에 저장되며 문의 응대와 의뢰 진행 현황 제공에 사용합니다.<br/>보관 기간: 진행 현황은 접수일로부터 1년간 보관한 뒤 자동 삭제합니다. 원본 상담은 Netlify 문의함에서 별도로 관리합니다.<br/>삭제 요청: <a href="mailto:abyys1004@naver.com">abyys1004@naver.com</a>으로 요청해 주세요.<br/>동의를 거부할 수 있으나, 동의하지 않으면 문의를 접수할 수 없습니다.</p></div></details></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark submit-button" type="submit" disabled={loading || !consent}>{loading ? "상담을 신청하고 있어요…" : "무료 상담 신청하기"}{loading ? <span className="loading-spinner"/> : <ArrowUpRight size={20}/>}</button><p className="form-footnote">상담 내용 확인 후, 남겨주신 이메일로 연락드립니다.</p></form>}</div>;
}
