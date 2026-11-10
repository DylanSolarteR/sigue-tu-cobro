import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getBillingStatements = vi.hoisted(() => vi.fn());
vi.mock("@/actions/billing-statement.api", () => ({ getBillingStatements }));
import Statistics from "../../(dashboard)/dashboard/resumen/Statistics";

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe("resumen de cuentas", () => {
  it("explica cómo comenzar si no hay cuentas", async () => {
    getBillingStatements.mockResolvedValue({ success: true, data: [] });
    const html = renderToStaticMarkup(await Statistics());
    expect(html).toContain("Tu resumen comienza aquí");
    expect(html).toContain("/dashboard/cuentas-cobro/crear");
  });

  it("muestra error explícito cuando no es posible cargar datos", async () => {
    getBillingStatements.mockResolvedValue({ success: false });
    const html = renderToStaticMarkup(await Statistics());
    expect(html).toContain("No pudimos cargar el resumen");
    expect(html).not.toContain("Tu resumen comienza aquí");
  });

  it("muestra estados y el valor real de cuentas creadas por mes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    getBillingStatements.mockResolvedValue({ success: true, data: [
      { status: "paid", amount: 150000, createdAt: "2026-01-10T12:00:00Z" },
      { status: "pending", amount: 50000, createdAt: "2026-01-11T12:00:00Z" },
    ] });
    const html = renderToStaticMarkup(await Statistics());
    expect(html).toContain("$200.000");
    expect(html).toContain("por fecha de creación");
    expect(html).toContain("Pagadas");
    expect(html).toContain("Pendientes");
  });
});
