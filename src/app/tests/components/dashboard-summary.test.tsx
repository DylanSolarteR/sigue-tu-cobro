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
  expect(screen.getByRole("link", { name: /Registra tus ítems/ }).getAttribute("href")).toBe("/dashboard/items");
  expect(screen.getByText("Estadísticas de cobro")).toBeTruthy();
});

it("mantiene el acceso de creación consistente con la vista de cuentas", () => {
  render(<><Dashboard /><BillingPage /></>);
  const resumen = screen.getByRole("link", { name: "Crear cuenta de cobro" });
  const cuentas = screen.getByRole("link", { name: "Crear nueva cuenta de cobro" });
  expect(resumen.getAttribute("href")).toBe(cuentas.getAttribute("href"));
  expect(resumen.className).toBe(cuentas.className);
});

it("presenta el recorrido de creación antes de las estadísticas", () => {
  render(<Dashboard />);
  const enlaces = [screen.getByRole("link", { name: /Completa tu directorio/i }), screen.getByRole("link", { name: /Registra tus ítems/i }), screen.getByRole("link", { name: /Crea una cuenta de cobro/i })];
  expect(enlaces.map((link) => link.getAttribute("href"))).toEqual(["/dashboard/directorio", "/dashboard/items", "/dashboard/cuentas-cobro/crear"]);
  expect(enlaces[0]!.compareDocumentPosition(screen.getByText("Estadísticas de cobro")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByText("Prepara tu próximo cobro")).toBeNull();
});
