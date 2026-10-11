import { communityResponse } from "@/lib/community-http";
import { deleteCommunityPost, getPublicPost } from "@/lib/community-server";
import { CommunityError } from "@/lib/community-rules";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return communityResponse(async () => {
    const result = await getPublicPost((await context.params).id);
    if (!result.available) throw new CommunityError("커뮤니티 연결을 준비 중입니다.", 503, "unavailable");
    if (!result.post) throw new CommunityError("게시물을 찾을 수 없습니다.", 404, "not_found");
    return result;
  });
}

export async function DELETE(request: Request, context: Context) {
  return communityResponse(async () => { await deleteCommunityPost((await context.params).id); return { ok: true }; }, request);
}
