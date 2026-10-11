import { communityResponse } from "@/lib/community-http";
import { getCommunityModeration } from "@/lib/community-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return communityResponse(getCommunityModeration);
}
