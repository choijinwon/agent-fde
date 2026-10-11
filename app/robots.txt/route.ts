import { SITE_URL } from "@/lib/seo";

export function GET() {
  // The public admin guide must be crawlable for its noindex directive to be read.
  return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
