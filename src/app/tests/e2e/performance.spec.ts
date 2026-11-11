import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { test, expect, control, select, CLIENT, noOverflow } from "./fixtures";

declare global {
  interface Window { stcPerformance: { longTasks: number[]; shifts: number[] } }
}
async function settled(page: Page) { await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); }
async function measure(page: Page, action: () => Promise<void>) { const start = performance.now(); await action(); await settled(page); return Math.round(performance.now() - start); }
function summarize(values: number[]) { const sorted = [...values].sort((a, b) => a - b); return { median: sorted[Math.floor(sorted.length / 2)], worst: sorted.at(-1), samples: values }; }

for (const [accounts, pending] of [[1000, 100], [10000, 1000]] as const) test(`rendimiento ${accounts} cuentas y ${pending} ítems`, async ({ page, request }, testInfo) => {
  test.setTimeout(240_000);
  await control(request, { action: "reset", accounts, pending });
  await page.addInitScript(() => {
    window.stcPerformance = { longTasks: [], shifts: [] };
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.stcPerformance.longTasks.push(entry.duration); }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) { const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }; if (!shift.hadRecentInput) window.stcPerformance.shifts.push(shift.value); } }).observe({ type: "layout-shift", buffered: true });
  });
  const timings: Record<string, number[]> = { accountsReady: [], filter: [], pagination: [], selection: [], editor: [], itemsReady: [], createReady: [], summaryReady: [] };
  const pages: { iteration: number; route: string; domNodes: number; longTasks: number[]; cls: number }[] = [];
  const record = async (iteration: number, route: string) => {
    pages.push({ iteration, route, ...await page.evaluate(() => ({ domNodes: document.querySelectorAll("*").length, longTasks: window.stcPerformance.longTasks, cls: window.stcPerformance.shifts.reduce((sum, value) => sum + value, 0) })) });
    await noOverflow(page);
  };
  for (let iteration = 0; iteration < 6; iteration++) {
    const sample: Record<string, number> = {};
    sample.accountsReady = await measure(page, async () => { await page.goto("/dashboard/cuentas-cobro"); await expect(page.getByRole("list", { name: "Cuentas de cobro" }).locator(":scope > li")).toHaveCount(10); });
    sample.filter = await measure(page, async () => { await page.getByLabel("Buscar cliente", { exact: true }).fill("Cliente 20"); await expect(page.getByRole("list", { name: "Cuentas de cobro" }).locator(":scope > li").first()).toContainText("Cliente 20"); });
    sample.pagination = await measure(page, async () => { await page.getByRole("button", { name: "Siguiente", exact: true }).click(); await expect(page.getByText(`2 de ${accounts / 20 / 10}`, { exact: true })).toBeVisible(); });
    sample.selection = await measure(page, async () => { await page.getByRole("button", { name: "Seleccionar página" }).click(); await expect(page.getByText("10 seleccionadas", { exact: true })).toBeVisible(); });
    sample.editor = await measure(page, async () => { await page.getByRole("button", { name: /Abrir cuenta/ }).first().click(); await expect(page.getByLabel("Descripción del ítem")).toBeVisible(); });
    await record(iteration, "accounts");
    sample.itemsReady = await measure(page, async () => { await page.goto("/dashboard/items"); await select(page, "Cliente", CLIENT); await expect(page.getByRole("button", { name: /Concepto pendiente 0001/ })).toBeVisible(); });
    await record(iteration, "items");
    sample.createReady = await measure(page, async () => { await page.goto("/dashboard/cuentas-cobro/crear"); await select(page, "Cliente", CLIENT); await expect(page.getByRole("checkbox").first()).toBeVisible(); });
    await record(iteration, "create");
    sample.summaryReady = await measure(page, async () => { await page.goto("/dashboard/resumen"); await expect(page.getByRole("list", { name: "Ranking de clientes" })).toBeVisible(); });
    await record(iteration, "summary");
    if (iteration > 0) for (const [key, value] of Object.entries(sample)) timings[key]!.push(value);
  }
  const results = Object.fromEntries(Object.entries(timings).map(([key, values]) => [key, summarize(values)]));
  const report = testInfo.outputPath("performance.json");
  await writeFile(report, JSON.stringify({ accounts, pending, project: testInfo.project.name, viewport: page.viewportSize(), browser: await page.context().browser()!.version(), cpuThrottling: "none", network: "local mocked", fixtureStorage: "file-backed memory cache, invalidated on file change", timingMethod: "observed wall clock including Playwright action and assertion overhead", timings: results, pages }, null, 2));
  await testInfo.attach("performance.json", { path: report, contentType: "application/json" });
  for (const key of ["accountsReady", "itemsReady", "createReady", "summaryReady"]) expect.soft(results[key]!.median, key).toBeLessThanOrEqual(3000);
  for (const key of ["filter", "pagination", "selection", "editor"]) expect.soft(results[key]!.median, key).toBeLessThanOrEqual(500);
});
