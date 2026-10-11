import { communityResponse } from "@/lib/community-http";
import { readCommunityJson } from "@/lib/community-rules";
import { moderateCommunityContent } from "@/lib/community-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  return communityResponse(async () => { await moderateCommunityContent(await readCommunityJson(request)); return { ok: true }; }, request);
}
