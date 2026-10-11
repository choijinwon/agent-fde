"use client";

import { BRAND_NAME, BRAND_ENGLISH_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import "./site-chrome.css";
import { useCommunityAuth } from "./CommunityAuth";

const contactEmail = "abyys1004@naver.com";
const navigation = [
  { label: "소개·경력", href: "/#about" },
  { label: "업종별 상담", href: "/services" },
  { label: "커뮤니티", href: "/community" },
];

function SiteBrand({ showIcon = false }: { showIcon?: boolean }) {
  return (
    <a className="brand" href="/#home" aria-label={`${BRAND_NAME} 홈페이지 처음으로`}>
      {showIcon && <svg className="brand-icon" width="32" height="32" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="17" fill="#0071e3" />
        <path d="m12 20 8 25 12-22 12 22 8-25" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>}
      <span className="personal-brand-name">{BRAND_NAME}</span>
      <span className="personal-brand-role">{BRAND_ENGLISH_NAME}</span>
    </a>
  );
}

export function SiteHeader() {
  const { user } = useCommunityAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
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
    const desktop = window.matchMedia("(min-width: 721px)");
    function onViewportChange() {
      if (desktop.matches) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
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
            {navigation.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}
            <a href={user ? "/account" : "/account/login"}>{user ? "내 활동" : "로그인"}</a>
          </nav>
          <a href="/consultation" className="header-cta">
            무료 상담 신청 <ArrowUpRight size={16} aria-hidden="true" />
          </a>
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
            <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}<ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
          <a href={user ? "/account" : "/account/login"} onClick={() => setMenuOpen(false)}>{user ? "내 활동" : "로그인·회원가입"}<ArrowUpRight size={18} aria-hidden="true" /></a>
          <a className="chrome-mobile-consultation" href="/consultation" onClick={() => setMenuOpen(false)}>
            무료 상담 신청 <ArrowUpRight size={18} aria-hidden="true" />
          </a>
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
          <a href="/community/guide">커뮤니티 이용 안내</a>
          <a href="/admin">문의 관리</a>
          <a href="/#home">처음으로 <ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
        <span>© 2026 {BRAND_ENGLISH_NAME}. All rights reserved.</span>
      </div>
    </footer>
  );
}
