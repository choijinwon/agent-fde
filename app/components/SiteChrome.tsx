"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import "./site-chrome.css";

const contactEmail = "abyys1004@naver.com";
const navigation = [
  { label: "소개·경력", href: "/#about" },
  { label: "업종별 상담", href: "/services" },
  { label: "진행 방식", href: "/#process" },
];

function PersonalBrand() {
  return (
    <a className="brand" href="/#home" aria-label="최진원 홈페이지 처음으로">
      <span className="personal-brand-name">최진원</span>
      <span className="personal-brand-role">업무 자동화</span>
    </a>
  );
}

export function SiteHeader() {
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
      <a className="skip-link" href="#main">본문으로 바로가기</a>
      <header className="site-header site-chrome-header" ref={headerRef}>
        <div className="header-inner">
          <PersonalBrand />
          <nav className="desktop-nav" aria-label="주 메뉴">
            {navigation.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}
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
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        <nav id={menuId} className="mobile-nav chrome-mobile-nav" aria-label="모바일 메뉴" hidden={!menuOpen}>
          {navigation.map(item => (
            <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}<ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
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
        <PersonalBrand />
        <p>반복되는 일을 줄이고, 필요한 일에 집중하도록.</p>
        <a className="footer-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </div>
      <div className="footer-right">
        <div className="footer-links">
          <a href="/admin">문의 관리</a>
          <a href="/#home">처음으로 <ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
        <span>© 2026 최진원. All rights reserved.</span>
      </div>
    </footer>
  );
}
