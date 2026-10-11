import { communityResponse } from "@/lib/community-http";
import { readCommunityJson } from "@/lib/community-rules";
import { createCommunityComment } from "@/lib/community-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return communityResponse(async () => ({ comment: await createCommunityComment((await context.params).id, await readCommunityJson(request)) }), request, 201);
}
