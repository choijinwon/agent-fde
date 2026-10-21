import assert from "node:assert/strict";

// Read-only inspection of server responses, including content available without JavaScript.
// Usage: node scripts/verify-seo.mjs http://localhost:5174
const base = new URL(process.argv[2] || "https://workauto.co.kr");
const canonicalOrigin = "https://workauto.co.kr";
const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
const serviceSlugs = ["academy", "hospital", "manufacturing", "excel-accounting", "commerce", "logistics", "store", "office", "custom"];
const caseSlugs = ["smart-factory", "design-learning", "ai-agent-data"];
const landingPaths = ["/", "/services", "/education", "/diagnosis", "/calculator", "/cases", ...caseSlugs.map(slug => `/cases/${slug}`), "/community", "/community/guide", ...serviceSlugs.map(slug => `/services/${slug}`)];
const postPath = /^\/community\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const decode = value => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] || "");
const meta = (html, key) => [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).find(tag => attr(tag, "name") === key || attr(tag, "property") === key) || "";
async function get(path) {
  const response = await fetch(new URL(path, base), { method: "GET", redirect: "manual", signal: AbortSignal.timeout(30000) });
  return { response, html: await response.text() };
}
async function api(path, status = 200) {
  const { response, html } = await get(path);
  assert.equal(response.status, status, `${path} status`);
  assert.match(response.headers.get("content-type") || "", /application\/json/, `${path} JSON response`);
  assert.match(response.headers.get("cache-control") || "", /no-store/, `${path} not shared-cached`);
  return JSON.parse(html);
}

const robots = await get("/robots.txt");
assert.equal(robots.response.status, 200, "robots.txt status");
assert.match(robots.response.headers.get("content-type") || "", /text\/plain/);
assert.match(robots.html, /^User-agent: \*\nAllow: \/\nDisallow: \/api\/\n/m);
assert.ok(robots.html.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.response.status, 200, "sitemap status");
assert.match(sitemap.response.headers.get("content-type") || "", /xml/);
assert.match(sitemap.html, /<sitemapindex xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
const sitemapLocations = [...sitemap.html.matchAll(/<sitemap><loc>([^<]+)<\/loc><\/sitemap>/g)].map(match => match[1]);
assert.deepEqual(sitemapLocations, [`${canonicalOrigin}/sitemap-pages.xml`, `${canonicalOrigin}/sitemap-community.xml`], "separate public-page and community sitemaps");
const sitemapDocuments = [];
for (const location of sitemapLocations) {
  const path = new URL(location).pathname;
  const document = await get(path);
  assert.equal(document.response.status, 200, `${path} status`);
  assert.match(document.response.headers.get("content-type") || "", /xml/, `${path} XML content type`);
  assert.match(document.html, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/, `${path} URL set`);
  const childLocations = [...document.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (path === "/sitemap-pages.xml") assert.deepEqual(new Set(childLocations), new Set(landingPaths.filter(page => page !== "/community").map(page => `${canonicalOrigin}${page}`)), "public sitemap contains every independent landing page, including AI education");
  else {
    assert.ok(childLocations.includes(`${canonicalOrigin}/community`), "community listing keeps its sitemap useful before the first post");
    for (const postLocation of childLocations.filter(location => location !== `${canonicalOrigin}/community`)) assert.match(new URL(postLocation).pathname, postPath, "community sitemap contains only the listing and public post routes");
  }
  sitemapDocuments.push(document.html);
}
const sitemapXml = sitemapDocuments.join("\n");
const locations = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.ok(locations.length >= landingPaths.length, "20 public landing pages plus published community posts in sitemap");
assert.equal(new Set(locations).size, locations.length, "no duplicate sitemap URLs");
for (const path of landingPaths) assert.ok(locations.includes(`${canonicalOrigin}${path}`), `${path} included in sitemap`);
const publishedPostLocations = locations.filter(location => !landingPaths.includes(new URL(location).pathname));
for (const location of publishedPostLocations) assert.match(new URL(location).pathname, postPath, "only published post routes extend the landing sitemap");
const w3cDate = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;
const sitemapEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
assert.equal(sitemapEntries.length, locations.length, "one sitemap entry per URL");
for (const entry of sitemapEntries) {
  const entryLocations = [...entry.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(entryLocations.length, 1, "one location per sitemap entry");
  const path = new URL(entryLocations[0]).pathname;
  const modified = [...entry.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
  if (path !== "/community" && path !== "/community/guide") assert.equal(modified.length, 1, `${path} editorial or post revision date`);
  else assert.ok(modified.length <= 1, `${path} does not duplicate its optional revision date`);
  assert.ok(modified.every(date => w3cDate.test(date) && Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now()), `${path} valid, non-future revision date`);
}
const titles = new Set();
const descriptions = new Set();
const landingTitles = new Set();
const landingDescriptions = new Set();
let faqs = 0;
let relatedLinks = 0;
for (const location of locations) {
  const url = new URL(location);
  assert.equal(url.origin, canonicalOrigin, "canonical sitemap origin");
  assert.equal(url.search + url.hash, "", "sitemap URLs have no query or fragment");
  const { response, html } = await get(url.pathname);
  assert.equal(response.status, 200, `${url.pathname} status`);
  const json = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1]));
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const title = decode(clean.match(/<title>([^<]+)<\/title>/)?.[1] || "");
  const description = attr(meta(clean, "description"), "content");
  assert.ok(title, `${url.pathname} title`);
  assert.ok(description, `${url.pathname} description`);
  // Members may legitimately choose the same title or wording. Editorial landing
  // pages must stay unique; post identity is established by its canonical URL.
  if (landingPaths.includes(url.pathname)) {
    assert.ok(!landingTitles.has(title), `${url.pathname} unique landing title`);
    assert.ok(!landingDescriptions.has(description), `${url.pathname} unique landing description`);
    landingTitles.add(title); landingDescriptions.add(description);
  }
  titles.add(title); descriptions.add(description);
  const canonical = [...clean.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).filter(tag => attr(tag, "rel") === "canonical");
  assert.equal(canonical.length, 1, `${url.pathname} single canonical`);
  assert.equal(new URL(attr(canonical[0], "href")).href, location, `${url.pathname} canonical URL`);
  assert.equal(new URL(attr(meta(clean, "og:url"), "content")).href, location, `${url.pathname} Open Graph URL`);
  assert.doesNotMatch(`${attr(meta(clean, "robots"), "content")} ${response.headers.get("x-robots-tag") || ""}`, /noindex/i);
  assert.equal((clean.match(/<h1\b/g) || []).length, 1, `${url.pathname} one heading`);
  assert.match(clean, /<html[^>]*lang="ko"/);
  const entities = json.flatMap(value => value["@graph"] || [value]);
  if (!url.pathname.startsWith("/community")) assert.ok(entities.some(entity => entity["@id"] === `${location}#webpage`), `${url.pathname} page entity`);
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
assert.equal(faqs, serviceSlugs.length * 3, "all nine industry pages retain three rendered FAQ answers");
assert.equal(relatedLinks, serviceSlugs.length * 2, "all nine industry pages retain two related links");
for (const path of ["/consultation", "/consultation?service=academy", "/admin", "/account", "/account/login", "/account/login?mode=signup", "/community/new", "/community/manage", "/requests", "/requests/manage"]) {
  const { response, html } = await get(path);
  assert.equal(response.status, 200);
  assert.match(attr(meta(html, "robots"), "content"), /noindex/i, `${path} excluded from search`);
  assert.ok(!locations.some(location => new URL(location).pathname === new URL(path, base).pathname));
}
for (const path of ["/services/not-a-real-service", "/cases/not-a-real-case", "/community/not-a-real-post", "/not-a-real-page"]) {
  const { response } = await get(path);
  assert.equal(response.status, 404, `${path} real 404`);
}
const me = await api("/api/community/me");
assert.equal(me.user, null, "anonymous account request has no member");
assert.deepEqual(me.posts, [], "anonymous account request has no private posts");
assert.equal((await api("/api/community/admin", 401)).code, "authentication_required", "anonymous moderation denied");
for (const path of ["/api/requests", "/api/requests/manage"]) {
  assert.equal((await api(path, 401)).code, "authentication_required", `${path} anonymous access denied`);
}
let publicList = await api("/api/community/posts");
assert.equal(typeof publicList.available, "boolean", "community storage availability is explicit");
if (!local) assert.equal(publicList.available, true, "hosted community has a connected persistent store");
const storageAvailable = publicList.available;
const publicPostIds = new Set();
const cursors = new Set();
for (let page = 0; ; page++) {
  assert.ok(Array.isArray(publicList.posts), "public posts is a list");
  assert.equal(publicList.available, storageAvailable, "storage state stays consistent through pagination");
  for (const post of publicList.posts) {
    assert.match(`/community/${post.id}`, postPath, "public post has a valid ID");
    assert.equal(post.status, "published", "API exposes published posts only");
    assert.ok(!publicPostIds.has(post.id), "pagination does not repeat a public post");
    publicPostIds.add(post.id);
  }
  if (publicList.nextCursor === null) break;
  assert.ok(typeof publicList.nextCursor === "string" && publicList.nextCursor.length > 0, "pagination cursor is valid");
  assert.ok(page < 99 && !cursors.has(publicList.nextCursor), "pagination is bounded and advances");
  cursors.add(publicList.nextCursor);
  publicList = await api(`/api/community/posts?cursor=${encodeURIComponent(publicList.nextCursor)}`);
}
if (!storageAvailable) assert.equal(publicPostIds.size, 0, "local disconnected store does not fabricate posts");
assert.deepEqual([...publicPostIds].sort(), publishedPostLocations.map(location => new URL(location).pathname.split("/").at(-1)).sort(), "all published posts, and only published posts, are in sitemap");
const font = await fetch(new URL("/fonts/pretendard-variable-1.3.9.woff2", base));
assert.equal(font.status, 200, "self-hosted font served");
assert.equal(Buffer.from(await font.arrayBuffer()).subarray(0, 4).toString(), "wOF2");
console.log(JSON.stringify({ base: base.origin, landingPages: landingPaths.length, publishedPosts: publicPostIds.size, publicPages: locations.length, uniqueTitles: titles.size, uniqueDescriptions: descriptions.size, renderedFaqs: faqs, relatedLinks, sitemap: "pass", sitemapFiles: sitemapLocations.length, readOnly: true, robots: "pass", excludedPages: "pass", notFoundStatus: "pass", structuredData: "pass", anonymousCommunityAccess: "pass", anonymousRequestAccess: "pass", communityStorage: storageAvailable ? "connected" : "local unavailable", font: "pass" }, null, 2));
