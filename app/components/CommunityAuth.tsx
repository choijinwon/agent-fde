"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { acceptInvite, getSettings, getUser, handleAuthCallback, login as identityLogin, logout as identityLogout, onAuthChange, requestPasswordRecovery, signup as identitySignup, updateUser, type User } from "@netlify/identity";
import { authErrorMessage } from "@/lib/auth-ui";

export type CommunityMember = { id: string; name: string; email: string; isAdmin: boolean };
type AuthContextValue = {
  user: CommunityMember | null; loading: boolean; available: boolean; signupEnabled: boolean; error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ confirmed: boolean }>;
  logout: () => Promise<void>; recover: (email: string) => Promise<void>; resetPassword: (password: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const authHash = /^#(?:confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;
function member(user: User | null): CommunityMember | null {
  return user ? { id: user.id, name: user.name?.trim() || "회원", email: user.email || "", isAdmin: user.roles?.includes("admin") === true } : null;
}

export function CommunityAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CommunityMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [signupEnabled, setSignupEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const callbackPromise = useRef<ReturnType<typeof handleAuthCallback> | null>(null);
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthChange((_event, next) => { if (active) setUser(member(next)); });
    async function initialize() {
      try {
        if (authHash.test(window.location.hash)) {
          setProcessing(true);
          callbackPromise.current ??= handleAuthCallback();
          const result = await callbackPromise.current;
          if (!active) return;
          if (result?.type === "invite" && result.token) {
            // Keep the invite secret in memory, never in a query string or logs.
            setInviteToken(result.token);
            setAvailable(true);
            setProcessing(false);
            setLoading(false);
            return;
          }
          if (result?.type === "recovery") {
            window.location.replace("/account/login?mode=reset");
            return;
          }
          if (result) { window.location.replace("/account"); return; }
        }
        const [settings, current] = await Promise.all([getSettings(), getUser()]);
        if (active) { setAvailable(true); setSignupEnabled(!settings.disableSignup); setUser(member(current)); }
      } catch (cause) {
        if (active && authHash.test(window.location.hash)) setError(authErrorMessage(cause));
      } finally {
        if (active) { setLoading(false); setProcessing(false); }
      }
    }
    void initialize();
    return () => { active = false; unsubscribe(); };
  }, []);
  const value: AuthContextValue = {
    user, loading, available, signupEnabled, error,
    async login(email, password) { setUser(member(await identityLogin(email.trim(), password))); },
    async signup(email, password, name) {
      const result = await identitySignup(email.trim(), password, { full_name: name.trim(), community_consent: "2026-10-11" });
      const current = await getUser();
      setUser(member(current));
      return { confirmed: Boolean(current && current.id === result.id) };
    },
    async logout() { try { await identityLogout(); } finally { setUser(null); } },
    async recover(email) { await requestPasswordRecovery(email.trim()); },
    async resetPassword(password) {
      if (inviteToken) { setUser(member(await acceptInvite(inviteToken, password))); setInviteToken(null); }
      else setUser(member(await updateUser({ password })));
    },
  };
  return <AuthContext.Provider value={value}>
    {processing ? <div className="auth-callback" role="status">이메일 인증을 확인하고 있습니다…</div> : inviteToken ? <InvitePassword submit={value.resetPassword} /> : children}
    {error && <div className="auth-callback-error" role="alert">{error} <a href="/account/login">로그인 화면으로</a></div>}
  </AuthContext.Provider>;
}
function InvitePassword({ submit }: { submit: (password: string) => Promise<void> }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  return <main id="main" className="auth-callback"><form onSubmit={async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError("");
    try { await submit(String(form.get("password"))); window.location.replace("/account"); }
    catch (cause) { setError(authErrorMessage(cause)); } finally { setBusy(false); }
  }}><h1>워크오토에 오신 것을 환영합니다.</h1><label>사용할 비밀번호<input name="password" type="password" required minLength={10} maxLength={128} autoComplete="new-password" /></label><button type="submit" disabled={busy}>{busy ? "설정 중…" : "비밀번호 설정"}</button>{error && <p role="alert">{error}</p>}</form></main>;
}
export function useCommunityAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("CommunityAuthProvider is required");
  return value;
}
