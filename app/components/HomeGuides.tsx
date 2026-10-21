import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GUIDES } from "@/lib/guides";
import styles from "./home-guides.module.css";

export default function HomeGuides() {
  return <section className={`section-wrap ${styles.section}`} aria-labelledby="home-guides-title">
    <div className={styles.heading}>
      <div><p className="eyebrow section-label">워크오토 활용 가이드</p><h2 id="home-guides-title">상담하기 전에,<br />궁금했던 것부터.</h2></div>
      <Link className="text-link" href="/guides">전체 가이드 보기<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </div>
    <div className={styles.list}>{GUIDES.map(guide => <article key={guide.slug}>
      <p className={styles.category}>{guide.category}</p>
      <h3><Link href={`/guides/${guide.slug}`}>{guide.title}<ArrowUpRight size={20} aria-hidden="true" /></Link></h3>
      <p>{guide.description}</p>
    </article>)}</div>
  </section>;
}
