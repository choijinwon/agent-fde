import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import * as catalog from "../lib/service-catalog.ts";

const source = await readFile(new URL("../lib/diagnosis.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(name => {
  if (name === "./service-catalog") return catalog;
  throw new Error(`Unexpected dependency ${name}`);
}, loaded, loaded.exports);
const { calculateSavings, createCalculatorDraft, createDiagnosisDraft, diagnosisResult, readConsultationDraft, validateDiagnosis, DRAFT_TTL_MS } = loaded.exports;
const now = 1791700000000;
const answers = { industry: "manufacturing", task: "entry", tool: "erp", frequency: "daily" };
const inputs = { minutes: 30, timesPerWeek: 5, people: 2, automationPercent: 50 };

test("savings use 52 weeks per year and do not round intermediate results", () => {
  const result = calculateSavings(inputs);
  assert.equal(result.weeklyHours, 5);
  assert.equal(result.monthlyHours, 260 / 12);
  assert.ok(Math.abs(result.monthlySavedHours - 130 / 12) < 1e-9);
  assert.ok(Math.abs(result.yearlySavedHours - 130) < 1e-9);
  assert.equal(result.monthlyRemainingHours + result.monthlySavedHours, result.monthlyHours);
  assert.equal(calculateSavings({ ...inputs, automationPercent: 0 }).monthlySavedHours, 0);
  assert.equal(calculateSavings({ ...inputs, automationPercent: 100 }).monthlyRemainingHours, 0);
});

test("invalid and impossible time assumptions cannot produce apparent savings", () => {
  for (const mutation of [{ minutes: 0 }, { minutes: 481 }, { minutes: Infinity }, { timesPerWeek: -1 }, { timesPerWeek: 1.5 }, { timesPerWeek: "5" }, { people: 0 }, { people: 1001 }, { automationPercent: 101 }, { automationPercent: NaN }, { minutes: 480, timesPerWeek: 100 }]) assert.throws(() => calculateSavings({ ...inputs, ...mutation }));
  for (const invalid of [null, [], "50", {}]) assert.throws(() => calculateSavings(invalid));
});

test("diagnosis only accepts known choices and maps every industry to its real service", () => {
  for (const item of catalog.SERVICE_CATALOG) {
    const result = diagnosisResult({ ...answers, industry: item.slug });
    assert.equal(result.industry.service, item.service);
    assert.ok(result.message.includes(item.title));
    assert.ok(result.task.steps.some(step => step.includes("확인")));
  }
  for (const mutation of [{ industry: "unknown" }, { task: "invented" }, { tool: {} }, { frequency: null }]) assert.equal(validateDiagnosis({ ...answers, ...mutation }), null);
  assert.equal(validateDiagnosis(null), null);
});

test("consultation drafts contain choices, never supplied personal data or free text", () => {
  const raw = createDiagnosisDraft({ ...answers, email: "private@example.test", message: "private note" }, now);
  assert.equal(raw.includes("private"), false);
  const draft = readConsultationDraft(raw, "diagnosis", now);
  assert.equal(draft.service, "제조 ERP 자동화");
  assert.ok(draft.message.includes("ERP"));
  const calculatorRaw = createCalculatorDraft({ ...inputs, email: "private@example.test" }, now);
  assert.equal(calculatorRaw.includes("private"), false);
  assert.ok(readConsultationDraft(calculatorRaw, "calculator", now).message.includes("10.8시간"));
});

test("drafts expire and cannot cross sources or carry tampered message content", () => {
  const raw = createDiagnosisDraft(answers, now);
  assert.equal(readConsultationDraft(raw, "calculator", now), null);
  assert.equal(readConsultationDraft(raw, "diagnosis", now - 1), null);
  assert.equal(readConsultationDraft(raw, "diagnosis", now + DRAFT_TTL_MS + 1), null);
  for (const value of [null, "not json", "x".repeat(2049), JSON.stringify({ ...JSON.parse(raw), version: 99 }), JSON.stringify({ ...JSON.parse(raw), answers: { ...answers, industry: "forged" } })]) assert.equal(readConsultationDraft(value, "diagnosis", now), null);
  const tampered = JSON.stringify({ ...JSON.parse(raw), message: "forged content", service: "forged service" });
  const restored = readConsultationDraft(tampered, "diagnosis", now);
  assert.equal(restored.service, "제조 ERP 자동화");
  assert.equal(restored.message.includes("forged"), false);
});
