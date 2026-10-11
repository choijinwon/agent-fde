import { assertCommunityOrigin, CommunityError } from "./community-rules";

export function communityJson(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function communityResponse(action: () => Promise<unknown>, request?: Request, status = 200): Promise<Response> {
  try {
    if (request) assertCommunityOrigin(request);
    return communityJson(await action(), status);
  } catch (error) {
    if (error instanceof CommunityError) return communityJson({ error: error.message, code: error.code }, error.status);
    console.error("Community request failed", error instanceof Error ? error.name : "UnknownError");
    return communityJson({ error: "현재 커뮤니티 연결이 원활하지 않습니다. 잠시 후 다시 이용해 주세요.", code: "unavailable" }, 503);
  }
}
