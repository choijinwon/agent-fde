import assert from "node:assert/strict";

// Inspect actual server responses, including content available without JavaScript.
// Usage: node scripts/verify-seo.mjs http://127.0.0.1:5174
const base = new URL(process.argv[2] || "https://workauto.co.kr");
const canonicalOrigin = "https://workauto.co.kr";
const decode = value => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] || "");
const meta = (html, key) => [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).find(tag => attr(tag, "name") === key || attr(tag, "property") === key) || "";
async function get(path) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  return { response, html: await response.text() };
}

const robots = await get("/robots.txt");
assert.equal(robots.response.status, 200, "robots.txt status");
assert.match(robots.response.headers.get("content-type") || "", /text\/plain/);
assert.match(robots.html, /^User-agent: \*\nAllow: \/\nDisallow: \/api\/\n/m);
assert.ok(robots.html.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.response.status, 200, "sitemap status");
assert.match(sitemap.response.headers.get("content-type") || "", /xml/);
assert.match(sitemap.html, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
const locations = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(locations.length, 11, "all public landing pages in sitemap");
assert.equal(new Set(locations).size, locations.length, "no duplicate sitemap URLs");
const modified = [...sitemap.html.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
assert.equal(modified.length, locations.length, "editorial lastmod for each page");
assert.ok(modified.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date) && Date.parse(date) <= Date.now()), "valid, non-future revision dates");
const titles = new Set();
const descriptions = new Set();
let faqs = 0;
let relatedLinks = 0;
for (const location of locations) {
  const url = new URL(location);
  assert.equal(url.origin, canonicalOrigin, "canonical sitemap origin");
  const { response, html } = await get(url.pathname);
  assert.equal(response.status, 200, `${url.pathname} status`);
  const json = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1]));
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const title = decode(clean.match(/<title>([^<]+)<\/title>/)?.[1] || "");
  const description = attr(meta(clean, "description"), "content");
  assert.ok(title && !titles.has(title), `${url.pathname} unique title`);
  assert.ok(description && !descriptions.has(description), `${url.pathname} unique description`);
  titles.add(title); descriptions.add(description);
  const canonical = [...clean.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).filter(tag => attr(tag, "rel") === "canonical");
  assert.equal(canonical.length, 1, `${url.pathname} single canonical`);
  assert.equal(new URL(attr(canonical[0], "href")).href, location, `${url.pathname} canonical URL`);
  assert.equal(new URL(attr(meta(clean, "og:url"), "content")).href, location, `${url.pathname} Open Graph URL`);
  assert.doesNotMatch(`${attr(meta(clean, "robots"), "content")} ${response.headers.get("x-robots-tag") || ""}`, /noindex/i);
  assert.equal((clean.match(/<h1\b/g) || []).length, 1, `${url.pathname} one heading`);
  assert.match(clean, /<html[^>]*lang="ko"/);
  const entities = json.flatMap(value => value["@graph"] || [value]);
  assert.ok(entities.some(entity => entity["@id"] === `${location}#webpage`), `${url.pathname} page entity`);
  if (url.pathname.startsWith("/services/")) {
    const detailFaqs = (clean.match(/<details\b/g) || []).length;
    assert.equal(detailFaqs, 3, `${url.pathname} rendered FAQ answers`);
    faqs += detailFaqs;
    const related = clean.match(/<div class="industry-related-grid">([\s\S]*?)<\/div>/)?.[1] || "";
    const links = [...related.matchAll(/href="([^"]+)"/g)].map(match => decode(match[1]));
    assert.equal(links.length, 2, `${url.pathname} contextual related links`);
    for (const href of links) {
      assert.notEqual(href, url.pathname, "related link does not loop to same page");
      assert.ok(locations.includes(`${canonicalOrigin}${href}`), "related link in public sitemap");
    }
    relatedLinks += links.length;
    assert.ok(entities.some(entity => entity["@type"] === "Service"));
    assert.ok(entities.some(entity => entity["@type"] === "BreadcrumbList"));
  }
}
for (const path of ["/consultation", "/consultation?service=academy", "/admin"]) {
  const { response, html } = await get(path);
  assert.equal(response.status, 200);
  assert.match(attr(meta(html, "robots"), "content"), /noindex/i, `${path} excluded from search`);
  assert.ok(!locations.some(location => new URL(location).pathname === new URL(path, base).pathname));
}
for (const path of ["/services/not-a-real-service", "/not-a-real-page"]) {
  const { response } = await get(path);
  assert.equal(response.status, 404, `${path} real 404`);
}
const font = await fetch(new URL("/fonts/pretendard-variable-1.3.9.woff2", base));
assert.equal(font.status, 200, "self-hosted font served");
assert.equal(Buffer.from(await font.arrayBuffer()).subarray(0, 4).toString(), "wOF2");
console.log(JSON.stringify({ base: base.origin, publicPages: locations.length, uniqueTitles: titles.size, uniqueDescriptions: descriptions.size, renderedFaqs: faqs, relatedLinks, sitemap: "pass", robots: "pass", excludedPages: "pass", notFoundStatus: "pass", structuredData: "pass", font: "pass" }, null, 2));
