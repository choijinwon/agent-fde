import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import "./community.css";

export default function CommunityNotFound() {
  return <><SiteHeader /><main id="main" className="community-page"><div className="community-narrow"><div className="community-empty"><span className="community-empty-icon"><MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" /></span><h1 className="community-empty-title">글을 찾을 수 없습니다.</h1><p>주소가 잘못되었거나 삭제·숨김 처리된 글입니다.</p><Link className="community-primary" href="/community">커뮤니티로 돌아가기</Link></div></div></main><SiteFooter /></>;
}
