"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useCommunityAuth } from "@/app/components/CommunityAuth";
import { authErrorMessage } from "@/lib/auth-ui";

type Mode = "login" | "signup" | "recover" | "reset";
export default function AuthForm({ initialMode, next }: { initialMode: Mode; next: string }) {
  const auth = useCommunityAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  function changeMode(value: Mode) { setMode(value); setError(""); setNotice(""); }
  const title = { login: "다시 만나 반갑습니다.", signup: "함께, 일을 더 가볍게.", recover: "비밀번호를 잊으셨나요?", reset: "새 비밀번호를 설정하세요." }[mode];
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    const data = new FormData(event.currentTarget); const email = String(data.get("email") || "").trim(); const password = String(data.get("password") || "");
    if ((mode === "signup" || mode === "reset") && password !== data.get("passwordConfirm")) { setError("비밀번호가 서로 다릅니다. 다시 확인해 주세요."); return; }
    if (mode === "signup" && !data.get("consent")) { setError("가입 안내를 확인하고 동의해 주세요."); return; }
    if (data.get("website")) { setError("요청을 처리하지 못했습니다."); return; }
    setBusy(true);
    try {
      if (mode === "login") { await auth.login(email, password); window.location.assign(next); }
      else if (mode === "signup") {
        const result = await auth.signup(email, password, String(data.get("name") || ""));
        if (result.confirmed) window.location.assign(next);
        else setNotice("인증 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다. 메일이 보이지 않으면 스팸함도 확인해 주세요.");
      } else if (mode === "recover") { await auth.recover(email); setNotice("해당 이메일로 가입된 계정이 있다면 재설정 안내가 발송됩니다. 메일의 링크를 눌러 새 비밀번호를 설정해 주세요."); }
      else { await auth.resetPassword(password); window.location.assign("/account"); }
    } catch (cause) { setError(authErrorMessage(cause)); } finally { setBusy(false); }
  }
  return <div className="member-login-layout">
    <section className="member-login-intro"><Link href="/community" className="member-back"><ArrowLeft size={16} /> 커뮤니티로</Link><p className="member-eyebrow">WORKAUTO COMMUNITY</p><h1>{title}</h1><p>혼자 반복하던 업무도,<br />함께 이야기하면 다른 방법이 보입니다.</p><div className="member-benefits"><p><CheckCircle2 size={18} /> 내 업무에 맞는 자동화 질문</p><p><CheckCircle2 size={18} /> 직접 해본 방법과 경험 나누기</p><p><CheckCircle2 size={18} /> 내가 쓴 글과 답변 모아보기</p></div><p className="member-guest-note">글 읽기와 <Link href="/consultation">무료 상담</Link>은 가입 없이 이용할 수 있어요.</p></section>
    <section className="member-auth-card" aria-label="회원 인증">
      {(mode === "login" || mode === "signup") && <div className="member-mode-tabs" role="group" aria-label="로그인 또는 회원가입"><button type="button" aria-pressed={mode === "login"} onClick={() => changeMode("login")}>로그인</button><button type="button" aria-pressed={mode === "signup"} onClick={() => changeMode("signup")}>회원가입</button></div>}
      <h2>{ {login:"이메일로 로그인",signup:"처음 오셨나요?",recover:"재설정 메일 받기",reset:"비밀번호 설정"}[mode] }</h2>
      <p className="member-card-description">{mode === "signup" ? "이메일과 닉네임으로 시작하세요." : mode === "recover" ? "가입할 때 사용한 이메일을 입력해 주세요." : mode === "reset" ? "다른 서비스와 겹치지 않는 비밀번호를 사용해 주세요." : "질문하고 경험을 나누는 공간입니다."}</p>
      {auth.loading ? <p className="member-info" role="status">회원 서비스를 확인하고 있습니다…</p> : !auth.available ? <div className="member-info" role="status"><strong>회원 서비스 연결을 마무리하고 있습니다.</strong><p>가입과 로그인은 준비가 끝나면 이용할 수 있습니다. 지금 필요한 도움이 있다면 <Link href="/consultation">무료 상담</Link>을 이용해 주세요.</p></div> : null}
      {notice ? <div className="member-success" role="status"><Mail size={26} /><p>{notice}</p><button className="member-secondary" type="button" onClick={() => changeMode("login")}>로그인 화면으로</button></div> : mode === "reset" && !auth.loading && !auth.user ? <div className="member-info"><p>재설정 이메일의 링크로 들어와 주세요.</p><button type="button" className="member-secondary" onClick={() => changeMode("recover")}>재설정 메일 받기</button></div> : <form onSubmit={submit} key={mode}>
        {mode === "signup" && <label className="member-field">닉네임<input name="name" type="text" required minLength={2} maxLength={24} autoComplete="nickname" placeholder="공개될 이름 · 2~24자" /></label>}
        {mode !== "reset" && <label className="member-field">이메일<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="hello@example.com" /></label>}
        {mode !== "recover" && <label className="member-field">{mode === "reset" ? "새 비밀번호" : "비밀번호"}<input name="password" type="password" required minLength={mode === "login" ? 1 : 10} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "login" ? "비밀번호를 입력하세요" : "10자 이상 입력하세요"} /></label>}
        {(mode === "signup" || mode === "reset") && <label className="member-field">비밀번호 확인<input name="passwordConfirm" type="password" required minLength={10} maxLength={128} autoComplete="new-password" placeholder="한 번 더 입력하세요" /></label>}
        <div className="member-trap" aria-hidden="true"><label>웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        {mode === "signup" && <label className="member-consent"><input name="consent" type="checkbox" required /><span><Link href="/community/guide#privacy" target="_blank">개인정보 수집·이용 안내</Link>와 <Link href="/community/guide" target="_blank">커뮤니티 운영 규칙</Link>을 확인하고 동의합니다. 닉네임과 작성한 글은 공개됩니다.</span></label>}
        {error && <p className="member-error" role="alert">{error}</p>}
        {mode === "signup" && auth.available && !auth.signupEnabled && <p className="member-info">현재 새 회원가입을 받지 않고 있습니다.</p>}
        <button type="submit" className="member-submit" disabled={busy || auth.loading || !auth.available || (mode === "signup" && !auth.signupEnabled)}>{busy ? "처리 중…" : {login:"로그인",signup:"인증 메일 받고 가입하기",recover:"재설정 메일 보내기",reset:"새 비밀번호 저장"}[mode]}<ArrowRight size={17} /></button>
        {mode === "login" && <button className="member-forgot" type="button" onClick={() => changeMode("recover")}>비밀번호를 잊으셨나요?</button>}
        {(mode === "recover" || mode === "reset") && <button className="member-forgot" type="button" onClick={() => changeMode("login")}>로그인으로 돌아가기</button>}
      </form>}
    </section>
  </div>;
}
