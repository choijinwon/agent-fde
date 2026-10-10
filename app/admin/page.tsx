import { env } from "cloudflare:workers";
import { count, desc } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { clearExpiredInquiries } from "@/lib/inquiry-server";
import { isAdminEmail } from "@/lib/inquiry-validation";
import AdminInbox from "./inbox";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "프로젝트 문의함 | 최진원", robots: { index: false, follow: false } };

async function loadInbox() {
  try {
    await clearExpiredInquiries();
    const db = getDb();
    const [rows, [{ total }]] = await Promise.all([
      db.select({ id: inquiries.id, reference: inquiries.reference, name: inquiries.name, email: inquiries.email, company: inquiries.company, service: inquiries.service, budget: inquiries.budget, message: inquiries.message, status: inquiries.status, createdAt: inquiries.createdAt }).from(inquiries).orderBy(desc(inquiries.createdAt), desc(inquiries.id)).limit(200),
      db.select({ total: count() }).from(inquiries),
    ]);
    return { rows, total };
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminEmail(user.email, env.ADMIN_EMAIL)) {
    return <main className="adm-root"><div className="adm-access"><Link className="adm-brand" href="/">최진원<span>↗</span></Link><p className="adm-eyebrow">OWNER ACCESS</p><h1>운영자만 열 수 있는<br />문의함입니다.</h1><p>운영자로 등록된 계정으로 로그인해 주세요.</p><a className="adm-button" href={chatGPTSignOutPath("/admin")} target="_top">다른 계정으로 로그인 ↗</a><Link className="adm-home" href="/">홈페이지로 돌아가기</Link></div></main>;
  }
  const inbox = await loadInbox();
  if (!inbox) {
    return <main className="adm-root"><div className="adm-access"><Link className="adm-brand" href="/">최진원<span>↗</span></Link><p className="adm-eyebrow">PROJECT INBOX</p><h1>문의함을 불러오지<br />못했습니다.</h1><p>잠시 후 페이지를 새로고침해 주세요.</p><Link className="adm-button" href="/admin" prefetch={false}>다시 불러오기 ↗</Link></div></main>;
  }
  return <main className="adm-root"><header className="adm-header"><Link className="adm-brand" href="/">최진원<span>↗</span></Link><div className="adm-account"><span>운영자 문의함</span><a href={chatGPTSignOutPath("/")} target="_top">로그아웃 ↗</a></div></header><section className="adm-content"><div className="adm-heading"><div><p className="adm-eyebrow">PROJECT INBOX</p><h1>새로운 가능성이<br />도착하는 곳.</h1><p className="adm-description">프로젝트 의뢰를 확인하고, 이메일로 다음 대화를 이어가세요.</p></div><div className="adm-total"><span>보관 중인 문의</span><strong>{inbox.total.toLocaleString("ko-KR")}<small>건</small></strong></div></div><AdminInbox inquiries={inbox.rows} total={inbox.total} /><footer className="adm-footer">문의는 접수일로부터 최대 1년간 보관합니다. 만료된 정보는 다음 접수 또는 문의함 조회 시 정리됩니다.</footer></section></main>;
}
