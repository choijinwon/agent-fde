import { createHash } from "node:crypto";

// Both the native event function and Next build use trusted platform metadata.
// No browser field, hostname, or missing context may select production.
export function requestStoreName(context: string | undefined, deployId?: string): string {
  if (context === "production") return "workauto-requests";
  if (!["deploy-preview", "branch-deploy", "dev"].includes(context || "") || !deployId) return "";
  return `workauto-requests-${createHash("sha256").update(deployId).digest("hex").slice(0, 16)}`;
}
