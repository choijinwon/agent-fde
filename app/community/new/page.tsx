import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata } from "@/lib/seo";
import { CommunityCompose } from "../community-client";
import "../community.css";

export const metadata = { ...siteMetadata({ title: "커뮤니티 글쓰기", description: "업무 자동화에 대한 질문과 직접 경험한 활용 사례를 나눠주세요.", path: "/community/new" }), robots: { index: false, follow: true } };

export default async function CommunityNewPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const query = await searchParams;
  return <><SiteHeader /><main id="main" className="community-page"><div className="community-narrow"><Link className="community-back" href="/community"><ChevronLeft size={15} aria-hidden="true" />커뮤니티로 돌아가기</Link><div className="community-compose-header"><h1>당신의 이야기를 들려주세요.</h1><p>작은 질문도, 직접 해본 경험도.<br />함께 나누면 누군가의 업무에 도움이 됩니다.</p></div><CommunityCompose initialKind={query.kind === "case" ? "case" : "question"} /></div></main><SiteFooter /></>;
}
