export function safeAccountDestination(value: string | null | undefined): string {
  if (!value || /[\\\u0000-\u0020]/.test(value) || value.startsWith("//")) return "/account";
  return /^\/(community|account)(?:\/|\?|$)/.test(value) ? value : "/account";
}

export function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (/confirm|verified/.test(message)) return "가입한 이메일의 인증 링크를 먼저 눌러 주세요. 스팸함도 확인해 주세요.";
  if (/already|registered|exists/.test(message)) return "이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정해 주세요.";
  if (/invalid.*(grant|credential)|password|unauthorized/.test(message)) return "이메일과 비밀번호를 확인해 주세요.";
  if (/rate|too many|429/.test(message)) return "요청이 많습니다. 잠시 뒤 다시 시도해 주세요.";
  if (/token|expired/.test(message)) return "인증 링크가 만료되었거나 유효하지 않습니다. 새 링크를 요청해 주세요.";
  return "요청을 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
}
