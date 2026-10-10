import type { InquiryInput } from "./inquiry-validation";

export const NETLIFY_FORM_NAME = "automation-consultation";
export const NETLIFY_FORM_ACTION = "/__forms.html";

/** Keep these fields in sync with the static Netlify form declaration. */
export function encodeNetlifyConsultation(input: InquiryInput, startedAt: number): string {
  return new URLSearchParams({
    "form-name": NETLIFY_FORM_NAME,
    name: input.name,
    email: input.email,
    company: input.company,
    service: input.service,
    budget: input.budget,
    message: input.message,
    consent: "true",
    website: "",
    startedAt: String(startedAt),
    requestId: input.requestId,
  }).toString();
}

/** Always link to Netlify itself; do not accept arbitrary dashboard URLs. */
export function getNetlifyFormsUrl(siteSlug?: string, deploymentUrl?: string): string {
  const validSlug = (value: string): boolean => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value);
  let slug = siteSlug?.trim().toLowerCase() ?? "";
  if (!validSlug(slug)) {
    slug = "";
    try {
      const url = new URL(deploymentUrl ?? "");
      const match = /^([a-z0-9-]+)\.netlify\.app$/.exec(url.hostname);
      if (url.protocol === "https:" && !url.username && !url.password && !url.port && match && validSlug(match[1])) slug = match[1];
    } catch { /* No deployment URL in local development. */ }
  }
  return slug ? `https://app.netlify.com/projects/${slug}/forms` : "https://app.netlify.com/projects";
}
