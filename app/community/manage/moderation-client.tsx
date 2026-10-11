"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { useCommunityAuth } from "@/app/components/CommunityAuth";
import type { CommunityComment, CommunityPost, CommunityReport } from "@/lib/community-types";
import { communityRequest } from "../community-client";
import { communityDate } from "../community-display";

type ModerationData = { reports: CommunityReport[]; posts: CommunityPost[]; comments: CommunityComment[] };
const reportReasons = { spam: "광고·스팸", abuse: "욕설·혐오·괴롭힘", privacy: "개인정보 노출", other: "기타" };

export function CommunityModeration() {
  const { user, loading } = useCommunityAuth();
  if (loading) return <div className="community-loading" role="status"><span className="community-spinner" aria-hidden="true" />회원 정보를 확인하고 있습니다.</div>;
  if (!user?.isAdmin) return <div className="community-empty"><span className="community-empty-icon"><ShieldCheck size={25} aria-hidden="true" /></span><h2>관리자 전용 공간입니다.</h2><p>운영 권한이 있는 계정으로 로그인해 주세요.</p><Link className="community-secondary" href="/account/login?next=%2Fcommunity%2Fmanage">로그인 화면으로</Link></div>;
  return <ModerationContent key={user.id} />;
}

function ModerationContent() {
  const [data, setData] = useState<ModerationData | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"reports" | "posts" | "comments">("reports");
  useEffect(() => {
    let active = true;
    communityRequest<ModerationData>("/api/community/admin", "GET").then((result) => { if (active) setData(result); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "관리 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, []);
  async function moderate(targetType: "post" | "comment", targetId: string, postId: string, action: "hide" | "restore") {
    if (pending) return;
    setPending(targetId); setError(""); setNotice("");
    try {
      await communityRequest("/api/community/admin/moderate", "POST", { targetType, targetId, postId, action });
      const next = await communityRequest<ModerationData>("/api/community/admin", "GET");
      setData(next); setNotice(action === "hide" ? "공개 화면에서 숨겼습니다." : "다시 공개했습니다.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "처리하지 못했습니다. 다시 시도해 주세요."); }
    finally { setPending(""); }
  }
  function actionButton(type: "post" | "comment", item: CommunityPost | CommunityComment) {
    return <button type="button" className="community-secondary" disabled={Boolean(pending)} onClick={() => moderate(type, item.id, "postId" in item ? item.postId : item.id, item.status === "hidden" ? "restore" : "hide")}>{pending === item.id ? "처리 중…" : item.status === "hidden" ? "다시 공개" : "숨기기"}</button>;
  }
  if (!data) return error ? <p className="community-alert" role="alert">{error}</p> : <div className="community-loading" role="status"><span className="community-spinner" aria-hidden="true" />관리 정보를 불러오고 있습니다.</div>;
  return <><div className="community-manage-tabs" role="group" aria-label="관리할 콘텐츠"><button type="button" aria-pressed={tab === "reports"} onClick={() => setTab("reports")}>신고 {data.reports.length}</button><button type="button" aria-pressed={tab === "posts"} onClick={() => setTab("posts")}>게시글 {data.posts.length}</button><button type="button" aria-pressed={tab === "comments"} onClick={() => setTab("comments")}>댓글 {data.comments.length}</button></div>{error && <p className="community-alert" role="alert">{error}</p>}{notice && <p className="community-notice" role="status">{notice}</p>}<div className="community-manage-list">{tab === "reports" ? data.reports.length ? data.reports.map((report) => {
    const target = report.targetType === "post" ? data.posts.find((post) => post.id === report.targetId) : data.comments.find((comment) => comment.id === report.targetId);
    return <article className="community-manage-card" key={report.id}><div className="community-post-labels"><span className="community-tag">{reportReasons[report.reason]}</span><span>{report.targetType === "post" ? "게시글" : "댓글"} 신고</span><time dateTime={report.createdAt}>{communityDate(report.createdAt)}</time></div>{target ? <><h2>{"title" in target ? target.title : `${target.authorName}님의 댓글`}</h2><p className="community-manage-body">{target.body}</p><p className="community-manage-detail">신고 내용: {report.details || "상세 내용 없음"}</p><div className="community-form-bottom"><span className="community-status-tag">{target.status === "hidden" ? "숨김 상태" : "공개 중"}</span>{actionButton(report.targetType, target)}</div></> : <p>삭제되었거나 확인할 수 없는 콘텐츠입니다.</p>}</article>;
  }) : <div className="community-empty"><h2>접수된 신고가 없습니다.</h2><p>새 신고가 들어오면 이곳에서 확인할 수 있습니다.</p></div> : (tab === "posts" ? data.posts : data.comments).length ? (tab === "posts" ? data.posts : data.comments).map((item) => <article className="community-manage-card" key={item.id}><div className="community-post-labels"><span>{item.authorName}</span><time dateTime={item.createdAt}>{communityDate(item.createdAt)}</time><span className="community-status-tag">{item.status === "hidden" ? "숨김 상태" : "공개 중"}</span></div><h2>{"title" in item ? item.title : "댓글"}</h2><p className="community-manage-body">{item.body}</p><div className="community-form-bottom"><Link className="community-text-button" href={`/community/${"postId" in item ? item.postId : item.id}`}>원문 보기<ChevronRight size={13} aria-hidden="true" /></Link>{actionButton(tab === "posts" ? "post" : "comment", item)}</div></article>) : <div className="community-empty"><h2>{tab === "posts" ? "아직 게시글이 없습니다." : "아직 댓글이 없습니다."}</h2></div>}</div></>;
}
