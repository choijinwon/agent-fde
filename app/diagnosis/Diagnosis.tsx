"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronRight, RotateCcw } from "lucide-react";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { CONSULTATION_DRAFT_KEY, createDiagnosisDraft, diagnosisResult, DIAGNOSIS_FREQUENCIES, DIAGNOSIS_TASKS, DIAGNOSIS_TOOLS, type DiagnosisAnswers, validateDiagnosis } from "@/lib/diagnosis";
import styles from "./tools.module.css";

const questions = [
  { key: "industry", title: "어떤 분야에서 일하시나요?", note: "가장 가까운 분야를 골라주세요. 목록에 없는 업종도 가능합니다." },
  { key: "task", title: "가장 줄이고 싶은 반복은 무엇인가요?", note: "여러 업무가 있다면, 가장 자주 손이 가는 하나를 선택해 주세요." },
  { key: "tool", title: "주로 어떤 도구를 사용하시나요?", note: "지금의 작업 환경을 기준으로 골라주세요." },
  { key: "frequency", title: "이 업무는 얼마나 자주 반복되나요?", note: "정확한 수치가 없어도 괜찮습니다." },
] as const;

export default function Diagnosis() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<DiagnosisAnswers>>({});
  const [storageError, setStorageError] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const valid = validateDiagnosis(answers);
  const result = step === questions.length && valid ? diagnosisResult(valid) : null;
  const question = questions[Math.min(step, questions.length - 1)];
  const choices = step === 0 ? SERVICE_CATALOG.map(item => ({ value: item.slug, label: item.title, detail: item.service })) : step === 1 ? DIAGNOSIS_TASKS : step === 2 ? DIAGNOSIS_TOOLS : DIAGNOSIS_FREQUENCIES;

  function move(next: number) {
    setStep(next); setStorageError(false);
    requestAnimationFrame(() => { titleRef.current?.focus({ preventScroll: true }); titleRef.current?.scrollIntoView({ behavior: "instant", block: "center" }); });
  }

  function consult() {
    if (!valid) return;
    try { sessionStorage.setItem(CONSULTATION_DRAFT_KEY, createDiagnosisDraft(valid)); router.push("/consultation?from=diagnosis"); }
    catch { setStorageError(true); }
  }

  return <section className={styles.workspace} aria-label="업무 자동화 진단">
    <aside className={styles.sidebar}><p className={styles.sidebarTitle}>반복 업무를 살펴보는<br/>가장 가벼운 방법.</p><ol className={styles.stepList}>{["업종", "반복 업무", "사용 도구", "반복 빈도"].map((label, index) => <li key={label} className={step === index ? styles.activeStep : ""} aria-current={step === index ? "step" : undefined}><span>{step > index ? <Check size={15} aria-hidden="true"/> : `0${index + 1}`}</span>{label}</li>)}</ol><p className={styles.sidebarNote}>선택한 내용만 이 브라우저에 잠시 보관합니다. 상담 신청 전에는 이름이나 연락처를 받지 않습니다.</p></aside>
    <div className={styles.panel}>
      {result ? <><p className={styles.stepCount}>선택을 바탕으로 정리한 방향</p><h2 className={styles.questionTitle} ref={titleRef} tabIndex={-1}>{result.task.suggestion}</h2><p className={styles.questionNote}>실제 구현을 확정하는 진단은 아닙니다. 자료와 연동 환경을 확인하며 아래 순서로 시작할 수 있습니다.</p><div className={styles.resultTags}><span>{result.industry.title}</span><span>{result.tool.label}</span><span>{result.frequency.label}</span></div><ol className={styles.resultSteps}>{result.task.steps.map((line, index) => <li key={line}><span>{index + 1}</span><p>{line}</p></li>)}</ol><div className={styles.reviewNote}><strong>{result.industry.title}에서 함께 확인할 점</strong><p>{result.industry.reviewNote}</p></div><div className={styles.actions}><button type="button" className="button button-dark" onClick={consult}>이 내용으로 무료 상담 <ArrowRight size={17}/></button><button className={styles.textButton} type="button" onClick={() => { setAnswers({}); move(0); }}><RotateCcw size={15}/>다시 진단하기</button></div><p className={styles.footnote}>선택 내용이 상담란에 채워집니다. 수정한 뒤 직접 신청해 주세요.<br/>첫 상담은 0원이며 개발 비용은 상담 후 별도로 안내합니다.</p>{storageError && <div className={styles.error} role="alert"><p>브라우저에서 결과를 저장하지 못했습니다. 아래 내용을 복사해 상담란에 붙여 넣어 주세요.</p><textarea aria-label="복사할 진단 결과" readOnly value={result.message} rows={7}/><Link href={`/consultation?service=${result.industry.slug}`}>상담 페이지로 이동 <ChevronRight size={15}/></Link></div>}<Link className={styles.related} href="/calculator">반복 업무에 쓰는 시간도 계산해 볼까요? <ChevronRight size={16}/></Link></> : <><p className={styles.stepCount}>질문 {step + 1} / {questions.length}</p><h2 className={styles.questionTitle} ref={titleRef} tabIndex={-1}>{question.title}</h2><p className={styles.questionNote}>{question.note}</p><fieldset className={styles.choices}><legend className={styles.srOnly}>{question.title}</legend>{choices.map(choice => <label key={choice.value} className={`${styles.choice} ${answers[question.key] === choice.value ? styles.selected : ""}`}><input type="radio" name={question.key} value={choice.value} checked={answers[question.key] === choice.value} onChange={() => setAnswers(previous => ({ ...previous, [question.key]: choice.value }))}/><span><strong>{choice.label}</strong>{"detail" in choice && <small>{choice.detail}</small>}</span><span className={styles.checkmark} aria-hidden="true">{answers[question.key] === choice.value && <Check size={13}/>}</span></label>)}</fieldset><div className={styles.actions}>{step > 0 && <button type="button" className={styles.textButton} onClick={() => move(step - 1)}><ArrowLeft size={16}/>이전</button>}<button type="button" className="button button-dark" disabled={!answers[question.key]} onClick={() => move(step + 1)}>{step === questions.length - 1 ? "자동화 방향 보기" : "다음"}<ArrowRight size={17}/></button></div></>}
    </div>
  </section>;
}
