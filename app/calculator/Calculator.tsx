"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { calculateSavings, CONSULTATION_DRAFT_KEY, createCalculatorDraft, readConsultationDraft, SAVINGS_LIMITS, type SavingsInput } from "@/lib/diagnosis";
import styles from "../diagnosis/tools.module.css";

const initialValues = { minutes: "30", timesPerWeek: "5", people: "1", automationPercent: "50" };
const fields = [
  { key: "minutes", label: "1인 기준 업무 1회", unit: "분", help: "한 사람이 한 번 처리하는 시간" },
  { key: "timesPerWeek", label: "1인 기준 주간 반복", unit: "회", help: "한 사람이 일주일에 처리하는 횟수" },
  { key: "people", label: "같은 업무를 하는 인원", unit: "명", help: "각자 같은 횟수로 처리하는 사람 수" },
  { key: "automationPercent", label: "절감 비율 가정", unit: "%", help: "기본 50%는 예시입니다. 직접 조절해 주세요." },
] as const;
const hours = (value: number) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);

export default function Calculator() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [storageError, setStorageError] = useState(false);
  const input = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() === "" ? NaN : Number(value)])) as SavingsInput;
  let result: ReturnType<typeof calculateSavings> | null = null;
  let error = "";
  try { result = calculateSavings(input); } catch (issue) { error = issue instanceof Error ? issue.message : "입력값을 확인해 주세요."; }

  function consult() {
    if (!result) return;
    try { sessionStorage.setItem(CONSULTATION_DRAFT_KEY, createCalculatorDraft(input)); router.push("/consultation?from=calculator"); }
    catch { setStorageError(true); }
  }

  return <><div className={styles.calculatorGrid}><section className={styles.panel} aria-labelledby="calculator-input-title"><p className={styles.stepCount}>현재 반복하는 업무</p><h2 className={styles.questionTitle} id="calculator-input-title">얼마나 자주, 얼마나 오래.</h2><p className={styles.questionNote}>같은 업무를 여러 사람이 함께 한 번 처리한다면 인원을 1명으로 두고 전체 소요 시간을 입력해 주세요.</p><div className={styles.inputGrid}>{fields.map(field => <label className={styles.numberLabel} key={field.key} htmlFor={`savings-${field.key}`}>{field.label}<span className={styles.numberField}><input id={`savings-${field.key}`} type="number" inputMode="numeric" min={SAVINGS_LIMITS[field.key].min} max={SAVINGS_LIMITS[field.key].max} step="1" value={values[field.key]} aria-describedby={`help-${field.key}`} onChange={event => { setValues(previous => ({ ...previous, [field.key]: event.target.value })); setStorageError(false); }}/><span>{field.unit}</span></span><span className={styles.inputHelp} id={`help-${field.key}`}>{field.help}<br/>{SAVINGS_LIMITS[field.key].min}~{SAVINGS_LIMITS[field.key].max.toLocaleString("ko-KR")}{field.unit} 입력 가능</span></label>)}</div>{error && <p className={styles.error} role="alert">{error}</p>}<div className={styles.formula}><strong>이렇게 계산합니다.</strong><p>월 업무 시간 = 1회 시간 × 주간 횟수 × 인원 × 52주 ÷ 12개월 ÷ 60분</p><p>월 예상 절감 시간 = 월 업무 시간 × 절감 비율</p></div></section><section className={`${styles.panel} ${styles.resultPanel}`} aria-labelledby="calculator-result-title"><p className={styles.stepCount}>입력한 가정에 따른 계산</p><h2 className={styles.questionTitle} id="calculator-result-title">한 달에 줄일 수 있는 시간</h2><div aria-live="polite" aria-atomic="true">{result ? <><p className={styles.resultValue}><small>약</small>{hours(result.monthlySavedHours)}<span>시간 / 월</span></p><dl className={styles.breakdown}><div><dt>현재 월 업무 시간</dt><dd>약 {hours(result.monthlyHours)}시간</dd></div><div><dt>자동화 후 남는 시간</dt><dd>약 {hours(result.monthlyRemainingHours)}시간</dd></div><div><dt>1년 예상 절감 시간</dt><dd>약 {hours(result.yearlySavedHours)}시간</dd></div></dl></> : <p className={styles.questionNote}>왼쪽 입력값을 확인하면 계산 결과가 표시됩니다.</p>}</div><p className={styles.calculationNote}>연 52주를 월평균으로 환산한 단순 추정입니다. 휴일·계절 변동, 구축 시간과 유지보수 시간은 반영하지 않았습니다. 실제 절감 시간은 연동 범위, 예외 처리와 사람의 검토 시간에 따라 달라집니다.</p><div className={styles.actions}><button type="button" className="button button-dark" disabled={!result} onClick={consult}>이 업무, 자동화 상담하기 <ArrowRight size={17}/></button></div><p className={styles.footnote}>계산값이 상담란에 채워집니다. 내용을 수정한 뒤 신청해 주세요.<br/>첫 상담은 0원이며 개발 비용은 별도입니다.</p>{storageError && result && <div className={styles.error} role="alert"><p>계산값을 저장하지 못했습니다. 아래 내용을 복사해 상담란에 붙여 넣어 주세요.</p><textarea rows={8} aria-label="복사할 계산 결과" readOnly value={readConsultationDraft(createCalculatorDraft(input), "calculator")?.message ?? ""}/><Link href="/consultation">상담 페이지로 이동 <ChevronRight size={15}/></Link></div>}<Link className={styles.related} href="/diagnosis">어디부터 시작할지 고민된다면, 1분 진단 <ChevronRight size={16}/></Link></section></div></>;
}
