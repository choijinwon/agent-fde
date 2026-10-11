import type { NextConfig } from "next";
import { createHash } from "node:crypto";

// Embed only this nonsecret identifier. Netlify build variables are not
// guaranteed to exist inside the generated Next.js server function.
const context = process.env.CONTEXT;
const previewContext = context && ["deploy-preview", "branch-deploy", "dev"].includes(context);
const previewKey = process.env.DEPLOY_ID || `${process.env.BRANCH || "cli-preview"}:${process.env.COMMIT_REF || "working-tree"}`;
const communityStore = context === "production"
  ? "workauto-community"
  : previewContext
    ? `workauto-community-${createHash("sha256").update(`${context}:${previewKey}`).digest("hex").slice(0, 16)}`
    : "";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  env: {
    WORKAUTO_COMMUNITY_STORE: communityStore,
    WORKAUTO_REQUEST_STORE: context === "production" ? "workauto-requests" : previewContext && process.env.DEPLOY_ID ? `workauto-requests-${createHash("sha256").update(process.env.DEPLOY_ID).digest("hex").slice(0, 16)}` : "",
    NEXT_PUBLIC_REQUEST_CONTEXT: context === "production" ? "production" : "preview",
  },
};

export default nextConfig;
