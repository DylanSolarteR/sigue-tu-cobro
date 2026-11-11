import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import type { billing_statement, billing_statement_item } from "@/types/billing-statement";
import type { Actor } from "@/types/actor";

export async function control(request: APIRequestContext, input: { action?: string; accounts?: number; pending?: number; fault?: string; delay?: number } = {}) {
  const response = await request.post("/api/e2e-control", { headers: { "x-e2e-token": process.env.E2E_CONTROL_TOKEN! }, data: input });
  expect(response.status(), "Control local E2E disponible").toBe(200);
  return await response.json() as { accounts: billing_statement[]; items: billing_statement_item[]; actors: Actor[] };
}
export async function select(page: Page, label: string, option: string | RegExp) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: typeof option === "string" }).click();
}
export const CLIENT = "Cliente 01 con nombre extenso de prueba";
export async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
}
export const test = base.extend<{ seed: void }>({
  seed: [async ({ request, context, page }, use) => {
    await control(request, { action: "reset" });
    await context.addCookies([{ name: "stc-e2e-session", value: "1", url: "http://127.0.0.1:3123" }]);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use();
    expect(errors).toEqual([]);
  }, { auto: true }],
});
export { expect };
