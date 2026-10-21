import { SITE_URL } from "./seo";

const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
const declaration = '<?xml version="1.0" encoding="UTF-8"?>\n';
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character]!);

export function sitemapIndex(paths: string[]) {
  return `${declaration}<sitemapindex xmlns="${namespace}">${paths.map(path => `<sitemap><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></sitemap>`).join("")}</sitemapindex>`;
}

export function sitemapUrlSet(entries: { path: string; lastModified?: string }[]) {
  return `${declaration}<urlset xmlns="${namespace}">${entries.map(({ path, lastModified }) => `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : ""}</url>`).join("")}</urlset>`;
}

export function sitemapResponse(xml: string) {
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
