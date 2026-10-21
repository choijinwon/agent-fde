import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

function harness(readPosts = async () => []) {
  const modules = new Map();
  let storeImports = 0;
  function load(file) {
    const absolute = resolve(root, file);
    if (modules.has(absolute)) return modules.get(absolute).exports;
    const source = readFileSync(absolute, "utf8");
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const loadedModule = { exports: {} };
    modules.set(absolute, loadedModule);
    const require = name => {
      if (name === "@/lib/community-server") {
        storeImports++;
        return { listPublicPostSitemapEntries: readPosts };
      }
      const target = name.startsWith("@/") ? resolve(root, name.slice(2)) : name.startsWith(".") ? resolve(dirname(absolute), name) : null;
      assert.ok(target, `Unexpected external dependency: ${name}`);
      return load(`${target}.ts`);
    };
    new Function("require", "module", "exports", compiled)(require, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return { load, storeImports: () => storeImports };
}

const locations = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);

test("sitemap index and 22 independent public pages remain available without importing community storage", async () => {
  const app = harness(async () => { throw new Error("Store offline"); });
  const index = app.load("app/sitemap.xml/route.ts");
  const pages = app.load("app/sitemap-pages.xml/route.ts");
  assert.equal(index.dynamic, "force-static");
  assert.equal(pages.dynamic, "force-static");
  const indexResponse = index.GET();
  assert.equal(indexResponse.status, 200);
  assert.deepEqual(locations(await indexResponse.text()), ["https://workauto.co.kr/sitemap-pages.xml", "https://workauto.co.kr/sitemap-community.xml"]);
  const response = pages.GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/xml/);
  assert.match(response.headers.get("cache-control"), /public/);
  const xml = await response.text();
  const urls = locations(xml);
  assert.equal(urls.length, 22);
  assert.equal(new Set(urls).size, urls.length);
  for (const path of ["/", "/education", "/services", "/services/academy", "/services/manufacturing", "/services/excel-accounting", "/cases", "/guides", "/guides/excel-automation-cost", "/guides/ai-beginner-practice", "/community/guide"]) assert.ok(urls.includes(`https://workauto.co.kr${path}`), `${path} discoverable`);
  assert.ok(!urls.includes("https://workauto.co.kr/community"), "community listing is included only in the community sitemap");
  assert.ok(urls.every(url => !/\/(account|requests|admin|consultation)(\/|$)/.test(new URL(url).pathname)));
  assert.equal(app.storeImports(), 0, "search discovery for service pages must not depend on community storage");
});

test("community storage failure returns a retryable, uncached error without affecting the other sitemaps", async () => {
  const app = harness(async () => { throw new Error("Transient blob storage failure"); });
  const community = app.load("app/sitemap-community.xml/route.ts");
  const response = await community.GET();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("retry-after"), "300");
  assert.doesNotMatch(await response.text(), /<urlset/);
  assert.equal(app.load("app/sitemap.xml/route.ts").GET().status, 200);
  assert.equal(app.load("app/sitemap-pages.xml/route.ts").GET().status, 200);
});

test("community sitemap preserves public posts and the listing remains discoverable before the first post", async () => {
  const post = { id: "9a19b2b6-cbab-42dc-9357-1c0f4138926d", updatedAt: "2026-10-10T03:00:00+09:00" };
  const app = harness(async () => [post]);
  const response = await app.load("app/sitemap-community.xml/route.ts").GET();
  assert.equal(response.status, 200);
  const xml = await response.text();
  assert.deepEqual(locations(xml), ["https://workauto.co.kr/community", `https://workauto.co.kr/community/${post.id}`]);
  assert.match(xml, /<lastmod>2026-10-09T18:00:00\.000Z<\/lastmod>/);
  const empty = await harness().load("app/sitemap-community.xml/route.ts").GET();
  assert.equal(empty.status, 200);
  assert.deepEqual(locations(await empty.text()), ["https://workauto.co.kr/community"]);
});

test("invalid stored revision time does not publish a broken successful sitemap", async () => {
  const app = harness(async () => [{ id: "9a19b2b6-cbab-42dc-9357-1c0f4138926d", updatedAt: "invalid" }]);
  const response = await app.load("app/sitemap-community.xml/route.ts").GET();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("XML values escape reserved characters instead of creating extra XML elements", () => {
  const sitemap = harness().load("lib/sitemap.ts");
  const xml = sitemap.sitemapUrlSet([{ path: '/sample?a=1&b="<x>"' }]);
  assert.match(xml, /a=1&amp;b=&quot;&lt;x&gt;&quot;/);
  assert.doesNotMatch(xml, /<x>/);
});
