import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata } from "@/lib/seo";
import { CommunityModeration } from "./moderation-client";
import "../community.css";

export const metadata = { ...siteMetadata({ title: "커뮤니티 관리", description: "워크오토 커뮤니티 신고와 게시글 관리", path: "/community/manage" }), robots: { index: false, follow: false } };

export default function CommunityManagePage() {
  return <><SiteHeader /><main id="main" className="community-page"><div className="community-narrow"><Link className="community-back" href="/account"><ChevronLeft size={15} aria-hidden="true" />내 활동으로</Link><div className="community-account-title"><h1>커뮤니티 관리.</h1><p>신고 내용을 확인하고 공개 여부를 관리합니다.</p></div><CommunityModeration /></div></main><SiteFooter /></>;
}
