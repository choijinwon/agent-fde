import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata, safeJsonLd, webPageJsonLd } from "@/lib/seo";
import Calculator from "./Calculator";
import styles from "../diagnosis/tools.module.css";

const title = "업무 자동화 절감 시간 계산기";
const description = "한 번에 걸리는 시간, 주간 반복 횟수와 인원을 입력하고 자동화 비율에 따른 예상 절감 시간을 계산하세요. 계산 기준을 확인하고 무료 상담으로 이어갈 수 있습니다.";
export const metadata = siteMetadata({ title, description, path: "/calculator" });

export default function CalculatorPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd({ title, description, path: "/calculator" })) }}/><SiteHeader/><main id="main" className={`section-wrap ${styles.page}`}><header className={styles.intro}><p className={styles.eyebrow}>절감 시간 계산기</p><h1>작은 반복에 쓰는 시간,<br/><span>한 달이면 얼마나 될까요?</span></h1><p>업무 시간과 반복 횟수를 넣어 계산해 보세요.<br/>자동화로 줄일 수 있는 비율은 직접 가정하고 조절할 수 있습니다.</p></header><Calculator/></main><SiteFooter/></>;
}
