import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { CASE_STUDIES } from "@/lib/case-studies";
import { pageUpdatedAt } from "@/lib/seo";
import { sitemapResponse, sitemapUrlSet } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  // Public landing pages remain discoverable when the community store is unavailable.
  const paths = ["/", "/services", "/education", "/diagnosis", "/calculator", "/cases", ...CASE_STUDIES.map(item => `/cases/${item.slug}`), "/community/guide", ...SERVICE_CATALOG.map(item => `/services/${item.slug}`)];
  return sitemapResponse(sitemapUrlSet(paths.map(path => ({
    path,
    lastModified: path.startsWith("/community") ? undefined : pageUpdatedAt(path),
  }))));
}
