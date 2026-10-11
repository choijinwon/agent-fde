import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";
import { getNetlifyFormsUrl } from "@/lib/netlify-form";
import { siteMetadata } from "@/lib/seo";
import "./admin.css";

export const metadata = { ...siteMetadata({ title: `상담 문의 관리 | ${BRAND_NAME}`, description: "워크오토 운영자를 위한 상담 문의 관리 안내입니다.", path: "/admin" }), robots: { index: false, follow: false } };

export default function AdminPage() {
  const dashboardUrl = getNetlifyFormsUrl(process.env.NETLIFY_SITE_SLUG, process.env.URL);
  return <main className="adm-root"><div className="adm-access">
    <Link className="adm-brand" href="/">{BRAND_NAME}<span>↗</span></Link>
    <p className="adm-eyebrow">상담 문의 관리</p>
    <h1>상담 요청은<br />Netlify에서 확인합니다.</h1>
    <p>이 사이트를 관리하는 Netlify 계정으로 로그인한 뒤, Forms에서 automation-consultation 양식을 선택해 주세요. 정상 접수와 스팸으로 분류된 요청을 함께 확인할 수 있습니다.</p>
    <a className="adm-button" href={dashboardUrl} target="_blank" rel="noopener noreferrer">Netlify 문의함 열기 ↗</a>
    <p>문의 내용은 공개하지 않습니다. 이메일 답변과 보관된 개인정보의 삭제는 운영자가 Netlify 관리 화면에서 직접 처리합니다.</p>
    <Link className="adm-home" href="/">홈페이지로 돌아가기</Link>
  </div></main>;
}
