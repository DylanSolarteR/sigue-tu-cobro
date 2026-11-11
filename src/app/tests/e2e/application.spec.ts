import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { test, expect, control, select, CLIENT, noOverflow } from "./fixtures";

test("acceso simulado, navegación y configuración adaptable", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/dashboard/config");
  await expect(page).toHaveURL(/\/entrar/);
  await page.getByRole("button", { name: "Entrar con cuenta simulada" }).click();
  await expect(page.getByRole("heading", { name: "Tu resumen" })).toBeVisible();
  await page.goto("/dashboard/config");
  const profile = page.getByTestId("mock-clerk-profile");
  await expect(profile).toBeVisible();
  const widths = await profile.evaluate((element) => [element.getBoundingClientRect().width, element.parentElement!.getBoundingClientRect().width]);
  expect(Math.abs(widths[0]! - widths[1]!)).toBeLessThan(2);
  await noOverflow(page);
  const menu = page.getByRole("button", { name: "Abrir menú" });
  if (await menu.isVisible()) { await menu.click(); await page.getByRole("navigation", { name: "Navegación móvil" }).getByRole("link", { name: "Directorio" }).click(); }
  else await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Directorio" }).click();
  await expect(page.getByRole("heading", { name: "Directorio", exact: true })).toBeVisible();
});

for (const kind of ["cliente", "acreedor"]) test(`crea, edita y elimina un ${kind}`, async ({ page, request }) => {
  await page.goto(`/dashboard/${kind === "cliente" ? "clientes" : "acreedores"}/crear`);
  await page.getByLabel("Nombre completo").fill(`Nuevo ${kind} E2E`);
  await select(page, "Tipo de documento", "Cédula de ciudadanía");
  await page.getByLabel("Número de documento").fill("123456789");
  await page.getByRole("button", { name: `Crear ${kind}`, exact: true }).click();
  await expect(page.getByText(new RegExp(`${kind} creado`, "i"))).toBeVisible();
  const data = await control(request);
  const record = data.actors.find((entry) => entry.name === `Nuevo ${kind} E2E`)!;
  expect(record).toBeTruthy();
  await page.goto(`/dashboard/${kind === "cliente" ? "clientes" : "acreedores"}/editar/${record.id}`);
  await page.getByLabel("Nombre completo").fill(`${kind} actualizado E2E`);
  await page.getByRole("button", { name: new RegExp(`Actualizar ${kind}`) }).click();
  await expect(page.getByText(new RegExp(`${kind} actualizado`, "i"))).toBeVisible();
  await page.goto("/dashboard/directorio");
  // Clients are paginated; the new entry is on the last page.
  if (kind === "cliente") {
    const section = page.getByRole("button", { name: "Clientes", exact: true }).locator("xpath=ancestor::section");
    while (!(await page.getByRole("button", { name: `Eliminar ${kind} actualizado E2E` }).count())) await section.getByRole("button", { name: "Siguiente" }).click();
  }
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: `Eliminar ${kind} actualizado E2E` }).click();
  await expect(page.getByRole("button", { name: `Eliminar ${kind} actualizado E2E` })).toHaveCount(0);
  expect((await control(request)).actors.some((entry) => entry.id === record.id)).toBe(false);
  await noOverflow(page);
});

test("ítems: validación monetaria, creación, edición, eliminación y recuperación de carga", async ({ page, request }) => {
  await page.goto("/dashboard/items");
  await control(request, { fault: "item.list" });
  await select(page, "Cliente", CLIENT);
  await expect(page.getByRole("button", { name: "Reintentar carga" })).toBeVisible();
  await control(request, { fault: "", delay: 500 });
  await page.getByRole("button", { name: "Reintentar carga" }).click();
  await expect(page.getByRole("status", { name: /Cargando/ })).toBeVisible();
  await expect(page.getByText(/Concepto pendiente 0001/)).toBeVisible();
  await control(request, { delay: 0 });
  await page.getByLabel("Descripción", { exact: true }).fill("Servicio E2E");
  await page.getByLabel("Valor", { exact: true }).fill("123abc");
  await expect(page.getByLabel("Valor", { exact: true })).not.toHaveValue(/abc/);
  await page.getByLabel("Valor", { exact: true }).fill("125000");
  await expect(page.getByLabel("Valor", { exact: true })).toHaveValue("125.000");
  await page.getByRole("button", { name: "Crear ítem" }).click();
  const trigger = page.getByRole("button", { name: /Servicio E2E/ });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await page.getByLabel("Descripción de Servicio E2E", { exact: true }).fill("Servicio corregido E2E");
  await page.getByRole("button", { name: "Guardar ítem" }).click();
  await expect(page.getByRole("button", { name: /Servicio corregido E2E/ })).toBeVisible();
  await page.getByRole("button", { name: /Servicio corregido E2E/ }).click();
  await page.getByRole("button", { name: "Eliminar ítem" }).click();
  await page.getByRole("button", { name: /Confirmar/ }).click();
  await expect(page.getByText("Servicio corregido E2E", { exact: true })).toHaveCount(0);
  await noOverflow(page);
});

test("genera una cuenta desde pendientes, edita sus datos y descarga un PDF real", async ({ page, request }, testInfo) => {
  await page.goto("/dashboard/cuentas-cobro/crear");
  await select(page, "Cliente", CLIENT);
  await select(page, "Acreedor", "Acreedor de prueba");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Crear cuenta de cobro", exact: true }).click();
  await expect(page).toHaveURL(/\/editar\//);
  const id = page.url().split("/").pop()!;
  await page.getByLabel("Información adicional").fill("Observacion del PDF E2E");
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(page.getByText("Cuenta actualizada.", { exact: true })).toBeVisible();
  await page.getByLabel("Descripción del ítem", { exact: true }).fill("Concepto editado E2E");
  await page.getByLabel("Valor del ítem", { exact: true }).fill("15000");
  await page.getByRole("button", { name: "Guardar ítem", exact: true }).click();
  await expect.poll(async () => (await control(request)).accounts.find((entry) => entry.id === id)?.amount).toBe(15000);
  expect((await control(request)).items.find((entry) => entry.id === "pending-1")?.status).toBe("added");
  await page.goto("/dashboard/cuentas-cobro");
  const row = page.getByRole("list", { name: "Cuentas de cobro" }).locator("li").filter({ hasText: CLIENT }).first();
  const downloadEvent = page.waitForEvent("download");
  await row.getByRole("button", { name: "Descargar PDF" }).click();
  const download = await downloadEvent;
  const file = testInfo.outputPath("cuenta.pdf");
  await download.saveAs(file);
  const buffer = await readFile(file);
  expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  expect(buffer.subarray(-32).toString()).toContain("%%EOF");
  const text: string[] = [];
  for (const match of buffer.toString("latin1").matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    try { for (const token of inflateSync(Buffer.from(match[1]!, "latin1")).toString("latin1").matchAll(/<([\da-fA-F]+)>/g)) text.push(Buffer.from(token[1]!, "hex").toString("latin1")); } catch { /* Skip non-text streams. */ }
  }
  expect(text.join("")).toContain("Observacion del PDF E2E");
  expect(text.join("")).toContain("15.000");
  expect(text.join("")).toContain("Concepto editado E2E");
  expect((await control(request)).accounts.some((entry) => entry.id === id)).toBe(true);
  await noOverflow(page);
});

test("cuentas: filtros, paginación, selección y acciones por lotes", async ({ page, request }) => {
  await page.goto("/dashboard/cuentas-cobro");
  const list = page.getByRole("list", { name: "Cuentas de cobro" });
  await expect(list.locator(":scope > li")).toHaveCount(10);
  await page.getByRole("button", { name: "Seleccionar página" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("10 seleccionadas", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Marcar seleccionadas como pagadas" }).click();
  await expect.poll(async () => (await control(request)).accounts.filter((entry) => entry.status === "paid").length).toBe(10);
  await select(page, "Estado", "Pendiente");
  await expect(list.locator(":scope > li")).toHaveCount(2);
  await page.getByRole("button", { name: "Seleccionar página" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Eliminar seleccionadas" }).click();
  await expect.poll(async () => (await control(request)).accounts.length).toBe(10);
  expect((await control(request)).items.find((entry) => entry.id === "added-12")?.status).toBe("pending");
  await noOverflow(page);
});

test("resumen: filtros, datos de la gráfica y ranking", async ({ page }) => {
  await page.goto("/dashboard/resumen");
  await expect(page.getByRole("list", { name: "Ranking de clientes" })).toBeVisible();
  await select(page, "Cliente de la gráfica", CLIENT);
  await select(page, "Período", "Últimos 12 meses");
  const nodes = page.getByRole("button", { name: /2026: \$/ });
  await expect(nodes.first()).toBeVisible();
  await nodes.first().click();
  await expect(page.getByRole("list", { name: "Datos de la gráfica" })).toHaveCount(1);
  await noOverflow(page);
});

test("estados vacíos y error de carga de cuentas", async ({ page, request }) => {
  await control(request, { action: "reset", accounts: 0, pending: 0 });
  await page.goto("/dashboard/cuentas-cobro");
  await expect(page.getByText("No hay cuentas de cobro registradas.")).toBeVisible();
  await page.goto("/dashboard/cuentas-cobro/crear");
  await select(page, "Cliente", CLIENT);
  await expect(page.getByText("No hay ítems pendientes.", { exact: false })).toBeVisible();
  await control(request, { fault: "account.list" });
  await page.goto("/dashboard/cuentas-cobro");
  await expect(page.getByRole("alert").filter({ hasText: "No se pudieron obtener las cuentas." })).toBeVisible();
  await control(request, { fault: "" });
  await page.reload();
  await expect(page.getByText("No hay cuentas de cobro registradas.")).toBeVisible();
});

test("selectores accesibles mediante teclado", async ({ page }) => {
  await page.goto("/dashboard/items");
  const client = page.getByRole("combobox", { name: "Cliente", exact: true });
  await client.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("searchbox", { name: "Buscar cliente" }).fill("Cliente 01");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(client).toContainText(CLIENT);
  await expect(page.getByRole("button", { name: /Concepto pendiente 0001/ })).toBeVisible();
});

test("selección táctil por pulsación sostenida", async ({ page, isMobile }) => {
  test.skip(!isMobile, "La pulsación sostenida corresponde a la vista táctil.");
  await page.goto("/dashboard/cuentas-cobro");
  const row = page.getByRole("list", { name: "Cuentas de cobro" }).locator(":scope > li").first();
  await row.scrollIntoViewIfNeeded();
  const box = await row.boundingBox();
  expect(box).toBeTruthy();
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box!.x + 25, y: box!.y + 100 }] });
  await page.waitForTimeout(700); // Exercise the actual 600 ms long-press threshold.
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByText("1 seleccionadas", { exact: true })).toBeVisible();
  await session.detach();
});
