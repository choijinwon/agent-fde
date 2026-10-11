import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { SITE_URL, CONTENT_UPDATED_AT } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const paths = ["/", "/services", ...SERVICE_CATALOG.map(item => `/services/${item.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${SITE_URL}${path}</loc><lastmod>${CONTENT_UPDATED_AT}</lastmod></url>`).join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
