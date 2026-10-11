"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useCommunityAuth } from "@/app/components/CommunityAuth";
import { REQUEST_STAGES, type CustomerRequest, type TrackedRequest } from "@/lib/request-types";

type RequestView = CustomerRequest & Partial<Pick<TrackedRequest, "email" | "name">>;
type Result = { requests: RequestView[]; email?: string; isAdmin?: boolean };
const date = (value: string) => new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date(value));
async function call<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(path, { method, credentials: "same-origin", cache: "no-store", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "의뢰를 불러오지 못했습니다. 잠시 후 다시 이용해 주세요.");
  return data as T;
}
function RequestCard({ item, manage, onChange }: { item: RequestView; manage: boolean; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try { await call(`/api/requests/${item.id}`, "PATCH", { stage: form.get("stage"), note: form.get("note"), updatedAt: item.updatedAt }); onChange(); }
    catch (issue) { setError(issue instanceof Error ? issue.message : "변경하지 못했습니다."); }
    finally { setBusy(false); }
  }
  async function deleteRecord() {
    setBusy(true); setError("");
    try { await call(`/api/requests/${item.id}`, "DELETE"); onChange(); }
    catch (issue) { setError(issue instanceof Error ? issue.message : "삭제하지 못했습니다."); }
    finally { setBusy(false); }
  }
  const active = REQUEST_STAGES.findIndex(stage => stage.value === item.stage);
  return <article className="request-card"><div className="request-card-top"><div><p className="request-reference">접수 {date(item.createdAt)} · {item.reference.slice(0, 8).toUpperCase()}</p><h2>{item.service}</h2>{manage && <p className="request-customer">{item.name} · {item.email}</p>}</div><span className="request-badge">{REQUEST_STAGES[active]?.label}</span></div>
    <ol className="request-timeline" aria-label="현재 진행 단계">{REQUEST_STAGES.map((stage, index) => <li key={stage.value} className={index <= active ? "reached" : ""} aria-current={index === active ? "step" : undefined}><span aria-hidden="true">{index < active ? "✓" : index + 1}</span>{stage.label}</li>)}</ol>
    {item.note && <div className="request-note"><p>워크오토에서 전하는 안내</p><div>{item.note}</div></div>}
    <p className="request-updated">최근 업데이트 {date(item.updatedAt)}</p>
    <details className="request-history"><summary>진행 기록 {item.history.length}건</summary><ul>{[...item.history].reverse().map((entry, index) => <li key={`${entry.at}-${index}`}><time dateTime={entry.at}>{date(entry.at)}</time><strong>{REQUEST_STAGES.find(stage => stage.value === entry.stage)?.label}</strong>{entry.note && <p>{entry.note}</p>}</li>)}</ul></details>
    {manage && <form className="request-edit" onSubmit={save} key={item.updatedAt}><h3>고객에게 보이는 진행 상황</h3><label>단계<select name="stage" defaultValue={item.stage}>{REQUEST_STAGES.map(stage => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label><label>안내 내용<textarea name="note" maxLength={1200} rows={3} defaultValue={item.note} placeholder="고객에게 전달할 다음 일정이나 안내를 입력해 주세요." /></label><p>이 안내와 변경 기록은 해당 고객에게 공개됩니다. 내부 메모나 다른 고객 정보는 입력하지 마세요.</p><button className="requests-primary" disabled={busy}>{busy ? "처리 중…" : "진행 상황 저장"}</button></form>}
    {manage && <div className="request-delete">{remove ? <><p>진행 현황과 저장된 개인정보를 삭제할까요? 되돌릴 수 없습니다. Netlify에 보관된 원본 상담은 별도로 삭제해야 합니다.</p><button type="button" disabled={busy} onClick={deleteRecord}>삭제하기</button><button type="button" disabled={busy} onClick={() => setRemove(false)}>취소</button></> : <button type="button" onClick={() => setRemove(true)}>진행 현황 삭제</button>}</div>}
    {error && <p role="alert" className="requests-error">{error}</p>}
  </article>;
}
export function RequestsClient({ manage = false }: { manage?: boolean }) {
  const { user, loading, available } = useCommunityAuth();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [loadedFor, setLoadedFor] = useState("");
  const userId = user?.id || "";
  useEffect(() => {
    if (!userId) return;
    let active = true;
    call<Result>(manage ? "/api/requests/manage" : "/api/requests").then(data => { if (active) { setResult(data); setError(""); setLoadedFor(userId); } }).catch(issue => { if (active) { setError(issue instanceof Error ? issue.message : "의뢰를 불러오지 못했습니다."); setResult(null); setLoadedFor(userId); } });
    return () => { active = false; };
  }, [userId, manage, revision]);
  if (loading) return <div className="requests-empty" role="status">회원 정보를 확인하고 있습니다.</div>;
  if (!user) return <div className="requests-empty"><span className="requests-lock" aria-hidden="true">↗</span><h2>내 의뢰는 나만 볼 수 있도록.</h2><p>{available ? "상담에 입력한 이메일로 로그인해 주세요. 이메일 인증을 완료한 계정에서만 진행 상황을 확인할 수 있습니다." : "회원 서비스 연결을 확인 중입니다. 잠시 후 다시 이용해 주세요."}</p>{available && <Link className="requests-primary" href={`/account/login?next=${encodeURIComponent(manage ? "/requests/manage" : "/requests")}`}>로그인 / 회원가입</Link>}<Link className="requests-text-link" href="/consultation">가입 없이 무료 상담 신청 →</Link></div>;
  if (loadedFor !== userId) return <div className="requests-empty" role="status">의뢰를 불러오고 있습니다.</div>;
  return <><div className="requests-toolbar"><p>{manage ? "인증된 운영자만 확인할 수 있습니다." : `${result?.email || "내 계정"}로 접수한 의뢰`}</p><button type="button" onClick={() => setRevision(value => value + 1)}>새로고침 ↻</button></div>{error && <p role="alert" className="requests-error">{error}</p>}{result && result.requests.length === 0 && <div className="requests-empty"><h2>{manage ? "새로 접수된 의뢰가 없습니다." : "아직 연결된 의뢰가 없습니다."}</h2><p>{manage ? "기능 도입 이후 정상 접수된 상담이 여기에 표시됩니다. 이전 상담과 스팸 분류된 접수는 Netlify 문의함에서 확인해 주세요." : "상담을 신청하셨다면 이메일 주소가 같은지 확인해 주세요. 접수 확인이 끝나면 이곳에 표시됩니다."}</p><Link className="requests-primary" href="/consultation">무료 상담 신청</Link></div>}<div className="request-list">{result?.requests.map(item => <RequestCard key={item.id} item={item} manage={manage} onChange={() => setRevision(value => value + 1)} />)}</div>{!manage && result?.isAdmin && <Link className="requests-text-link" href="/requests/manage">전체 의뢰 관리 →</Link>}{manage && <a className="requests-text-link" href="https://app.netlify.com/projects/agent-fde/forms" target="_blank" rel="noopener noreferrer">Netlify 원본 상담 문의함 ↗</a>}</>;
}
