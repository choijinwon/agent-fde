import Link from "next/link";
import { ArrowUpRight, ClipboardList, Clock3, Layers3 } from "lucide-react";
import "./home-tools.css";

export default function HomeTools() {
  return <section className="home-tools section-wrap section-space" aria-labelledby="home-tools-title">
    <div className="section-heading"><div><p className="eyebrow section-label">상담 전에, 가볍게</p><h2 id="home-tools-title">어떤 업무부터<br />바꿀 수 있을까요.</h2></div><p>몇 가지 질문으로 시작하고,<br />지금 쓰는 시간을 살펴보세요.</p></div>
    <div className="home-tools-grid">
      <Link className="home-tool home-tool-primary" href="/diagnosis"><ClipboardList size={27} strokeWidth={1.5}/><div><span>로그인 없이 · 약 1분</span><h3>내 업무 자동화 진단.</h3><p>반복하는 일과 사용하는 도구를 알려주세요.<br />먼저 살펴볼 자동화 항목을 정리해 드립니다.</p></div><strong>무료 진단 시작 <ArrowUpRight size={18}/></strong></Link>
      <Link className="home-tool" href="/calculator"><Clock3 size={26} strokeWidth={1.5}/><div><span>입력한 조건으로 계산</span><h3>시간이 얼마나<br />달라질까요.</h3><p>반복 횟수와 업무 시간을 넣고<br />예상 절감 시간을 확인하세요.</p></div><strong>절감 시간 계산 <ArrowUpRight size={18}/></strong></Link>
      <Link className="home-tool" href="/cases"><Layers3 size={26} strokeWidth={1.5}/><div><span>경력에서 확인한 개발 경험</span><h3>현장에서 만든<br />시스템 이야기.</h3><p>제조 현장부터 학습 시스템과 AI까지,<br />어떤 문제를 어떻게 다뤘는지 살펴보세요.</p></div><strong>개발 사례 보기 <ArrowUpRight size={18}/></strong></Link>
    </div>
  </section>;
}
