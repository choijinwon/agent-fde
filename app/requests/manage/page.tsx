import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata } from "@/lib/seo";
import { RequestsClient } from "../requests-client";
import "../requests.css";
export const metadata = { ...siteMetadata({ title: "의뢰 진행 관리", description: "워크오토 운영자 의뢰 진행 관리", path: "/requests/manage" }), robots: { index: false, follow: false } };
export default function RequestsManagePage() {
  return <><SiteHeader /><main id="main" className="requests-page"><div className="requests-shell"><Link className="requests-back" href="/requests">← 내 의뢰</Link><header className="requests-heading"><p>REQUEST MANAGEMENT</p><h1>의뢰 진행 관리.</h1><span>진행 단계와 고객에게 전달할 안내를 업데이트합니다.</span></header><RequestsClient manage /></div></main><SiteFooter /></>;
}
