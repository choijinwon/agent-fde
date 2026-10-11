import { communityResponse } from "@/lib/community-http";
import { myRequests } from "@/lib/request-server";
export const dynamic = "force-dynamic";
export const GET = () => communityResponse(myRequests);
