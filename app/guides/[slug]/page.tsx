import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { GUIDES, findGuideBySlug, formatGuideDate } from "@/lib/guides";
import { findServiceBySlug } from "@/lib/service-catalog";
import { SITE_URL, safeJsonLd, siteMetadata, webPageJsonLd } from "@/lib/seo";
import styles from "../guides.module.css";

type GuidePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps) {
  const guide = findGuideBySlug((await params).slug);
  if (!guide) notFound();
  return siteMetadata({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}` });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = findGuideBySlug((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const url = `${SITE_URL}${path}`;
  const services = guide.relatedServiceSlugs.map(findServiceBySlug).filter(service => service !== undefined);
  const otherGuides = GUIDES.filter(item => item.slug !== guide.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPageJsonLd({ title: guide.title, description: guide.description, path }),
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "활용 가이드", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 3, name: guide.title, item: url },
      ] },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    <SiteHeader />
    <main id="main" className={styles.page}>
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <Link className={styles.back} href="/guides"><ArrowLeft size={16} aria-hidden="true" />활용 가이드 목록</Link>
          <p className={styles.kicker}>{guide.category}</p>
          <h1>{guide.title}</h1>
          <div className={styles.byline}><span>워크오토 활용 가이드</span><span>게시 <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time></span>{guide.updatedAt !== guide.publishedAt && <span>수정 <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time></span>}</div>
          <p className={styles.introduction}>{guide.introduction}</p>
        </header>
        <nav className={styles.contents} aria-label="글 목차">
          <p>이 글에서 살펴볼 내용</p>
          <ol>{guide.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}<li><a href="#faq">자주 묻는 질문</a></li><li><a href="#related">관련 서비스와 다음 단계</a></li></ol>
        </nav>
        <div className={styles.body}>
          {guide.sections.map((section, index) => <section className={styles.articleSection} id={section.id} aria-labelledby={`${section.id}-title`} key={section.id}>
            <p className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</p>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.checklist && <ul className={styles.checklist}>{section.checklist.map(item => <li key={item.label}><strong>{item.label}</strong><span>{item.text}</span></li>)}</ul>}
            {section.table && <div className={styles.tableWrap}><table className={styles.comparison}><caption>{section.table.caption}</caption><thead><tr>{section.table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{section.table.rows.map(row => <tr key={row[0]}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
            {section.quote && <div className={styles.example}><p>{section.quote.label}</p><blockquote>{section.quote.text}</blockquote></div>}
            {section.after?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>)}
          <section className={`${styles.articleSection} ${styles.faq}`} id="faq" aria-labelledby="faq-title">
            <h2 id="faq-title">자주 묻는 질문</h2>
            {guide.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<Plus size={18} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}
          </section>
          <section className={`${styles.articleSection} ${styles.related}`} id="related" aria-labelledby="related-title">
            <h2 id="related-title">관련 서비스와 다음 단계</h2>
            <div className={styles.relatedLinks}>{services.length ? services.map(service => <Link href={`/services/${service.slug}`} key={service.slug}>{service.service}<ArrowUpRight size={17} aria-hidden="true" /></Link>) : <Link href="/education">AI 기초·활용 교육 커리큘럼<ArrowUpRight size={17} aria-hidden="true" /></Link>}</div>
            <div className={styles.consultation}><h3>{guide.nextStep.title}</h3><p>{guide.nextStep.description}</p><Link className="button button-dark" href={guide.nextStep.href}>{guide.nextStep.label}<ArrowUpRight size={17} aria-hidden="true" /></Link><small>{guide.nextStep.note}</small></div>
          </section>
        </div>
        <footer className={styles.articleFooter}>
          <p>함께 읽어보세요</p>
          {otherGuides.map(item => <Link href={`/guides/${item.slug}`} key={item.slug}>{item.title}<ArrowUpRight size={19} aria-hidden="true" /></Link>)}
          <Link className={styles.back} href="/guides"><ArrowLeft size={16} aria-hidden="true" />전체 활용 가이드 보기</Link>
        </footer>
      </article>
    </main>
    <SiteFooter />
  </>;
}
