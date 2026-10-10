"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, MoveUpRight } from "lucide-react";
import "./workflow-desk.css";

const deskExamples = [
  {
    name: "학원",
    source: "이번 달 수납 자료",
    files: ["원생 명단", "입금 내역", "환불 내역"],
    title: "수납 현황",
    rows: [["수납 대조", "정리 완료"], ["미납 대상", "별도 분류"], ["안내 준비", "담당자 확인"]],
    note: ["부분 납부는", "한 번 더 확인"],
    summary: "명단과 입금 내역을 모아 수납 현황과 확인할 항목을 정리하는 구성 예시입니다.",
  },
  {
    name: "병원",
    source: "오늘의 운영 자료",
    files: ["예약 일정", "접수 현황", "일정 변경"],
    title: "예약·접수 현황",
    rows: [["예약 일정", "한곳에 정리"], ["변경 요청", "별도 분류"], ["안내 준비", "직원 확인"]],
    note: ["겹치는 예약은", "한 번 더 확인"],
    summary: "예약과 접수 현황을 모아 변경 요청과 확인할 항목을 정리하는 구성 예시입니다.",
  },
  {
    name: "제조",
    source: "현장에서 모인 자료",
    files: ["수주 목록", "생산 실적", "재고 현황"],
    title: "생산·재고 현황",
    rows: [["품목별 실적", "한곳에 정리"], ["수량 차이", "별도 분류"], ["ERP 반영", "담당자 확인"]],
    note: ["수량 차이는", "한 번 더 확인"],
    summary: "수주와 생산 실적, 재고 자료를 모아 수량 차이를 확인하는 구성 예시입니다.",
  },
] as const;

export default function WorkflowDesk() {
  const [selected, setSelected] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const assemblyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);
  const dragging = useRef(false);
  const example = deskExamples[selected];

  function resetTilt() {
    dragging.current = false;
    const assembly = assemblyRef.current;
    if (!assembly) return;
    assembly.style.setProperty("--desk-tilt-x", "0deg");
    assembly.style.setProperty("--desk-tilt-y", "0deg");
    assembly.dataset.moving = "false";
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotion.current = preference.matches;
      if (preference.matches) resetTilt();
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion.current || (event.pointerType !== "mouse" && !dragging.current)) return;
    const bounds = sceneRef.current?.getBoundingClientRect();
    const assembly = assemblyRef.current;
    if (!bounds || !assembly) return;
    const horizontal = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const vertical = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    assembly.dataset.moving = "true";
    assembly.style.setProperty("--desk-tilt-x", `${(-vertical * 7).toFixed(2)}deg`);
    assembly.style.setProperty("--desk-tilt-y", `${(horizontal * 11).toFixed(2)}deg`);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion.current) return;
    dragging.current = true;
    if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture(event.pointerId);
    move(event);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragging.current = false;
    if (event.pointerType !== "mouse" || event.type === "pointercancel") resetTilt();
  }

  return (
    <div className="desk" role="group" aria-label="업종별 자동화 구성 예시">
      <div className="desk-heading"><span>흩어진 자료가, 일의 흐름으로.</span><span className="desk-example-label">구성 예시</span></div>
      <div
        className="desk-scene"
        ref={sceneRef}
        onPointerMove={move}
        onPointerDown={startDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={resetTilt}
        aria-hidden="true"
      >
        <div className="desk-scale">
          <div className="desk-ground-shadow" />
          <div className="desk-assembly" ref={assemblyRef}>
            <div className="desk-folder"><span className="desk-folder-tab">업무 자료</span><span className="desk-folder-rule" /><span className="desk-folder-mark">최진원</span></div>
            <div className="desk-paper desk-source-paper">
              <div className="desk-paper-clip" />
              <span className="desk-paper-kicker">01 / 원본 자료</span>
              <strong>{example.source}</strong>
              <div className="desk-source-list">{example.files.map((file, index) => <div key={file}><span className="desk-file-icon"><i /><i /><i /></span><span>{file}</span><small>{String(index + 1).padStart(2, "0")}</small></div>)}</div>
              <div className="desk-source-lines"><i /><i /><i /></div>
            </div>
            <div className="desk-paper desk-paper-under" />
            <div className="desk-paper desk-result-paper">
              <div className="desk-result-content" key={selected}>
                <div className="desk-result-top"><span className="desk-paper-kicker">02 / 정리된 업무</span><span className="desk-approval"><Check size={12} strokeWidth={1.7} /></span></div>
                <strong>{example.title}</strong>
                <div className="desk-result-divider" />
                <div className="desk-result-rows">{example.rows.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
                <div className="desk-result-foot"><span>필요한 확인만, 한눈에.</span><MoveUpRight size={14} strokeWidth={1.4} /></div>
              </div>
            </div>
            <div className="desk-note"><span>확인할 항목</span><p>{example.note[0]}<br />{example.note[1]}</p><svg viewBox="0 0 100 15" fill="none"><path d="M3 7C25 3 54 5 94 4M15 12C34 9 64 9 85 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></div>
            <div className="desk-pencil"><span /><i /></div>
          </div>
        </div>
      </div>
      <div className="desk-bottom">
        <div className="desk-switches" role="group" aria-label="예시 업종 선택">{deskExamples.map((item, index) => <button type="button" key={item.name} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.name}</button>)}</div>
        <p className="desk-hint"><span className="desk-hint-desktop">마우스로 살짝 움직여 보세요</span><span className="desk-hint-touch">옆으로 살짝 움직여 보세요</span><span aria-hidden="true">↔</span></p>
      </div>
      <p className="desk-screen-reader" role="status" aria-live="polite" aria-atomic="true">{example.summary}</p>
    </div>
  );
}
