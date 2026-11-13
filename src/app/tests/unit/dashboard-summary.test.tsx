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

  it("muestra estados y explica la fecha usada en la evolución", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    getBillingStatements.mockResolvedValue({ success: true, data: [
      { status: "paid", amount: 150000, createdAt: "2026-01-10T12:00:00Z" },
      { status: "pending", amount: 50000, createdAt: "2026-01-11T12:00:00Z" },
    ] });
    const html = renderToStaticMarkup(await Statistics());
    expect(html).toContain("$200.000");
    expect(html).toContain("fecha prevista de pago");
    expect(html).toContain("Pagadas");
    expect(html).toContain("Pendientes");
  });
});

it("presenta cartera y valores por cliente sin depender del color", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
  getBillingStatements.mockResolvedValue({ success: true, data: [
    { status: "pending", amount: 50000, payDate: "2026-01-14", client_id: "a", client: { name: "Acme" } },
    { status: "paid", amount: 150000, payDate: "2026-01-01", client_id: "a", client: { name: "Acme" } },
  ] });
  const html = renderToStaticMarkup(await Statistics());
  expect(html).toContain("Valor pendiente");
  expect(html).not.toContain("Valor vencido");
  expect(html).toContain("Top 5 clientes por valor de cuentas pagadas");
  expect(html).toContain("Acme");
  expect(html).toContain("$200.000");
});
