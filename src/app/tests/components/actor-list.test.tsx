// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ListClients from "@/components/dashboard/clients/ListClients";
import { deleteClientById } from "@/actions/actor.api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/actions/actor.api", () => ({
  getClients: vi.fn(async () => Array.from({ length: 11 }, (_, index) => ({ id: String(index), name: `Cliente ${index + 1}`, docType: "CC", docNumber: "123456" }))),
  getCreditors: vi.fn(), deleteClientById: vi.fn(async () => ({ success: true, message: "Eliminado" })), deleteCreditorById: vi.fn(),
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("listado de clientes", () => {
  it("muestra los datos en una tabla y conserva la paginación", async () => {
    render(<ListClients />);
    expect(await screen.findByText("Cliente 1")).toBeTruthy();
    const table = screen.getByRole("table");
    expect(within(table).queryByText("Cliente 11")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(within(table).getByText("Cliente 11")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Anterior" }).hasAttribute("disabled")).toBe(false);
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
