import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata } from "@/lib/seo";
import { RequestsClient } from "./requests-client";
import "./requests.css";

export const metadata = { ...siteMetadata({ title: "내 의뢰 진행 현황", description: "상담 접수부터 완료까지, 내 자동화 의뢰의 진행 상황을 확인하세요.", path: "/requests" }), robots: { index: false, follow: false } };
export default function RequestsPage() {
  return <><SiteHeader /><main id="main" className="requests-page"><div className="requests-shell"><Link className="requests-back" href="/account">← 내 활동</Link><header className="requests-heading"><p>MY REQUESTS</p><h1>지금, 어디까지<br />진행됐을까요.</h1><span>접수부터 완료까지. 내 업무가 달라지는 과정을 확인하세요.</span></header><RequestsClient /><p className="requests-footnote">상담에 입력한 이메일로 가입·인증하면 접수 내역이 연결됩니다. 신규 접수 반영에는 잠시 시간이 걸릴 수 있습니다. 이 기능 도입 전 상담은 기존 답변 이메일에서 확인해 주세요.</p></div></main><SiteFooter /></>;
}
