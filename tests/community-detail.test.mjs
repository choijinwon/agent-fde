import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const compile = async path => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const pageCode = await compile("../app/community/[id]/page.tsx");
const errorCode = await compile("../app/community/error.tsx");
const post = {
  id: "ecbc1f7c-a645-4faf-bb97-1c1b40158a93", kind: "question", industry: "office",
  title: "반복 보고서를 자동화하고 싶어요", body: "매주 여러 파일의 내용을 모아 보고서를 작성하고 있습니다.",
  authorName: "질문자", createdAt: "2026-10-13T00:00:00.000Z",
};
const props = () => ({ params: Promise.resolve({ id: post.id }) });

function load(code, getPublicPost) {
  const loaded = { exports: {} };
  const imports = name => {
    if (name.endsWith(".css")) return {};
    if (name === "next/link") return function LinkStub({ children, ...attributes }) { return createElement("a", attributes, children); };
    if (name === "next/navigation") return { notFound: () => { throw Object.assign(new Error("not found"), { digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); } };
    if (name === "@/lib/community-server") return { getPublicPost };
    if (name === "@/lib/seo") return { siteMetadata: options => options };
    if (name === "@/app/components/SiteChrome") return { SiteHeader: () => null, SiteFooter: () => null };
    if (name === "../community-client") return { CommunityComments: () => null, PostActions: () => null };
    if (name === "../community-display") return { communityDate: value => value, industryName: value => value };
    return require(name);
  };
  new Function("require", "module", "exports", code)(imports, loaded, loaded.exports);
  return loaded.exports;
}

test("published detail keeps its content and indexable, page-specific metadata", async () => {
  const page = load(pageCode, async id => {
    assert.equal(id, post.id);
    return { post, comments: [], available: true };
  });
  assert.deepEqual(await page.generateMetadata(props()), {
    title: post.title, description: post.body, path: `/community/${post.id}`,
  });
  const html = renderToStaticMarkup(await page.default(props()));
  assert.ok(html.includes(`<h1>${post.title}</h1>`));
  assert.ok(html.includes(post.body));
});

test("missing or nonpublic detail keeps noindex metadata and the 404 path", async () => {
  // The backend returns the same public response for missing, hidden and deleted posts.
  const page = load(pageCode, async () => ({ post: null, comments: [], available: true }));
  assert.deepEqual((await page.generateMetadata(props())).robots, { index: false, follow: true });
  await assert.rejects(page.default(props()), error => error.digest === "NEXT_HTTP_ERROR_FALLBACK;404");
});

test("unconfigured or temporarily unavailable storage rejects both metadata and rendering", async () => {
  const page = load(pageCode, async () => ({ post: null, comments: [], available: false }));
  for (const read of [page.generateMetadata, page.default]) {
    await assert.rejects(read(props()), error => error.message === "Community post storage is unavailable" && !error.digest);
  }
});

test("storage fetch failures propagate instead of becoming an empty noindex detail", async () => {
  const failure = new Error("temporary storage failure");
  const page = load(pageCode, async () => { throw failure; });
  await assert.rejects(page.generateMetadata(props()), error => error === failure);
  await assert.rejects(page.default(props()), error => error === failure);
});

test("community error recovery retries the server read", () => {
  let attempts = 0;
  const boundary = load(errorCode).default({ retry: () => { attempts += 1; } });
  function findButton(node) {
    if (!node || typeof node !== "object") return undefined;
    if (node.type === "button") return node;
    return [node.props?.children].flat(Infinity).map(findButton).find(Boolean);
  }
  const button = findButton(boundary);
  assert.ok(button);
  button.props.onClick();
  assert.equal(attempts, 1);
  const html = renderToStaticMarkup(boundary);
  assert.ok(html.includes("잠시 후 다시 시도해 주세요."));
  assert.ok(html.includes('href="/community"'));
});
