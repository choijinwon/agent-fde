import { verifiedSubmissionRecord } from "../../lib/request-rules";
import { openRequestStore, ingestRequest } from "../../lib/request-storage";
import { requestStoreName } from "../../lib/request-store-name";

// Netlify's reserved event filename requires the platform's verified JWS before
// invocation. Do not expose this handler through a custom HTTP path or API route.
// https://docs.netlify.com/build/functions/trigger-on-events/#signature
const handler = async (request: Request, context: { deploy?: { context?: string; id?: string } }) => {
  const deployment = context.deploy;
  const name = requestStoreName(deployment?.context, deployment?.id);
  if (!name) throw new Error("Request tracking deployment context unavailable");
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 128 * 1024) return new Response(null, { status: 413 });
  let parsed: { payload?: unknown };
  try { parsed = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  const record = verifiedSubmissionRecord(parsed.payload, deployment?.context === "production" ? "production" : "preview");
  if (record) await ingestRequest(openRequestStore(name), record);
  return new Response(null, { status: 204 });
};
export default handler;
