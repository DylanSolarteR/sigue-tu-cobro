import { test, expect, noOverflow } from "./fixtures";

test("404 pública: responde con error HTTP y permite volver al inicio", async ({ page, context }, testInfo) => {
  await context.clearCookies();
  const response = await page.goto("/esta-pagina-no-existe-e2e");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "404 · Página no encontrada" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Ir al resumen" })).toBeInViewport();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("pagina-404.png"), fullPage: true });
  await page.getByRole("link", { name: "Volver al inicio" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Tus cobros merecen claridad." })).toBeVisible();
});

test("404 del dashboard: permite recuperar el resumen con sesión simulada", async ({ page }) => {
  const response = await page.goto("/dashboard/seccion-inexistente-e2e");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "404 · Página no encontrada" })).toBeVisible();
  await noOverflow(page);
  await page.getByRole("link", { name: "Ir al resumen" }).click();
  await expect(page.getByRole("heading", { name: "Tu resumen", exact: true })).toBeVisible();
});
