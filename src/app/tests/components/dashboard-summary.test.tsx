// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Dashboard from "@/app/(dashboard)/dashboard/resumen/page";

vi.mock("@/app/(dashboard)/dashboard/resumen/Statistics", () => ({ default: () => <div>Estadísticas de cobro</div> }));
afterEach(cleanup);

it("ofrece accesos directos para crear y seguir cobros", () => {
  render(<Dashboard />);
  expect(screen.getByRole("heading", { name: "Tu resumen" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Crear cuenta de cobro" }).getAttribute("href")).toBe("/dashboard/cuentas-cobro/crear");
  expect(screen.getByRole("link", { name: /Registra tus ítems pendientes/ }).getAttribute("href")).toBe("/dashboard/items");
  expect(screen.getByText("Estadísticas de cobro")).toBeTruthy();
});
