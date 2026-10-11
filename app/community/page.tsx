import Link from "next/link";
import { ChevronDown, PencilLine, UserRound, Check, Search } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { COMMUNITY_INDUSTRIES, type CommunityKind } from "@/lib/community-types";
import { listPublicPosts } from "@/lib/community-server";
import { siteMetadata } from "@/lib/seo";
import { CommunityAside, CommunityEmpty, CommunityUnavailable, PostCard } from "./community-display";
import "./community.css";

export const dynamic = "force-dynamic";
export const metadata = siteMetadata({ title: "자동화 커뮤니티 · 질문과 활용 사례", description: "엑셀·ERP·학원·병원·쇼핑몰의 반복 업무를 함께 이야기합니다. 자동화 질문과 실제 활용 경험을 나누는 워크오토 커뮤니티입니다. 읽기는 누구나, 글과 댓글 작성은 로그인 후 가능합니다.", path: "/community" });

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ kind?: string; industry?: string; cursor?: string; q?: string }> }) {
  const query = await searchParams;
  const kind: CommunityKind = query.kind === "case" ? "case" : "question";
  const industry = COMMUNITY_INDUSTRIES.some((item) => item.value === query.industry) ? query.industry : undefined;
  const q = query.q?.trim().slice(0, 100);
  const result = await listPublicPosts({ kind, industry, cursor: query.cursor, q }).catch(() => ({ posts: [], available: false, nextCursor: null }));
  const nextQuery = new URLSearchParams({ kind });
  if (industry) nextQuery.set("industry", industry);
  if (q) nextQuery.set("q", q);
  if (result.nextCursor) nextQuery.set("cursor", result.nextCursor);

  return <><SiteHeader /><main className="community-page" id="main"><div className="community-wrap">
    <section className="community-intro"><div><p className="community-kicker">WORKAUTO COMMUNITY</p><h1>혼자 하던 고민을,<br /><span>함께 푸는 곳.</span></h1><p>반복되는 일에 대한 질문, 일이 편해진 경험.<br />우리의 업무가 조금 더 나아지는 이야기를 나눕니다.</p></div><div className="community-intro-art" aria-hidden="true"><div className="community-bubble"><i /><i /></div><div className="community-bubble community-bubble-blue"><Check size={39} strokeWidth={2} /></div></div></section>
    <nav className="community-local-nav" aria-label="커뮤니티 메뉴"><div><Link href="/community" aria-current={kind === "question" ? "page" : undefined}>자동화 질문</Link><Link href="/community?kind=case" aria-current={kind === "case" ? "page" : undefined}>활용 사례</Link></div><div><Link className="community-nav-account" href="/account"><UserRound size={15} aria-hidden="true" />내 활동</Link><Link className="community-primary" href={`/community/new?kind=${kind}`}><PencilLine size={14} aria-hidden="true" />글쓰기</Link></div></nav>
    <div className="community-grid"><section className="community-board" aria-label={kind === "case" ? "활용 사례 목록" : "자동화 질문 목록"}>
      <form className="community-filter" action="/community" method="get"><input type="hidden" name="kind" value={kind} /><div className="community-search"><label className="sr-only" htmlFor="community-search">게시글 검색</label><Search size={16} aria-hidden="true" /><input id="community-search" name="q" defaultValue={q ?? ""} maxLength={100} placeholder="궁금한 업무나 키워드를 찾아보세요" type="search" /></div><div className="community-select"><label className="sr-only" htmlFor="community-industry">업종별로 보기</label><select id="community-industry" name="industry" defaultValue={industry ?? ""}><option value="">모든 업종</option>{COMMUNITY_INDUSTRIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></div><button className="community-secondary" type="submit">검색</button></form>
      <div className="community-result-line"><span>{kind === "case" ? "직접 경험한 자동화 이야기" : "업무를 바꾸는 작은 질문"}</span><span>최신순</span></div>
      {!result.available ? <CommunityUnavailable /> : result.posts.length ? <div className="community-posts">{result.posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <CommunityEmpty filtered={Boolean(industry || q)} kind={kind} />}
      {(query.cursor || result.nextCursor) && <nav className="community-pagination" aria-label="게시글 페이지">{query.cursor && <Link href={`/community?${new URLSearchParams({ kind, ...(industry ? { industry } : {}), ...(q ? { q } : {}) })}`}>처음으로</Link>}{result.nextCursor && <Link href={`/community?${nextQuery.toString()}`}>다음 글 보기<ChevronDown size={13} aria-hidden="true" /></Link>}</nav>}
    </section><CommunityAside /></div>
  </div></main><SiteFooter /></>;
}
