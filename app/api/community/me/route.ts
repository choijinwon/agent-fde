import { communityResponse } from "@/lib/community-http";
import { getCommunityUser, getMyCommunityPosts } from "@/lib/community-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return communityResponse(async () => {
    const user = await getCommunityUser();
    return { user, posts: user ? await getMyCommunityPosts(user) : [] };
  });
}
