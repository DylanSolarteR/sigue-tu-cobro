// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CreatePage from "../../(dashboard)/dashboard/cuentas-cobro/crear/page";
import EditPage from "../../(dashboard)/dashboard/cuentas-cobro/editar/[id]/page";

vi.mock("@/components/dashboard/billing-statements/CreateBillingStatementForm", () => ({ default: () => <p>Formulario de creacion</p> }));
vi.mock("@/components/dashboard/billing-statements/UpdateBillingStatementForm", () => ({ default: ({ id }: { id: string }) => <p>Cuenta {id}</p> }));
afterEach(cleanup);

it("identifica la creacion y permite volver al listado", () => {
  render(<CreatePage />);
  expect(screen.getByRole("heading", { level: 1, name: "Crear cuenta de cobro" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Volver a cuentas de cobro" }).getAttribute("href")).toBe("/dashboard/cuentas-cobro");
  expect(screen.getByText("Formulario de creacion")).toBeTruthy();
});

it("identifica la edicion, conserva el identificador y permite volver al listado", async () => {
  render(await EditPage({ params: Promise.resolve({ id: "b1" }) }));
  expect(screen.getByRole("heading", { level: 1, name: "Editar cuenta de cobro" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Volver a cuentas de cobro" }).getAttribute("href")).toBe("/dashboard/cuentas-cobro");
  expect(screen.getByText("Cuenta b1")).toBeTruthy();
});
