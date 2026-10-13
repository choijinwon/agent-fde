import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import InquiryForm from "@/app/components/InquiryForm";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { siteMetadata } from "@/lib/seo";
import "./consultation.css";

export const metadata = {
  ...siteMetadata({ title: `무료 상담 신청 | ${BRAND_NAME}`, description: "자동화하고 싶은 업무나 배우고 싶은 AI 활용 방법을 알려주세요. 첫 상담은 0원이며 개발비와 교육비는 상담 후 별도로 안내합니다.", path: "/consultation" }),
  robots: { index: false, follow: true },
};

export default async function ConsultationPage({ searchParams }: { searchParams: Promise<{ service?: string | string[]; from?: string | string[] }> }) {
  const query = await searchParams;
  const isEducation = query.service === "ai-education";
  const prefillSource = !isEducation && (query.from === "diagnosis" || query.from === "calculator") ? query.from : undefined;
  const selected = typeof query.service === "string" ? SERVICE_CATALOG.find(item => item.slug === query.service) : undefined;
  return <><SiteHeader/><main id="main" className="consultation-page section-wrap">
    <Link className="consultation-back" href={isEducation ? "/education" : selected ? `/services/${selected.slug}` : "/services"}><ArrowLeft size={16}/>{isEducation ? "AI 교육 커리큘럼 보기" : selected ? `${selected.title} 내용 보기` : "업종별 상담 살펴보기"}</Link>
    <div className="consultation-layout"><div className="consultation-intro">
      <div className="eyebrow section-label">부담 없이 시작하세요</div>
      <h1>{isEducation ? <>AI로 해보고 싶은 일,<br/>함께 배워볼까요?</> : selected ? <>{selected.title},<br/>어떤 일이 반복되나요?</> : <>반복하는 업무,<br/>함께 살펴볼까요?</>}</h1>
      <p>{isEducation ? <>처음 배우는 분도 괜찮습니다.<br/>첫 상담은 0원입니다. 교육 내용과 시간에 따른<br className="consultation-desktop-break"/> 수강료는 상담 후 별도로 안내합니다.</> : <>{BRAND_NAME}에 지금의 업무를 들려주세요.<br/>첫 상담은 0원입니다. 개발 범위와 비용은<br className="consultation-desktop-break"/> 상담 후 별도로 안내합니다.</>}</p>
      <ol className="consultation-steps"><li><span>01</span><div><strong>{isEducation ? "배우고 싶은 내용 남기기" : "업무 이야기 남기기"}</strong><p>{isEducation ? "학습 목표, 현재 수준, 인원과 희망 일정을 알려주세요." : "사용 중인 도구와 반복하는 작업을 알려주세요."}</p></div></li><li><span>02</span><div><strong>이메일로 대화 시작</strong><p>내용을 확인하고 남겨주신 이메일로 답변합니다.</p></div></li><li><span>03</span><div><strong>{isEducation ? "교육 과정과 수강료 협의" : "범위와 비용 협의"}</strong><p>{isEducation ? "수준과 목표에 맞춰 내용, 시간과 진행 방식을 정합니다." : "필요한 기능과 연결 방법을 정한 뒤 안내합니다."}</p></div></li></ol>
      <a className="contact-email" href="mailto:abyys1004@naver.com"><span>이메일로 직접 문의</span><strong>abyys1004@naver.com <ArrowUpRight size={18}/></strong></a>
    </div><InquiryForm initialService={isEducation ? "AI 활용 교육" : selected?.service} prefillSource={prefillSource}/></div>
  </main><SiteFooter/></>;
}
