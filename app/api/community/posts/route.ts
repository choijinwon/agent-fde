import { communityResponse } from "@/lib/community-http";
import { readCommunityJson } from "@/lib/community-rules";
import { createCommunityPost, listPublicPosts } from "@/lib/community-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return communityResponse(() => listPublicPosts({ kind: params.get("kind") || undefined, industry: params.get("industry") || undefined, cursor: params.get("cursor") || undefined, q: params.get("q") || undefined }));
}

export async function POST(request: Request) {
  return communityResponse(async () => ({ post: await createCommunityPost(await readCommunityJson(request)) }), request, 201);
}
