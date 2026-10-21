import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "@/app/education/education.module.css";

export default function HomeEducation() {
  return <section className={`section-wrap ${styles.home}`} aria-labelledby="home-education-title">
    <div className={styles.homeInner}>
      <div><p className={styles.kicker}>AI 교육 · 처음 배우는 분도 환영합니다</p><h2 id="home-education-title">AI를 배우고 싶다면,<br />여기서 시작하세요.</h2><p className={styles.homeDescription}>질문하는 방법부터 글쓰기, 자료 정리까지.<br />코딩 경험 없이, 내 일상과 업무에 필요한<br />AI 사용법을 직접 실습하며 배웁니다.</p><Link className="text-link" href="/education">AI 기초·활용 교육 커리큘럼 보기<ArrowUpRight size={17} aria-hidden="true" /></Link><p className={styles.note}>첫 상담 무료 · 교육비는 상담 후 별도 안내</p></div>
      <ol className={styles.homeSteps}>
        <li><span>01—02</span><div><strong>AI와 친해지기</strong><p>기본 사용법과 원하는 답을 얻는 질문법</p></div></li>
        <li><span>03—04</span><div><strong>직접 만들고 다듬기</strong><p>문서 정리, 글쓰기와 콘텐츠 아이디어</p></div></li>
        <li><span>05—06</span><div><strong>내 생활과 일에 적용하기</strong><p>반복 작업 정리와 나만의 활용 프로젝트</p></div></li>
      </ol>
    </div>
  </section>;
}
