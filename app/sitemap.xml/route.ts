import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { SITE_URL, CONTENT_UPDATED_AT } from "@/lib/seo";
import { listPublicPostSitemapEntries } from "@/lib/community-server";
import { CASE_STUDIES } from "@/lib/case-studies";

export const dynamic = "force-dynamic";
export async function GET() {
  const paths = ["/", "/services", "/diagnosis", "/calculator", "/cases", ...CASE_STUDIES.map(item => `/cases/${item.slug}`), "/community", "/community/guide", ...SERVICE_CATALOG.map(item => `/services/${item.slug}`)];
  try {
    const posts = await listPublicPostSitemapEntries();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${SITE_URL}${path}</loc>${path.startsWith("/community") ? "" : `<lastmod>${CONTENT_UPDATED_AT}</lastmod>`}</url>`).join("")}${posts.map(post => `<url><loc>${SITE_URL}/community/${post.id}</loc><lastmod>${new Date(post.updatedAt).toISOString()}</lastmod></url>`).join("")}</urlset>`;
    return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
  } catch {
    // A temporary storage failure must not publish an incomplete successful sitemap.
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "300" } });
  }
}
