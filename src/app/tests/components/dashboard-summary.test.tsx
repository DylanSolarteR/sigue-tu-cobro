// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Dashboard from "@/app/(dashboard)/dashboard/resumen/page";
import BillingPage from "@/app/(dashboard)/dashboard/cuentas-cobro/page";

vi.mock("@/app/(dashboard)/dashboard/resumen/Statistics", () => ({ default: () => <div>Estadísticas de cobro</div> }));
vi.mock("@/components/dashboard/billing-statements/ListBillingStatements", () => ({ default: () => null }));
afterEach(cleanup);

it("ofrece accesos directos para crear y seguir cobros", () => {
  render(<Dashboard />);
  expect(screen.getByRole("heading", { name: "Tu resumen" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Crear cuenta de cobro" }).getAttribute("href")).toBe("/dashboard/cuentas-cobro/crear");
  expect(screen.getByRole("link", { name: /Registra tus ítems pendientes/ }).getAttribute("href")).toBe("/dashboard/items");
  expect(screen.getByText("Estadísticas de cobro")).toBeTruthy();
});

it("mantiene el acceso de creación consistente con la vista de cuentas", () => {
  render(<><Dashboard /><BillingPage /></>);
  const resumen = screen.getByRole("link", { name: "Crear cuenta de cobro" });
  const cuentas = screen.getByRole("link", { name: "Crear nueva cuenta de cobro" });
  expect(resumen.getAttribute("href")).toBe(cuentas.getAttribute("href"));
  expect(resumen.className).toBe(cuentas.className);
});
