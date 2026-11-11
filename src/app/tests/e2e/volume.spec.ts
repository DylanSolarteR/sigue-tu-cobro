import { readFile } from "node:fs/promises";
import { test, expect, control, select, CLIENT, noOverflow } from "./fixtures";

test("PDF de 100 conceptos conserva el documento y genera varias páginas", async ({ page, request }, testInfo) => {
  await control(request, { action: "reset", accounts: 0, pending: 100 });
  await page.goto("/dashboard/cuentas-cobro/crear");
  await select(page, "Cliente", CLIENT);
  await select(page, "Acreedor", "Acreedor de prueba");
  // Selection must survive page changes if pending items are paginated.
  for (;;) {
    const choices = page.getByRole("checkbox");
    await expect(choices.first()).toBeVisible();
    for (const choice of await choices.all()) await choice.check();
    const next = page.getByRole("button", { name: "Siguiente página de ítems" });
    if (!(await next.count()) || await next.isDisabled()) break;
    await next.click();
  }
  await expect(page.getByText("$1.000.000", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Crear cuenta de cobro", exact: true }).click();
  await expect(page).toHaveURL(/\/editar\//);
  const data = await control(request);
  expect(data.items.filter((entry) => entry.status === "added")).toHaveLength(100);
  await page.goto("/dashboard/cuentas-cobro");
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PDF" }).click();
  const download = await event;
  const path = testInfo.outputPath("cuenta-100-conceptos.pdf");
  await download.saveAs(path);
  const pdf = await readFile(path);
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)!.length).toBeGreaterThan(1);
  await noOverflow(page);
});

for (const [accounts, pending] of [[1000, 100], [10000, 1000]] as const) test(`volumen ${accounts} cuentas y ${pending} ítems`, async ({ page, request }, testInfo) => {
  test.setTimeout(240_000);
  await control(request, { action: "reset", accounts, pending });
  await page.goto("/dashboard/cuentas-cobro");
  const list = page.getByRole("list", { name: "Cuentas de cobro" });
  await expect(list.locator(":scope > li")).toHaveCount(10);
  await page.getByLabel("Buscar cliente", { exact: true }).fill("Cliente 20");
  const next = page.getByRole("button", { name: "Siguiente", exact: true });
  for (let index = 1; index < accounts / 20 / 10; index++) await next.click();
  await expect(next).toBeDisabled();
  await list.getByRole("button", { name: /Abrir cuenta/ }).last().click();
  await expect(page.getByLabel("Descripción del ítem")).toHaveValue(`Trabajo incluido ${accounts}`);
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("cuentas-volumen.png"), fullPage: true });
  await page.goto("/dashboard/items");
  await select(page, "Cliente", CLIENT);
  await expect(page.getByRole("button", { name: /Concepto pendiente 0001/ })).toBeVisible();
  const last = page.getByRole("button", { name: new RegExp(`Concepto pendiente ${String(pending).padStart(4, "0")}`) });
  const itemNext = page.getByRole("button", { name: "Siguiente página de ítems" });
  while (!(await last.count()) && await itemNext.count() && await itemNext.isEnabled()) await itemNext.click();
  await expect(last).toBeVisible();
  await last.click();
  await expect(page.getByRole("button", { name: "Guardar ítem" })).toBeDisabled();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("items-volumen.png"), fullPage: true });
});
