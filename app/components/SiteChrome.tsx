"use client";

import Link from "next/link";
import { BRAND_NAME, BRAND_ENGLISH_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import "./site-chrome.css";
import { useCommunityAuth } from "./CommunityAuth";

const contactEmail = "abyys1004@naver.com";
const navigation = [
  { label: "무료 진단", href: "/diagnosis" },
  { label: "업종별 상담", href: "/services" },
  { label: "개발 사례", href: "/cases" },
];
const aiServices = [
  { label: "AI 개발 도구", brand: "OSCODE", href: "https://oscode.workauto.co.kr/" },
  { label: "AI 에이전트", brand: "Native Agent", href: "https://agent.workauto.co.kr/" },
  { label: "지식 검색", brand: "Orbit Knowledge", href: "https://wiki.workauto.co.kr/" },
  { label: "책 추천", brand: "에이전트북", href: "https://book.workauto.co.kr/" },
  { label: "의류 검색", brand: "FIND / WEAR", href: "https://shop.workauto.co.kr/" },
  { label: "구매 기록", brand: "뭐샀지", href: "https://buy.workauto.co.kr/" },
  { label: "귀가 경로", brand: "집으로", href: "https://home.workauto.co.kr/" },
];

function AIServiceLinks({ onSelect }: { onSelect: () => void }) {
  return aiServices.map(service => (
    <a
      href={service.href}
      key={service.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${service.label} · ${service.brand} (새 탭에서 열림)`}
      title={`${service.brand} · 새 탭에서 열림`}
      onClick={onSelect}
    >
      <span><span className="ai-service-label">{service.label}</span><span className="ai-service-brand">{service.brand}</span></span>
      <ExternalLink size={15} aria-hidden="true" />
    </a>
  ));
}

function DesktopAIServices() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !groupRef.current?.contains(event.target)) setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 981px)");
    function onViewportChange() {
      if (!desktop.matches) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onViewportChange);
    };
  }, [open]);

  return (
    <div
      className="chrome-ai-disclosure"
      ref={groupRef}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={event => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        type="button"
        className="chrome-ai-toggle"
        ref={buttonRef}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(value => !value)}
      >
        AI 서비스 <ChevronDown size={13} aria-hidden="true" />
      </button>
      <div id={panelId} className="chrome-ai-panel" hidden={!open}>
        <AIServiceLinks onSelect={() => setOpen(false)} />
      </div>
    </div>
  );
}

function SiteBrand({ showIcon = false }: { showIcon?: boolean }) {
  return (
    <Link className="brand" href="/#home" aria-label={`${BRAND_NAME} 홈페이지 처음으로`}>
      {showIcon && <svg className="brand-icon" width="32" height="32" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="17" fill="#0071e3" />
        <path d="m12 20 8 25 12-22 12 22 8-25" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>}
      <span className="personal-brand-name">{BRAND_NAME}</span>
      <span className="personal-brand-role">{BRAND_ENGLISH_NAME}</span>
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useCommunityAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const mobileServicesId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function onFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    const desktop = window.matchMedia("(min-width: 981px)");
    function onViewportChange() {
      if (desktop.matches) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      desktop.removeEventListener("change", onViewportChange);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link site-chrome-skip-link" href="#main">본문으로 바로가기</a>
      <header className="site-header site-chrome-header" data-menu-open={menuOpen} ref={headerRef}>
        <div className="header-inner">
          <SiteBrand showIcon />
          <nav className="desktop-nav" aria-label="주 메뉴">
            {navigation.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}
            <DesktopAIServices />
            <Link href="/community">커뮤니티</Link>
            <Link href={user ? "/account" : "/account/login"}>{user ? "내 활동" : "로그인"}</Link>
          </nav>
          <Link href="/consultation" className="header-cta">
            무료 상담 신청 <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="menu-toggle"
            ref={toggleRef}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X strokeWidth={1.5} aria-hidden="true" /> : <Menu strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
        <nav id={menuId} className="mobile-nav chrome-mobile-nav" aria-label="모바일 메뉴" hidden={!menuOpen}>
          {navigation.map(item => (
            <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}<ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
          <div className="chrome-mobile-services" role="group" aria-labelledby={mobileServicesId}>
            <p id={mobileServicesId}>AI 서비스</p>
            <AIServiceLinks onSelect={() => setMenuOpen(false)} />
          </div>
          <Link href="/community" onClick={() => setMenuOpen(false)}>커뮤니티<ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link href={user ? "/account" : "/account/login"} onClick={() => setMenuOpen(false)}>{user ? "내 활동" : "로그인·회원가입"}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link className="chrome-mobile-consultation" href="/consultation" onClick={() => setMenuOpen(false)}>
            무료 상담 신청 <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <p className="chrome-mobile-note">첫 상담 0원 · 개발 비용은 상담 후 안내합니다.</p>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer section-wrap site-chrome-footer">
      <div>
        <SiteBrand />
        <p>{BRAND_TAGLINE}</p>
        <a className="footer-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </div>
      <div className="footer-right">
          <div className="footer-links">
          <Link href="/calculator">절감 시간 계산</Link>
          <Link href="/requests">내 의뢰 현황</Link>
          <Link href="/#about">소개·경력</Link>
          <Link href="/community/guide">커뮤니티 이용 안내</Link>
          <Link href="/admin">문의 관리</Link>
          <Link href="/#home">처음으로 <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <span>© 2026 {BRAND_ENGLISH_NAME}. All rights reserved.</span>
      </div>
    </footer>
  );
}
