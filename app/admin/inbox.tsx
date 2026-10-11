"use client";

import { BRAND_NAME } from "@/lib/brand";
import { useMemo, useState } from "react";
import { INQUIRY_SERVICES } from "@/lib/inquiry-validation";

type InquiryRow = {
  id: string; reference: string; name: string; email: string; company: string;
  service: string; budget: string; message: string; status: string; createdAt: number;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

export default function AdminInbox({ inquiries, total }: { inquiries: InquiryRow[]; total: number }) {
  const [search, setSearch] = useState("");
  const [service, setService] = useState("");
  const filtered = useMemo(() => inquiries.filter((item) => (!service || item.service === service) && (!search.trim() || [item.name, item.company, item.email, item.message, item.reference].join(" ").toLowerCase().includes(search.trim().toLowerCase()))), [inquiries, search, service]);
  return <section aria-label="접수된 프로젝트 목록"><div className="adm-toolbar"><label className="adm-search"><span className="adm-sr-only">이름, 회사, 이메일 또는 내용 검색</span><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" placeholder="이름, 회사, 이메일, 내용 검색" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label><span className="adm-sr-only">서비스 필터</span><select value={service} onChange={(event) => setService(event.target.value)}><option value="">모든 서비스</option>{INQUIRY_SERVICES.map((name) => <option key={name}>{name}</option>)}</select></label></div><div className="adm-list-info"><span aria-live="polite">{filtered.length}개의 문의</span><span>최신 접수순 · 한국 시간</span></div>{total > inquiries.length && <p className="adm-limit">최근 {inquiries.length}건을 표시합니다. 검색과 필터는 표시된 문의에 적용됩니다.</p>}{filtered.length === 0 ? <div className="adm-empty"><span>↗</span><h2>{inquiries.length ? "검색 결과가 없습니다." : "첫 번째 프로젝트를 기다리고 있어요."}</h2><p>{inquiries.length ? "다른 검색어나 서비스를 선택해 주세요." : "홈페이지에서 접수된 문의가 이곳에 안전하게 모입니다."}</p></div> : <div className="adm-list">{filtered.map((item) => <article className="adm-card" key={item.id}><div className="adm-card-top"><span className="adm-status"><i />{item.status}</span><time dateTime={new Date(item.createdAt).toISOString()}>{dateFormatter.format(new Date(item.createdAt))}</time></div><div className="adm-person"><div><h2>{item.company || item.name}<span>{item.company ? item.name : "개인 의뢰"}</span></h2><a href={`mailto:${encodeURIComponent(item.email)}`}>{item.email} ↗</a></div><span className="adm-reference">{item.reference}</span></div><div className="adm-tags"><span>{item.service}</span><span>{item.budget}</span></div><p className="adm-message">{item.message}</p><div className="adm-card-bottom"><span>개인정보 수집·이용 동의 확인</span><a href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`[${BRAND_NAME}] ${item.reference} 프로젝트 문의에 답변드립니다`)}`}>이메일로 답변하기 <span aria-hidden="true">↗</span></a></div></article>)}</div>}</section>;
}
