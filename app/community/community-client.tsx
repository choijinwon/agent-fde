"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Flag, LockKeyhole, MessageCircle, PencilLine, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useCommunityAuth } from "@/app/components/CommunityAuth";
import { COMMUNITY_INDUSTRIES, type CommunityComment, type CommunityKind, type CommunityPost, type CommunityUser } from "@/lib/community-types";
import { PostCard, communityDate } from "./community-display";

export async function communityRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(path, { method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  return data as T;
}

function RequestError({ message }: { message: string }) {
  return message ? <p className="community-alert" role="alert">{message}</p> : null;
}

function AuthGate({ next, compact = false }: { next: string; compact?: boolean }) {
  const { loading, available } = useCommunityAuth();
  if (loading) return <div className="community-loading" role="status"><span className="community-spinner" aria-hidden="true" />회원 정보를 확인하고 있습니다.</div>;
  if (compact) return <div className="community-login-note"><p>{available ? "로그인하면 댓글로 경험과 의견을 나눌 수 있습니다." : "회원 기능을 연결하고 있습니다. 잠시 후 다시 방문해 주세요."}</p>{available ? <Link className="community-secondary" href={`/account/login?next=${encodeURIComponent(next)}`}>로그인 / 회원가입</Link> : <Link className="community-secondary" href="/consultation">개별 상담 신청</Link>}</div>;
  return <div className="community-empty"><span className="community-empty-icon"><LockKeyhole size={25} strokeWidth={1.5} aria-hidden="true" /></span><h2>{available ? "이야기를 나누기 전에, 로그인." : "회원 기능을 연결하고 있습니다."}</h2><p>{available ? <>이메일로 가입하고 질문과 경험을 남겨보세요.<br />글을 읽거나 무료 상담을 신청할 때는 가입하지 않아도 됩니다.</> : <>지금은 글을 작성할 수 없습니다.<br />공개 게시글을 둘러보거나 무료 상담을 이용해 주세요.</>}</p>{available ? <Link className="community-primary" href={`/account/login?next=${encodeURIComponent(next)}`}>로그인 / 회원가입<ArrowUpRight size={15} aria-hidden="true" /></Link> : <Link className="community-secondary" href="/consultation">무료 상담 신청<ArrowUpRight size={15} aria-hidden="true" /></Link>}</div>;
}

export function CommunityCompose({ initialKind }: { initialKind: CommunityKind }) {
  const { user, loading } = useCommunityAuth();
  const [kind, setKind] = useState<CommunityKind>(initialKind);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const { post } = await communityRequest<{ post: CommunityPost }>("/api/community/posts", "POST", { kind, industry: form.get("industry"), title: form.get("title"), body: form.get("body"), consent: form.get("consent") === "on", website: form.get("website") ?? "" });
      router.push(`/community/${post.id}`);
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "글을 등록하지 못했습니다. 다시 시도해 주세요.");
      setPending(false);
    }
  }

  if (loading || !user) return <AuthGate next={`/community/new?kind=${initialKind}`} />;
  return <div className="community-form-panel"><form onSubmit={submit} className="community-compose-form">
    <div className="community-form-grid"><label>게시판<select name="kind" value={kind} onChange={(event) => setKind(event.target.value as CommunityKind)}><option value="question">자동화 질문</option><option value="case">활용 사례</option></select></label><label>업종<select name="industry" required defaultValue=""><option value="" disabled>어떤 업무인가요?</option>{COMMUNITY_INDUSTRIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
    <label>제목<input name="title" placeholder={kind === "case" ? "어떤 일을 자동화했나요?" : "어떤 반복 업무가 고민인가요?"} required minLength={5} maxLength={120} autoComplete="off" /><span className="community-form-hint">다른 사람도 이해할 수 있도록 구체적으로 적어주세요. (5~120자)</span></label>
    <label>내용<textarea name="body" required minLength={20} maxLength={8000} placeholder={kind === "case" ? "기존에 하던 업무, 바꾼 방법, 달라진 점을 알려주세요. 직접 경험한 내용을 나누면 더 도움이 됩니다." : "지금 하는 업무와 사용하는 도구, 반복되는 과정, 가장 불편한 점을 알려주세요. 정리된 요구사항이 없어도 괜찮습니다."} /><span className="community-form-hint">20~8,000자 · {user.name} 이름으로 공개됩니다.</span></label>
    <div className="honeypot" aria-hidden="true"><label>웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="community-guideline-note"><ShieldCheck size={17} aria-hidden="true" /><p>게시글은 누구나 볼 수 있으며 검색에 노출될 수 있습니다. 고객·환자·학생의 이름, 연락처, 계정 정보, 회사 기밀은 제외해 주세요.</p></div>
    <label className="community-confirm-label"><input type="checkbox" name="consent" required /><span><Link className="community-inline-link" href="/community/guide" target="_blank" rel="noopener noreferrer">커뮤니티 이용 안내</Link>를 확인했으며, 개인정보를 제외한 내용을 공개하는 데 동의합니다.</span></label>
    <RequestError message={error} />
    <div className="community-form-bottom"><Link className="community-text-button" href={`/community?kind=${kind}`}>취소</Link><button type="submit" className="community-primary" disabled={pending}>{pending ? "등록하고 있습니다…" : kind === "case" ? "사례 공개하기" : "질문 공개하기"}<PencilLine size={15} aria-hidden="true" /></button></div>
  </form></div>;
}

function ReportAction({ targetType, targetId, postId }: { targetType: "post" | "comment"; targetId: string; postId: string }) {
  const { user } = useCommunityAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function report(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      await communityRequest("/api/community/reports", "POST", { targetType, targetId, postId, reason: data.get("reason"), details: data.get("details") });
      setSent(true); setOpen(false);
    } catch (issue) { setError(issue instanceof Error ? issue.message : "신고를 접수하지 못했습니다."); }
    finally { setPending(false); }
  }
  if (sent) return <p className="community-notice" role="status">신고가 접수되었습니다. 관리자가 확인하겠습니다.</p>;
  return <div className="community-report-action">{user ? <button type="button" className="community-text-button" aria-expanded={open} onClick={() => setOpen(!open)}><Flag size={12} aria-hidden="true" />신고</button> : <Link className="community-text-button" href={`/account/login?next=${encodeURIComponent(`/community/${postId}`)}`}><Flag size={12} aria-hidden="true" />신고</Link>}{open && <form onSubmit={report} className="community-inline-panel"><label>신고 사유<select name="reason" defaultValue="spam"><option value="spam">광고·스팸</option><option value="abuse">욕설·혐오·괴롭힘</option><option value="privacy">개인정보 노출</option><option value="other">기타</option></select></label><label>상세 내용 (선택)<textarea name="details" maxLength={1000} placeholder="확인이 필요한 내용을 알려주세요." /></label><RequestError message={error} /><div className="community-form-bottom"><button className="community-text-button" type="button" onClick={() => setOpen(false)} disabled={pending}>취소</button><button className="community-secondary" type="submit" disabled={pending}>{pending ? "접수 중…" : "신고 접수"}</button></div></form>}</div>;
}

export function DeletePostButton({ postId, onDeleted }: { postId: string; onDeleted?: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function remove() {
    if (pending) return;
    setPending(true); setError("");
    try {
      await communityRequest(`/api/community/posts/${postId}`, "DELETE");
      if (onDeleted) onDeleted(); else { router.push("/account"); router.refresh(); }
    } catch (issue) { setError(issue instanceof Error ? issue.message : "글을 삭제하지 못했습니다."); setPending(false); }
  }
  return <div>{confirm ? <div className="community-inline-panel"><p>이 글을 삭제할까요? 공개 목록에서 사라지며 되돌릴 수 없습니다.</p><RequestError message={error} /><div className="community-form-bottom"><button className="community-text-button" type="button" onClick={() => setConfirm(false)} disabled={pending}>유지하기</button><button className="community-secondary community-text-danger" type="button" onClick={remove} disabled={pending}>{pending ? "삭제 중…" : "삭제하기"}</button></div></div> : <button className="community-text-button community-text-danger" type="button" onClick={() => setConfirm(true)}><Trash2 size={12} aria-hidden="true" />글 삭제</button>}</div>;
}

export function PostActions({ post }: { post: CommunityPost }) {
  const { user } = useCommunityAuth();
  return <div className="community-article-actions"><ReportAction targetType="post" targetId={post.id} postId={post.id} />{user?.id === post.authorId && <DeletePostButton postId={post.id} />}</div>;
}

export function CommunityComments({ postId, comments }: { postId: string; comments: CommunityComment[] }) {
  const { user, loading } = useCommunityAuth();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError(""); setNotice("");
    try {
      await communityRequest(`/api/community/posts/${postId}/comments`, "POST", { body, website: form.get("website") ?? "" });
      setBody(""); setNotice("댓글이 등록되었습니다."); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "댓글을 등록하지 못했습니다."); }
    finally { setPending(false); }
  }
  return <section className="community-comments" aria-labelledby="comments-heading"><h2 id="comments-heading">댓글 <span>{comments.length}</span></h2>{comments.length ? comments.map((comment) => <article className="community-comment" key={comment.id}><div className="community-comment-meta"><UserRound size={14} aria-hidden="true" /><strong>{comment.authorName}</strong><time dateTime={comment.createdAt}>{communityDate(comment.createdAt)}</time></div><p className="community-comment-body">{comment.body}</p><div className="community-comment-actions"><ReportAction targetType="comment" targetId={comment.id} postId={postId} /></div></article>) : <p className="community-comments-empty">아직 댓글이 없습니다. 도움이 되는 경험이나 의견을 남겨주세요.</p>}{!loading && user ? <form className="community-comment-form" onSubmit={submit}><label htmlFor="community-comment-body">{user.name}님의 댓글</label><textarea id="community-comment-body" name="body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="서로의 업무에 도움이 되는 이야기를 나눠주세요." required minLength={2} maxLength={2000} /><div className="honeypot" aria-hidden="true"><label>웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label></div><RequestError message={error} />{notice && <p className="community-notice" role="status">{notice}</p>}<div className="community-form-bottom"><p>개인정보는 제외하고 작성해 주세요.</p><button className="community-primary" disabled={pending} type="submit">{pending ? "등록 중…" : "댓글 등록"}</button></div></form> : <AuthGate compact next={`/community/${postId}`} />}</section>;
}

export function CommunityAccount() {
  const { user, loading, logout } = useCommunityAuth();
  if (loading || !user) return <AuthGate next="/account" />;
  return <CommunityAccountContent key={user.id} user={user} logout={logout} />;
}

function CommunityAccountContent({ user, logout }: { user: CommunityUser; logout: () => Promise<void> }) {
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [expired, setExpired] = useState(false);
  const userId = user.id;
  useEffect(() => {
    let active = true;
    communityRequest<{ user: CommunityUser | null; posts: CommunityPost[] }>("/api/community/me", "GET").then((result) => { if (!active) return; if (!result.user || result.user.id !== userId) { setExpired(true); return; } setPosts(result.posts); }).catch((issue) => { if (active) setError(issue instanceof Error ? issue.message : "내 글을 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [userId]);
  async function signOut() {
    setLoggingOut(true); setError("");
    try { await logout(); setPosts(null); } catch { setError("로그아웃하지 못했습니다. 다시 시도해 주세요."); } finally { setLoggingOut(false); }
  }
  if (expired) return <div className="community-empty"><span className="community-empty-icon"><LockKeyhole size={25} aria-hidden="true" /></span><h2>로그인을 다시 확인해 주세요.</h2><p>세션이 만료되었거나 이메일 인증이 필요합니다.<br />가입한 이메일을 인증한 후 다시 로그인해 주세요.</p><RequestError message={error} /><button className="community-primary" type="button" onClick={signOut} disabled={loggingOut}>{loggingOut ? "확인 중…" : "다시 로그인하기"}</button></div>;
  return <><section className="community-account-info"><div className="community-account-person"><span className="community-account-avatar"><UserRound size={23} strokeWidth={1.5} aria-hidden="true" /></span><div><strong>{user.name}님</strong><p>{user.email}</p></div></div><button className="community-text-button" type="button" disabled={loggingOut} onClick={signOut}>{loggingOut ? "로그아웃 중…" : "로그아웃"}</button></section><div className="community-account-heading"><h2>내가 나눈 이야기</h2><Link href="/community/new">글쓰기<PencilLine size={14} aria-hidden="true" /></Link></div><RequestError message={error} />{!posts && !error ? <div className="community-loading" role="status"><span className="community-spinner" aria-hidden="true" />내 글을 불러오고 있습니다.</div> : posts?.length ? <div className="community-posts">{posts.map((post) => <PostCard key={post.id} post={post}><div className="community-account-post-actions"><DeletePostButton postId={post.id} onDeleted={() => setPosts((current) => current?.filter((item) => item.id !== post.id) ?? [])} /></div></PostCard>)}</div> : !error ? <div className="community-empty"><span className="community-empty-icon"><MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" /></span><h2>아직 작성한 글이 없습니다.</h2><p>자동화하고 싶은 업무가 있나요?<br />첫 질문을 남겨보세요.</p><Link className="community-primary" href="/community/new">질문 남기기<PencilLine size={15} aria-hidden="true" /></Link></div> : null}{user.isAdmin && <div className="community-account-heading"><Link href="/community/manage">신고 및 게시글 관리<ArrowUpRight size={14} aria-hidden="true" /></Link></div>}</>;
}
