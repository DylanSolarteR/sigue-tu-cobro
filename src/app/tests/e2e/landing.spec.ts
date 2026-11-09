import { expect, test } from "@playwright/test";

test("la portada presenta el producto y ofrece acceso", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /optimiza la creación de cuentas de cobro/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /inicia ahora/i })).toHaveAttribute("href", "/entrar");
});
