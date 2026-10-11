import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata } from "@/lib/seo";
import { CommunityAccount } from "../community/community-client";
import "../community/community.css";

export const metadata = { ...siteMetadata({ title: "내 활동", description: "워크오토 커뮤니티에서 작성한 질문과 활용 사례를 확인하세요.", path: "/account" }), robots: { index: false, follow: false } };

export default function AccountPage() {
  return <><SiteHeader /><main id="main" className="community-page"><div className="community-narrow"><Link className="community-back" href="/community"><ChevronLeft size={15} aria-hidden="true" />커뮤니티로 돌아가기</Link><div className="community-account-title"><h1>내 활동.</h1><p>함께 나눈 이야기와 답변을 확인하세요.</p></div><CommunityAccount /></div></main><SiteFooter /></>;
}
