import { describe, expect, it } from "vitest";
import { buildSummaryAnalytics, getSummaryPeriod } from "@/lib/dashboard-statistics";

const statements = [
  { status: "paid", amount: 100, payDate: "2026-01-01", client_id: "a", client: { name: "Alfa" } },
  { status: "paid", amount: 200, payDate: "2026-02-01T03:00:00Z", client_id: "b", client: { name: "Beta" } },
  { status: "pending", amount: 500, payDate: "2026-01-31", client_id: "a", client: { name: "Alfa" } },
  { status: "paid", amount: 300, payDate: "2026-02-01", client_id: "a", client: { name: "Alfa" } },
  { status: "paid", amount: 900, payDate: "inválida", client_id: "b", client: { name: "Beta" } },
];

describe("análisis por fecha prevista", () => {
  it("obtiene períodos completos según el día civil en Colombia", () => {
    expect(getSummaryPeriod(3, new Date("2026-03-01T03:00:00Z"))).toEqual({ start: "2025-12-01", end: "2026-02-28" });
  });

  it("incluye los límites y convierte marcas antiguas a fecha civil de Colombia", () => {
    const result = buildSummaryAnalytics(statements, { start: "2026-01-01", end: "2026-01-31" }, "all");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.months).toMatchObject([{ key: "2026-01", amount: 800 }]);
    expect(result.value.clients).toEqual([{ id: "b", name: "Beta", amount: 200 }, { id: "a", name: "Alfa", amount: 100 }]);
  });

  it("filtra la gráfica por identificador sin alterar el ranking de cuentas pagadas", () => {
    const result = buildSummaryAnalytics(statements, { start: "2026-01-01", end: "2026-02-28" }, "a");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.months.map((month) => month.amount)).toEqual([600, 300]);
    expect(result.value.clients).toEqual([{ id: "a", name: "Alfa", amount: 400 }, { id: "b", name: "Beta", amount: 200 }]);
  });

  it("rechaza rangos inválidos o invertidos", () => {
    expect(buildSummaryAnalytics(statements, { start: "2026-02-30", end: "2026-03-01" }, "all").ok).toBe(false);
    expect(buildSummaryAnalytics(statements, { start: "2026-03-01", end: "2026-02-01" }, "all").ok).toBe(false);
  });
});
