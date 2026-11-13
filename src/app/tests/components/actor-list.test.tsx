// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActorList } from "@/components/dashboard/actors/ActorList";
import ListClients from "@/components/dashboard/clients/ListClients";
import { deleteClientById, getClients, getCreditors } from "@/actions/actor.api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/actions/actor.api", () => ({
  getClients: vi.fn(async () => Array.from({ length: 11 }, (_, index) => ({ id: String(index), name: `Cliente ${index + 1}`, docType: "CC", docNumber: "123456" }))),
  getCreditors: vi.fn(), deleteClientById: vi.fn(async () => ({ success: true, message: "Eliminado" })), deleteCreditorById: vi.fn(),
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("listado de clientes", () => {
  it("reserva espacio con un skeleton accesible mientras carga", () => {
    vi.mocked(getClients).mockImplementationOnce(() => new Promise(() => { /* Mantiene la carga pendiente. */ }));
    render(<ListClients />);
    const status = screen.getByRole("status", { name: "Cargando clientes" });
    expect(status.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it("muestra los datos en una tabla y conserva la paginación", async () => {
    render(<ListClients />);
    expect(await screen.findByText("Cliente 1")).toBeTruthy();
    const table = screen.getByRole("table");
    expect(within(table).queryByText("Cliente 11")).toBeNull();
    const pagination = screen.getByRole("navigation", { name: "Paginación de clientes inferior" });
    fireEvent.click(within(pagination).getByRole("button", { name: "Página 2" }));
    expect(within(table).getByText("Cliente 11")).toBeTruthy();
    expect(within(pagination).getByRole("button", { name: "Página 2" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Anterior" }).hasAttribute("disabled")).toBe(false);
  });

  it("identifica los datos de cada registro y conserva acciones accesibles", async () => {
    render(<ListClients />);
    const row = (await screen.findByText("Cliente 1")).closest("tr")!;
    expect(within(row).getByText("CC 123456").closest("td")?.getAttribute("data-label")).toBe("Documento");
    expect(within(row).getByRole("link", { name: "Editar Cliente 1" }).getAttribute("href")).toBe("/dashboard/clientes/editar/0");
    expect(within(row).getByRole("button", { name: "Eliminar Cliente 1" })).toBeTruthy();
  });

  it("solicita confirmación y retira el cliente solo al eliminarlo correctamente", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ListClients />);
    expect(await screen.findByText("Cliente 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar Cliente 1" }));
    await waitFor(() => expect(deleteClientById).toHaveBeenCalledWith("0"));
    await waitFor(() => expect(screen.queryByText("Cliente 1")).toBeNull());
  });
});

it("reinicia la página al cambiar de clientes a acreedores", async () => {
  vi.mocked(getCreditors).mockResolvedValueOnce([{ id: "a1", name: "Acreedor nuevo", docType: "CC", docNumber: "12345", type: "creditor", ownerId: "user-test", expeditionPlace: null, telephone: null, isActive: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" }]);
  const { rerender } = render(<ActorList kind="client" />);
  await screen.findByText("Cliente 1");
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  expect(screen.getByText("Cliente 11")).toBeTruthy();
  rerender(<ActorList kind="creditor" />);
  expect(screen.getByRole("status", { name: "Cargando acreedores" })).toBeTruthy();
  expect(await screen.findByText("Acreedor nuevo")).toBeTruthy();
  expect(screen.queryByRole("navigation", { name: "Paginación de acreedores inferior" })).toBeNull();
});

it("vuelve a la página disponible al eliminar el último cliente de una página", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<ActorList kind="client" cards />);
  await screen.findByText("Cliente 1");
  fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
  fireEvent.click(screen.getByRole("button", { name: "Eliminar Cliente 11" }));
  expect(await screen.findByText("Cliente 1")).toBeTruthy();
  expect(screen.queryByText("Cliente 11")).toBeNull();
  expect(screen.queryByRole("navigation", { name: "Paginación de clientes inferior" })).toBeNull();
});

it("mantiene independientes las páginas de clientes y acreedores", async () => {
  vi.mocked(getCreditors).mockResolvedValueOnce(Array.from({ length: 11 }, (_, index) => ({ id: `a${index}`, name: `Acreedor ${index + 1}`, docType: "CC" as const, docNumber: "12345", type: "creditor" as const, ownerId: "user-test", expeditionPlace: null, telephone: null, isActive: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" })));
  render(<><ActorList kind="client" cards /><ActorList kind="creditor" cards /></>);
  await screen.findByText("Cliente 1"); await screen.findByText("Acreedor 1");
  fireEvent.click(within(screen.getByRole("navigation", { name: "Paginación de clientes inferior" })).getByRole("button", { name: "Página 2" }));
  expect(screen.getByText("Cliente 11")).toBeTruthy();
  expect(screen.getByText("Acreedor 1")).toBeTruthy();
  expect(within(screen.getByRole("navigation", { name: "Paginación de acreedores inferior" })).getByRole("button", { name: "Página 1" }).getAttribute("aria-current")).toBe("page");
});
