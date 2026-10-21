import { listPublicPostSitemapEntries } from "@/lib/community-server";
import { sitemapResponse, sitemapUrlSet } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await listPublicPostSitemapEntries();
    return sitemapResponse(sitemapUrlSet([{ path: "/community" }, ...posts.map(post => ({
      path: `/community/${post.id}`,
      lastModified: new Date(post.updatedAt).toISOString(),
    }))]));
  } catch {
    // Do not replace the published post list with an empty successful response during an outage.
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "300" } });
  }
}
