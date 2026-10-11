import { communityResponse } from "@/lib/community-http";
import { readCommunityJson } from "@/lib/community-rules";
import { updateRequest, deleteManagedRequest } from "@/lib/request-server";
export const dynamic = "force-dynamic";
type Route = { params: Promise<{ id: string }> };
export const PATCH = (request: Request, context: Route) => communityResponse(async () => updateRequest((await context.params).id, await readCommunityJson(request)), request);
export const DELETE = (request: Request, context: Route) => communityResponse(async () => deleteManagedRequest((await context.params).id), request);
