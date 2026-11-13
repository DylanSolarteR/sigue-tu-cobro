// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CreateClient from "@/app/(dashboard)/dashboard/clientes/crear/page";
import EditClient from "@/app/(dashboard)/dashboard/clientes/editar/[id]/page";
import CreateCreditor from "@/app/(dashboard)/dashboard/acreedores/crear/page";
import EditCreditor from "@/app/(dashboard)/dashboard/acreedores/editar/[id]/page";
vi.mock("@/components/dashboard/clients/CreateClientForm", () => ({ default: () => null }));
vi.mock("@/components/dashboard/clients/UpdateClientForm", () => ({ default: () => null }));
vi.mock("@/components/dashboard/creditors/CreateCreditorForm", () => ({ default: () => null }));
vi.mock("@/components/dashboard/creditors/UpdateCreditorForm", () => ({ default: () => null }));
afterEach(cleanup);
it.each([
  ["crear cliente", () => CreateClient()],
  ["editar cliente", () => EditClient({ params: Promise.resolve({ id: "1" }) })],
  ["crear acreedor", () => CreateCreditor()],
  ["editar acreedor", () => EditCreditor({ params: Promise.resolve({ id: "1" }) })],
])("vuelve al Directorio desde %s", async (_label, page) => {
  render(await page());
  expect(screen.getByRole("link", { name: "Volver al directorio" }).getAttribute("href")).toBe("/dashboard/directorio");
});
