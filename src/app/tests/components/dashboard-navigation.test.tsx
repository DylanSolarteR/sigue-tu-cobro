// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SidebarDashboard from "@/components/SidebarDashboard";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard/cuentas-cobro/crear" }));
vi.mock("@clerk/nextjs", () => ({ Show: ({ children }: { children: React.ReactNode }) => children, UserButton: () => <span>Perfil</span> }));
afterEach(cleanup);

describe("navegación del panel", () => {
  it("indica la sección activa también en sus páginas hijas", () => {
    render(<SidebarDashboard />);
    const navigation = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(within(navigation).getByRole("link", { name: "Cuentas de cobro" }).getAttribute("aria-current")).toBe("page");
    expect(within(navigation).getByRole("link", { name: "Ítems" }).getAttribute("href")).toBe("/dashboard/items");
  });

  it("permite abrir y cerrar el menú móvil con controles accesibles", () => {
    render(<SidebarDashboard />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(screen.getByRole("navigation", { name: "Navegación móvil" }), { key: "Escape" });
    expect(screen.getByRole("button", { name: "Abrir menú" }).getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Abrir menú" }));
  });
});
