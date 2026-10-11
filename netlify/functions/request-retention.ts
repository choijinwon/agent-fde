import { openRequestStore, scanRequests } from "../../lib/request-storage";
import { requestStoreName } from "../../lib/request-store-name";

const handler = async (_request: Request, context: { deploy?: { context?: string; id?: string } }) => {
  const name = requestStoreName(context.deploy?.context, context.deploy?.id);
  if (!name) throw new Error("Request retention deployment context unavailable");
  await scanRequests(openRequestStore(name));
  return new Response(null, { status: 204 });
};
export default handler;
// Scheduled functions reject external HTTP invocation; run daily at noon KST.
export const config = { schedule: "0 3 * * *" };
