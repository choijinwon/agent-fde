import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Plus } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { siteMetadata, safeJsonLd, webPageJsonLd } from "@/lib/seo";
import styles from "./education.module.css";

const title = "AI 기초·활용 교육 · 초보자를 위한 실습 커리큘럼";
const description = "AI를 배우고 싶은 누구나. 코딩 경험 없이 시작하는 AI 기초 교육부터 질문법, 글쓰기·자료 정리, 콘텐츠 제작, 생활·업무 활용까지 6단계 실습 커리큘럼을 만나보세요. 첫 상담은 무료이며 교육 일정과 비용은 별도 안내합니다.";
export const metadata = siteMetadata({ title, description, path: "/education" });
const inquiryHref = "/consultation?service=ai-education";

const curriculum = [
  { title: "AI와 친해지기", topic: "기본 사용법", description: "AI가 잘하는 일과 어려워하는 일을 알아보고, 직접 대화를 시작합니다. 답변을 그대로 믿기보다 확인하는 습관을 익힙니다.", practice: "일상에서 AI로 해보고 싶은 일 3가지 정리", result: "나의 AI 활용 목록" },
  { title: "원하는 답을 얻는 질문법", topic: "질문하고 다듬기", description: "목적, 상황, 조건을 담아 질문합니다. 답이 아쉬울 때는 예시를 더하거나 원하는 형식을 알려주며 수정합니다.", practice: "같은 질문에 조건을 더해 결과 비교하기", result: "다시 쓸 수 있는 질문 문장 모음" },
  { title: "글쓰기와 자료 정리", topic: "문서 활용", description: "이메일과 안내문을 작성하고 긴 글의 핵심을 정리합니다. 요약한 내용이 원문과 맞는지 함께 살펴봅니다.", practice: "예시 문서를 요약하고 내 말투로 고치기", result: "직접 검토한 문서 한 편" },
  { title: "아이디어와 콘텐츠 만들기", topic: "콘텐츠 실습", description: "학습 계획, 홍보 글, 이미지 제작 아이디어를 구체화합니다. 누구에게 보여줄지 정하고 내용과 표현을 다듬습니다.", practice: "관심 주제로 글과 이미지 아이디어 만들기", result: "목적에 맞춘 콘텐츠 초안" },
  { title: "생활과 업무에 활용하기", topic: "반복 작업 정리", description: "일정과 비교표를 만들고, 예시 엑셀 자료를 정리하는 방법을 연습합니다. 숫자와 결과를 확인하는 방법도 배웁니다.", practice: "반복하는 일을 골라 정리 양식 만들기", result: "생활·업무에 활용할 정리 양식" },
  { title: "나만의 활용 프로젝트", topic: "직접 완성하기", description: "배우고 싶은 주제로 작은 결과물을 만듭니다. 사실관계와 자료 사용 조건을 검토하고, 다음에도 활용할 방법을 정리합니다.", practice: "주제 선정부터 결과 검토·수정까지 직접 해보기", result: "나에게 필요한 결과물과 활용 가이드" },
];
const questions = [
  { q: "AI를 전혀 몰라도 괜찮나요?", a: "네. 처음 사용하는 분을 기준으로 기본 사용법부터 안내합니다. 프로그래밍 경험도 필요하지 않습니다. 이미 써본 적이 있다면 관심 있는 활용 주제부터 상담할 수 있습니다." },
  { q: "어떤 AI 도구를 사용하나요? 유료 구독이 필요한가요?", a: "학습 목표와 경험 수준에 맞춰 사용할 도구와 계정을 안내합니다. 유료 기능이 필요한 경우에는 구독 비용과 대안을 수업 전에 설명드립니다." },
  { q: "수업 전에 무엇을 준비하면 되나요?", a: "AI로 해보고 싶은 일을 하나 생각해 주세요. 필요한 기기와 계정은 수업 방식에 맞춰 안내합니다. 실습에는 개인정보를 제거한 자료나 교육용 예시를 사용합니다." },
  { q: "수업 방식과 일정, 교육비는 어떻게 정하나요?", a: "경험 수준, 관심 주제, 참여 인원과 가능한 시간을 확인한 뒤 수업 방식·횟수·일정과 교육비를 안내합니다. 첫 상담은 무료이며 교육비는 별도입니다. 아래 신청은 교육 상담 접수이며, 수강 확정이나 결제가 아닙니다." },
];

export default function EducationPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd({ title, description, path: "/education" })) }} />
    <SiteHeader />
    <main id="main" className={styles.page}>
      <section className={`section-wrap ${styles.hero}`}>
        <div>
          <p className={styles.kicker}>워크오토 AI 교육 · 배우고 싶은 누구나</p>
          <h1>AI 기초부터,<br /><span>생활·업무 활용까지.</span></h1>
          <p className={styles.lead}>코딩 경험 없이 시작하는 AI 기초 교육입니다.<br />질문법부터 글쓰기, 자료 정리와 콘텐츠 제작까지<br />직접 실습하며 배웁니다.</p>
          <div className={styles.actions}><Link className="button button-dark" href={inquiryHref}>AI 교육 상담 신청<ArrowUpRight size={18} aria-hidden="true" /></Link><a className="text-link" href="#curriculum">커리큘럼 보기<ArrowDown size={16} aria-hidden="true" /></a></div>
          <p className={styles.note}>첫 상담 무료 · 교육 일정과 비용은 상담 후 안내</p>
        </div>
        <aside className={styles.notebook} aria-label="질문법 수업의 실습 예시">
          <div className={styles.notebookTop}><span>첫 번째 실습 노트</span><span>질문에 맥락 더하기</span></div>
          <p className={styles.promptBefore}>“안내문 써줘.”</p>
          <ArrowDown size={22} strokeWidth={1.5} aria-hidden="true" />
          <p className={styles.promptAfter}>처음 방문하는 손님에게 보낼<br /><strong>예약 안내문</strong>을 작성해 줘.<br /><strong>준비물과 방문 시간</strong>을 포함해서,<br /><strong>친근한 말투로 5줄</strong> 안에 정리해 줘.</p>
          <div className={styles.promptTags}><span>누구에게</span><span>무엇을</span><span>어떤 형식으로</span></div>
          <p className={styles.notebookFoot}>조건을 더하고, 결과를 비교하고, 내 말로 다듬어요.</p>
        </aside>
      </section>

      <section className={`section-wrap ${styles.audience}`} aria-labelledby="audience-title">
        <div className={styles.sectionTop}><p className={styles.kicker}>시작하는 이유는 달라도 괜찮아요</p><h2 id="audience-title">배우고 싶은 마음이 있다면.</h2><p>코딩 경험 없이 시작합니다. 지금의 수준과 관심사에 맞춰 배울 내용을 함께 정합니다.</p></div>
        <div className={styles.audienceGrid}>
          {[{ title: "처음 배우는 분", text: "AI가 궁금하지만 어디서 시작할지 막막하다면" }, { title: "학생·취업 준비생", text: "공부 계획과 자료 정리에 활용해 보고 싶다면" }, { title: "직장인·프리랜서", text: "문서 작성과 반복 업무를 더 수월하게 하고 싶다면" }, { title: "소상공인·일반 사용자", text: "가게 홍보부터 일상의 아이디어까지 직접 만들어 보고 싶다면" }].map(item => <div key={item.title}><Check size={20} aria-hidden="true" /><h3>{item.title}</h3><p>{item.text}</p></div>)}
        </div>
      </section>

      <section className={`section-wrap ${styles.curriculum}`} id="curriculum" aria-labelledby="curriculum-title">
        <div className={styles.sectionTop}><p className={styles.kicker}>AI, 처음부터 내 일에 쓰기</p><h2 id="curriculum-title">AI 활용 교육 커리큘럼.<br /><span>6단계로 차근차근.</span></h2><p>설명을 듣고, 직접 해보고, 결과를 확인합니다.<br />아래는 기본 커리큘럼이며 경험과 목표에 따라 범위와 진도를 조정합니다.</p></div>
        <ol className={styles.lessonGrid}>{curriculum.map((lesson, index) => <li key={lesson.title} className={styles.lesson}>
          <div className={styles.lessonTop}><span>{String(index + 1).padStart(2, "0")}</span><span>{lesson.topic}</span></div>
          <h3>{lesson.title}</h3><p>{lesson.description}</p>
          <div className={styles.practice}><span>직접 해봐요</span><p>{lesson.practice}</p></div>
          <p className={styles.result}><Check size={15} aria-hidden="true" />{lesson.result}</p>
        </li>)}</ol>
      </section>

      <section className={`section-wrap ${styles.learning}`} aria-labelledby="learning-title">
        <div><p className={styles.kicker}>배운 뒤에도 쓸 수 있도록</p><h2 id="learning-title">수업이 끝나면,<br />내 손에 남는 것.</h2><p>다시 꺼내 쓸 질문 문장과 직접 다듬은 결과물을 모읍니다. 개인정보를 가린 예시로 연습하고, AI의 답변을 원문과 비교하는 습관도 함께 익힙니다.</p></div>
        <ul>{["자주 쓰는 질문 문장 모음", "직접 작성하고 검토한 실습 결과물", "일상과 업무에 이어갈 활용 방법", "답변의 사실관계와 자료 사용 조건을 확인하는 습관"].map(item => <li key={item}><Check size={19} aria-hidden="true" />{item}</li>)}</ul>
      </section>

      <section className={`section-wrap ${styles.faq}`} aria-labelledby="education-faq-title">
        <div><p className={styles.kicker}>수업 전에 궁금한 이야기</p><h2 id="education-faq-title">가볍게 물어보세요.</h2></div>
        <div>{questions.map(item => <details key={item.q}><summary>{item.q}<Plus size={18} aria-hidden="true" /></summary><p>{item.a}</p></details>)}</div>
      </section>

      <section className={`section-wrap ${styles.enroll}`}>
        <div><p className={styles.kicker}>첫걸음은 대화부터</p><h2>AI로 해보고 싶은 일이 있나요?</h2><p>지금의 경험 수준과 배우고 싶은 내용을 알려주세요.<br />나에게 맞는 시작점을 함께 찾겠습니다.</p></div>
        <div><Link className="button button-dark" href={inquiryHref}>AI 교육 상담 신청<ArrowUpRight size={18} aria-hidden="true" /></Link><p className={styles.note}>첫 상담 무료 · 교육비 별도 안내</p></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
