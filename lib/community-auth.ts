import "server-only";
import { cookies } from "next/headers";
import type { User } from "@netlify/identity";
import { SITE_URL } from "./seo";

const IDENTITY_USER_URL = `${SITE_URL}/.netlify/identity/user`;
const MAX_TOKEN_LENGTH = 8192;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function verifiedProviderUser(value: unknown): User | null {
  const user = record(value);
  if (!user || typeof user.id !== "string" || !UUID.test(user.id)
    || typeof user.email !== "string" || user.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(user.email)
    || typeof user.confirmed_at !== "string" || !Number.isFinite(Date.parse(user.confirmed_at))) return null;
  const profile = record(user.user_metadata);
  const application = record(user.app_metadata);
  const roles = Array.isArray(application?.roles) ? application.roles.filter((role): role is string => typeof role === "string" && role.length <= 64) : [];
  const name = typeof profile?.full_name === "string" ? profile.full_name : typeof profile?.name === "string" ? profile.name : undefined;
  return {
    id: user.id,
    email: user.email,
    confirmedAt: user.confirmed_at,
    name,
    roles,
    appMetadata: { roles },
  };
}

export async function verifyIdentityAccessToken(token: string | undefined, fetcher: typeof fetch = fetch): Promise<User | null> {
  // This is a format/size check only. The trusted Identity service verifies the
  // signature, expiry and account; no cookie/JWT claims are trusted locally.
  if (!token || token.length > MAX_TOKEN_LENGTH || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const response = await fetcher(IDENTITY_USER_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      redirect: "manual",
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status !== 200 || !response.headers.get("content-type")?.toLowerCase().includes("application/json")) return null;
    return verifiedProviderUser(await response.json());
  } catch {
    // Includes timeout, disabled Identity and malformed provider responses. Do
    // not fall back to unverified claims or log tokens/provider account data.
    return null;
  }
}

export async function getVerifiedCommunityIdentity(): Promise<User | null> {
  // The Next adapter does not expose the modern Functions cookie context used
  // by @netlify/identity's server getUser(); read the actual Next request instead.
  const token = (await cookies()).get("nf_jwt")?.value;
  return verifyIdentityAccessToken(token);
}
