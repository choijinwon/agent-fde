import { SiteFooter, SiteHeader } from "@/app/components/SiteChrome";
import { siteMetadata } from "@/lib/seo";
import { safeAccountDestination } from "@/lib/auth-ui";
import AuthForm from "./AuthForm";
import "./auth.css";

export const metadata = { ...siteMetadata({ title: "회원가입·로그인", description: "워크오토 커뮤니티에 가입하고 자동화 질문과 경험을 나누세요.", path: "/account/login" }), robots: { index: false, follow: true } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string | string[]; next?: string | string[] }> }) {
  const search = await searchParams;
  const mode = typeof search.mode === "string" && ["signup", "recover", "reset"].includes(search.mode) ? search.mode as "signup" | "recover" | "reset" : "login";
  return <><SiteHeader /><main id="main" className="member-login-page"><AuthForm initialMode={mode} next={safeAccountDestination(search.next)} /></main><SiteFooter /></>;
}
