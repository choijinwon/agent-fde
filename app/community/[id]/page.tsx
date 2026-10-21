import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, UserRound } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/app/components/SiteChrome";
import { getPublicPost } from "@/lib/community-server";
import { siteMetadata } from "@/lib/seo";
import { CommunityComments, PostActions } from "../community-client";
import { communityDate, industryName } from "../community-display";
import "../community.css";

export const dynamic = "force-dynamic";
const readPost = cache(async (id: string) => {
  const result = await getPublicPost(id);
  // A storage outage must stay a server error, not a successful noindex page.
  if (!result.available) throw new Error("Community post storage is unavailable");
  return result;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { post } = await readPost(id);
  if (!post) return { title: "커뮤니티 | 워크오토", robots: { index: false, follow: true } };
  return siteMetadata({ title: post.title, description: post.body.replace(/\s+/g, " ").slice(0, 155), path: `/community/${post.id}` });
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { post, comments } = await readPost(id);
  if (!post) notFound();
  return <><SiteHeader /><main id="main" className="community-page"><div className="community-narrow"><Link className="community-back" href={post.kind === "case" ? "/community?kind=case" : "/community"}><ChevronLeft size={15} aria-hidden="true" />커뮤니티로 돌아가기</Link><article className="community-article"><div className="community-post-labels"><span className={`community-tag${post.kind === "case" ? " community-tag-case" : ""}`}>{post.kind === "case" ? "활용 사례" : "자동화 질문"}</span><span>{industryName(post.industry)}</span></div><h1>{post.title}</h1><div className="community-post-meta"><span className="community-author"><UserRound size={13} aria-hidden="true" />{post.authorName}</span><time dateTime={post.createdAt}>{communityDate(post.createdAt)}</time></div><div className="community-article-body">{post.body}</div><PostActions post={post} /></article><CommunityComments postId={post.id} comments={comments} /></div></main><SiteFooter /></>;
}
