// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Directorio from "@/app/(dashboard)/dashboard/directorio/page";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/actions/actor.api", () => ({
  getClients: vi.fn(async () => [{ id: "1", name: "Ana", docType: "CC", docNumber: "12345" }]),
  getCreditors: vi.fn(async () => [{ id: "2", name: "Luis", docType: "NIT", docNumber: "54321" }]),
  deleteClientById: vi.fn(), deleteCreditorById: vi.fn(),
}));
afterEach(cleanup);

it("reúne ambas secciones expandibles y mantiene visibles las acciones de creación", async () => {
  render(<Directorio />);
  expect(screen.getByRole("link", { name: "Crear cliente" }).getAttribute("href")).toBe("/dashboard/clientes/crear");
  expect(screen.getByRole("link", { name: "Crear acreedor" }).getAttribute("href")).toBe("/dashboard/acreedores/crear");
  const clients = screen.getByRole("button", { name: "Clientes" });
  expect(clients.getAttribute("aria-expanded")).toBe("true");
  expect(await screen.findByText("Ana")).toBeTruthy();
  expect(await screen.findByText("Luis")).toBeTruthy();
  const card = screen.getByText("Ana").closest("li")!;
  expect(within(card).getByRole("link", { name: "Editar Ana" }).getAttribute("href")).toBe("/dashboard/clientes/editar/1");
  expect(within(card).getByRole("button", { name: "Eliminar Ana" })).toBeTruthy();
  fireEvent.click(clients);
  expect(clients.getAttribute("aria-expanded")).toBe("false");
  expect(screen.getByText("Ana").closest("[hidden]")).toBeTruthy();
  expect(screen.getByText("Luis")).toBeTruthy();
});
