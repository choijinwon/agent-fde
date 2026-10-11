import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight, MessageCircle, PencilLine, ShieldCheck, UserRound } from "lucide-react";
import { COMMUNITY_INDUSTRIES, type CommunityPost } from "@/lib/community-types";

export function communityDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date(value));
}

export function industryName(value: string) {
  return COMMUNITY_INDUSTRIES.find((industry) => industry.value === value)?.label ?? "기타 업무";
}

export function PostCard({ post, children }: { post: CommunityPost; children?: React.ReactNode }) {
  const content = <>
    <div className="community-post-labels"><span className={`community-tag${post.kind === "case" ? " community-tag-case" : ""}`}>{post.kind === "case" ? "활용 사례" : "자동화 질문"}</span><span>{industryName(post.industry)}</span>{post.status !== "published" && <span className="community-status-tag">{post.status === "hidden" ? "관리자 숨김" : "삭제됨"}</span>}</div>
    <h2>{post.title}{post.status === "published" && <ChevronRight size={16} aria-hidden="true" />}</h2>
    <p className="community-post-excerpt">{post.body}</p>
    <div className="community-post-meta"><span className="community-author"><UserRound size={12} aria-hidden="true" />{post.authorName}</span><time dateTime={post.createdAt}>{communityDate(post.createdAt)}</time></div>
  </>;
  return <article className="community-post-card">{post.status === "published" ? <Link className="community-post-link" href={`/community/${post.id}`}>{content}</Link> : <div className="community-post-link">{content}</div>}{children}</article>;
}

export function CommunityAside() {
  return <aside className="community-aside" aria-label="커뮤니티 이용 안내">
    <section className="community-side-card"><ShieldCheck className="community-side-icon" size={26} strokeWidth={1.5} aria-hidden="true" /><h2>좋은 대화의 시작.</h2><p>지금 하는 일과 불편한 점을 알려주세요. 작은 질문도 괜찮습니다.</p><ul><li><Check size={13} aria-hidden="true" />사용하는 도구와 반복 업무 설명하기</li><li><Check size={13} aria-hidden="true" />개인정보와 회사 기밀은 제외하기</li><li><Check size={13} aria-hidden="true" />서로의 경험을 존중하기</li></ul><Link href="/community/guide">이용 안내<ChevronRight size={14} aria-hidden="true" /></Link></section>
    <section className="community-side-card community-side-consult"><MessageCircle className="community-side-icon" size={26} strokeWidth={1.5} aria-hidden="true" /><h2>내 업무에 맞는<br />도움이 필요하다면.</h2><p>공개하기 어려운 업무 내용은<br />개별 상담으로 이야기해 주세요.</p><p className="community-fee">첫 상담 <strong>0원</strong></p><Link href="/consultation">회원가입 없이 상담 신청<ArrowUpRight size={14} aria-hidden="true" /></Link><p>개발 비용은 상담 후 별도 안내합니다.</p></section>
  </aside>;
}

export function CommunityUnavailable() {
  return <div className="community-empty" role="status"><span className="community-empty-icon"><MessageCircle size={26} strokeWidth={1.5} aria-hidden="true" /></span><h2>대화 공간을 연결하고 있습니다.</h2><p>게시글을 지금 불러올 수 없습니다.<br />잠시 후 다시 방문해 주세요. 개별 상담은 바로 가능합니다.</p><Link className="community-secondary" href="/consultation">무료 상담 신청<ArrowUpRight size={15} aria-hidden="true" /></Link></div>;
}

export function CommunityEmpty({ filtered = false, kind = "question" }: { filtered?: boolean; kind?: string }) {
  return <div className="community-empty"><span className="community-empty-icon">{kind === "case" ? <PencilLine size={25} strokeWidth={1.5} aria-hidden="true" /> : <MessageCircle size={26} strokeWidth={1.5} aria-hidden="true" />}</span><h2>{filtered ? "조건에 맞는 글이 없습니다." : kind === "case" ? "일이 편해진 경험을 나눠주세요." : "첫 번째 대화를 시작해 보세요."}</h2><p>{filtered ? <>다른 검색어나 업종으로 살펴보세요.<br />원하는 이야기가 없다면 직접 글을 남겨도 좋습니다.</> : kind === "case" ? <>어떤 일을 어떻게 줄였는지,<br />직접 경험한 자동화 이야기를 기다립니다.</> : <>매일 옮겨 적는 엑셀, 반복되는 확인 업무.<br />“이런 일도 자동화할 수 있나요?”부터 시작해 보세요.</>}</p><Link className="community-primary" href={`/community/new?kind=${kind === "case" ? "case" : "question"}`}>{kind === "case" ? "경험 나누기" : "질문 남기기"}<PencilLine size={15} aria-hidden="true" /></Link></div>;
}
