import { expect, test, noOverflow } from "./fixtures";

test("la portada presenta el producto y ofrece acceso", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tus cobros merecen claridad." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Crear mi cuenta" })).toHaveAttribute("href", "/registro");
  await noOverflow(page);
});
