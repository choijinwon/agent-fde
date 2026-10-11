import { communityResponse } from "@/lib/community-http";
import { managedRequests } from "@/lib/request-server";
export const dynamic = "force-dynamic";
export const GET = () => communityResponse(managedRequests);
