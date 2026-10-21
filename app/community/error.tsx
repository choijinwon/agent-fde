"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import "./community.css";

export default function CommunityError({ retry }: { retry: () => void }) {
  return <><SiteHeader /><main id="main" className="community-page"><div className="community-narrow"><div className="community-empty" role="alert"><span className="community-empty-icon"><MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" /></span><h1 className="community-empty-title">대화를 불러오지 못했습니다.</h1><p>잠시 후 다시 시도해 주세요.<br />문제가 계속되면 커뮤니티 처음으로 이동해 주세요.</p><button className="community-primary" type="button" onClick={retry}>다시 불러오기</button><Link className="community-text-button" href="/community">커뮤니티 처음으로</Link></div></div></main><SiteFooter /></>;
}
