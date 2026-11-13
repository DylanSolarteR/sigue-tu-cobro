import { test, expect, control, select, CLIENT, noOverflow, pagination } from "./fixtures";

test("cuentas: ventana numérica, controles sincronizados y altura real", async ({ page, request }, testInfo) => {
  await control(request, { action: "reset", accounts: 310, pending: 0 });
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 600 });
  await page.goto("/dashboard/cuentas-cobro");
  const top = pagination(page, "cuentas de cobro", "superior");
  const bottom = pagination(page, "cuentas de cobro");
  await expect(top).toBeVisible();
  await expect(top.getByRole("button", { name: "Anterior", exact: true })).toBeDisabled();
  for (let number = 2; number <= 20; number++) await top.getByRole("button", { name: `Página ${number}`, exact: true }).click();
  for (const nav of [top, bottom]) {
    await expect(nav.getByRole("button", { name: /^Página/ })).toHaveText(["19", "20", "21"]);
    await expect(nav.getByRole("button", { name: "Página 20", exact: true })).toHaveAttribute("aria-current", "page");
  }
  await top.screenshot({ path: testInfo.outputPath("paginacion-pagina-20.png") });
  const style = await top.getByRole("button", { name: "Página 20", exact: true }).evaluate((button) => {
    const css = getComputedStyle(button);
    const probe = document.createElement("span"); probe.style.backgroundColor = "var(--color-primary)"; button.append(probe);
    const expectedBackground = getComputedStyle(probe).backgroundColor; probe.remove();
    const luminance = (color: string) => {
      const components = color.match(/[\d.]+/g)!.slice(0, 3).map((value) => { const channel = Number(value) / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; });
      return components[0]! * 0.2126 + components[1]! * 0.7152 + components[2]! * 0.0722;
    };
    const background = luminance(css.backgroundColor); const text = luminance(css.color);
    return { height: button.getBoundingClientRect().height, radius: parseFloat(css.borderRadius), font: css.fontSize, background: css.backgroundColor, expectedBackground, contrast: (Math.max(background, text) + 0.05) / (Math.min(background, text) + 0.05) };
  });
  expect(style.height).toBeGreaterThanOrEqual(44); expect(style.radius).toBe(12); expect(style.font).toBe("14px");
  expect(style.background).toBe(style.expectedBackground); expect(style.contrast).toBeGreaterThanOrEqual(4.5);
  const otherBackground = await top.getByRole("button", { name: "Página 19", exact: true }).evaluate((button) => getComputedStyle(button).backgroundColor);
  expect(style.background).not.toBe(otherBackground);
  await bottom.getByRole("button", { name: "Página 19", exact: true }).click();
  await expect(top.getByRole("button", { name: "Página 19", exact: true })).toHaveAttribute("aria-current", "page");
  await noOverflow(page);
  const height = await page.getByRole("list", { name: "Cuentas de cobro" }).evaluate((list) => list.getBoundingClientRect().height);
  await page.setViewportSize({ width: page.viewportSize()!.width, height: Math.ceil(height) + 1000 });
  await expect(top).toHaveCount(0);
  await expect(bottom.getByRole("button", { name: "Página 19", exact: true })).toHaveAttribute("aria-current", "page");
});

test("directorio: navegación superior por sección y estilo compartido", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 600 });
  await page.goto("/dashboard/directorio");
  const top = pagination(page, "clientes", "superior"); const bottom = pagination(page, "clientes");
  await expect(top).toBeVisible();
  await top.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(bottom.getByRole("button", { name: "Página 2", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(bottom.getByRole("button", { name: "Siguiente", exact: true })).toBeDisabled();
  await expect(page.getByText("Cliente 11 con nombre extenso de prueba", { exact: true })).toBeVisible();
  await expect(page.getByText("Acreedor de prueba", { exact: true })).toBeVisible();
  await expect(pagination(page, "acreedores")).toHaveCount(0);
  await top.screenshot({ path: testInfo.outputPath("paginacion-directorio.png") });
  await page.screenshot({ path: testInfo.outputPath("directorio.png"), fullPage: true });
  await noOverflow(page);
});

test("ítems y creación: controles superiores, última página corta y selección conservada", async ({ page, request }, testInfo) => {
  await control(request, { action: "reset", accounts: 0, pending: 76 });
  await page.goto("/dashboard/items"); await select(page, "Cliente", CLIENT);
  const top = pagination(page, "ítems", "superior"); const bottom = pagination(page, "ítems");
  await expect(top).toBeVisible(); await top.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(bottom.getByRole("button", { name: "Página 2", exact: true })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: testInfo.outputPath("items.png"), fullPage: true });
  await bottom.getByRole("button", { name: "Página 3", exact: true }).click();
  await top.getByRole("button", { name: "Página 4", exact: true }).click();
  await expect(top).toHaveCount(0);
  await expect(bottom.getByRole("button", { name: "Página 4", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: /Concepto pendiente 0076/ })).toBeVisible();
  await noOverflow(page);
  await page.goto("/dashboard/cuentas-cobro/crear"); await select(page, "Cliente", CLIENT);
  await expect(top).toBeVisible(); await page.getByRole("checkbox").first().check();
  await top.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(bottom.getByRole("button", { name: "Página 2", exact: true })).toHaveAttribute("aria-current", "page");
  await bottom.getByRole("button", { name: "Página 1", exact: true }).click();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.screenshot({ path: testInfo.outputPath("crear-cuenta.png"), fullPage: true });
  await noOverflow(page);
});
