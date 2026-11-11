// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import NotFound from "@/app/not-found";

afterEach(cleanup);
it("explica la página inexistente y ofrece destinos de recuperación explícitos", () => {
  render(<NotFound />);
  expect(screen.getByRole("heading", { level: 1, name: "404 · Página no encontrada" })).toBeTruthy();
  expect(screen.getByText("Revisa la dirección o vuelve a una de estas secciones.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Volver al inicio" }).getAttribute("href")).toBe("/");
  expect(screen.getByRole("link", { name: "Ir al resumen" }).getAttribute("href")).toBe("/dashboard/resumen");
});
