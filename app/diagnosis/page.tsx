import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata, safeJsonLd, webPageJsonLd } from "@/lib/seo";
import Diagnosis from "./Diagnosis";
import styles from "./tools.module.css";

const title = "1분 업무 자동화 진단";
const description = "업종, 반복 업무, 사용 도구와 빈도를 선택하고 시작할 만한 자동화 방향을 확인하세요. 로그인 없이 진단하고 결과를 무료 상담으로 이어갈 수 있습니다.";
export const metadata = siteMetadata({ title, description, path: "/diagnosis" });

export default function DiagnosisPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd({ title, description, path: "/diagnosis" })) }} /><SiteHeader/><main id="main" className={`section-wrap ${styles.page}`}><header className={styles.intro}><p className={styles.eyebrow}>1분 자동화 진단</p><h1>지금 하는 일에서,<br/><span>좋은 시작을 찾아보세요.</span></h1><p>네 가지를 선택하면 시작할 만한 자동화 방향을 정리해 드립니다.<br/>회원가입 없이, 사용하는 도구부터 편하게 알려주세요.</p></header><Diagnosis/></main><SiteFooter/></>;
}
