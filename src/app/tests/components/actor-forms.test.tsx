// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CreateClientForm from "@/components/dashboard/clients/CreateClientForm";
import UpdateCreditorForm from "@/components/dashboard/creditors/UpdateCreditorForm";
import { createClient } from "@/actions/actor.api";

vi.mock("@/actions/actor.api", () => ({
  createClient: vi.fn(),
  createCreditor: vi.fn(),
  updateClientById: vi.fn(),
  updateCreditorById: vi.fn(),
  getClientById: vi.fn(),
  getCreditorById: vi.fn(async () => ({ success: true, data: { id: "1", name: "Persona acreedora", docType: "NIT", docNumber: "123456", telephone: "3001234567" } })),
}));

afterEach(cleanup);

describe("formularios de clientes y acreedores", () => {
  it("permite seleccionar un tipo de documento mediante un select nativo etiquetado", () => {
    render(<CreateClientForm />);
    const documentType = screen.getByRole("combobox", { name: "Tipo de documento" });
    expect(documentType.tagName).toBe("SELECT");
    expect(documentType.getAttribute("name")).toBe("docType");
    expect(documentType.hasAttribute("required")).toBe(true);
    expect(screen.getByRole("textbox", { name: "Nombre completo" }).hasAttribute("required")).toBe(true);
  });

  it("muestra los datos del acreedor al editar y preserva su documento", async () => {
    render(<UpdateCreditorForm id="1" />);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Nombre completo" })).toBeTruthy());
    expect((screen.getByRole("textbox", { name: "Nombre completo" }) as HTMLInputElement).value).toBe("Persona acreedora");
    expect((screen.getByRole("combobox", { name: "Tipo de documento" }) as HTMLSelectElement).value).toBe("NIT");
    expect(screen.getByRole("button", { name: "Actualizar acreedor" })).toBeTruthy();
  });

  it("envía los datos seleccionados y muestra los errores del servidor", async () => {
    vi.mocked(createClient).mockResolvedValueOnce({ success: false, message: "Revisa los datos", errors: { docNumber: ["Documento inválido"] }, input: { name: "Ana Pérez", docType: "CC", docNumber: "12345" } });
    render(<CreateClientForm />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre completo" }), { target: { value: "Ana Pérez" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Tipo de documento" }), { target: { value: "CC" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Número de documento" }), { target: { value: "12345" } });
    fireEvent.submit(screen.getByRole("button", { name: "Crear cliente" }).closest("form")!);
    await waitFor(() => expect(createClient).toHaveBeenCalled());
    const submitted = vi.mocked(createClient).mock.calls[0]?.[1];
    expect(submitted?.get("docType")).toBe("CC");
    expect(await screen.findByText("Documento inválido")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Número de documento" }).getAttribute("aria-invalid")).toBe("true");
    expect((screen.getByRole("combobox", { name: "Tipo de documento" }) as HTMLSelectElement).value).toBe("CC");
    expect((screen.getByRole("textbox", { name: "Nombre completo" }) as HTMLInputElement).value).toBe("Ana Pérez");
  });
});
