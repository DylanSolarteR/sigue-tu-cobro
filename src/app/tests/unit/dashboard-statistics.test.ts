import { describe, expect, it } from "vitest";
import { buildDashboardStatistics } from "@/lib/dashboard-statistics";

describe("estadísticas del dashboard", () => {
  it("cuenta estados y acumula el valor por mes de creación en Colombia", () => {
    const result = buildDashboardStatistics([
      { status: "pending", amount: 100, createdAt: "2026-01-01T03:00:00Z" },
      { status: "paid", amount: 250, createdAt: "2026-01-04T12:00:00Z" },
      { status: "pending", amount: 50, createdAt: "2026-01-06T12:00:00Z" },
    ], new Date("2026-01-10T12:00:00Z"));
    expect(result.totalAmount).toBe(400);
    expect(result.paid).toBe(1);
    expect(result.pending).toBe(2);
    expect(result.months.at(-2)).toMatchObject({ key: "2025-12", amount: 100 });
    expect(result.months.at(-1)).toMatchObject({ key: "2026-01", amount: 300 });
  });

  it("no inventa datos ante fechas inválidas y mantiene meses sin cuentas", () => {
    const result = buildDashboardStatistics([
      { status: "paid", amount: 25, createdAt: "no es fecha" },
    ], new Date("2026-01-10T12:00:00Z"));
    expect(result.totalAmount).toBe(25);
    expect(result.months).toHaveLength(6);
    expect(result.months.every((month) => month.amount === 0)).toBe(true);
  });

  it("maneja el estado vacío con ceros", () => {
    const result = buildDashboardStatistics([], new Date("2026-01-10T12:00:00Z"));
    expect(result).toMatchObject({ totalAmount: 0, paid: 0, pending: 0, total: 0 });
  });
});

it("calcula cartera pendiente y vencida según el día civil de Colombia", () => {
  const result = buildDashboardStatistics([
    { status: "pending", amount: 100, payDate: "2026-01-14" },
    { status: "pending", amount: 200, payDate: "2026-01-15" },
    { status: "pending", amount: 300, payDate: "2026-01-15T03:00:00Z" },
    { status: "paid", amount: 400, payDate: "2026-01-01" },
    { status: "pending", amount: 50, payDate: "fecha inválida" },
  ], new Date("2026-01-15T12:00:00Z"));
  expect(result.pendingAmount).toBe(650);
  expect(result.overdueAmount).toBe(400);
});

it("agrupa por identificador, incluso con nombres repetidos", () => {
  const result = buildDashboardStatistics([
    { status: "pending", amount: 100, client_id: "1", client: { name: "Cliente" } },
    { status: "paid", amount: 50, client_id: "1", client: { name: "Cliente" } },
    { status: "pending", amount: 75, client_id: "2", client: { name: "Cliente" } },
  ]);
  expect(result.clients).toEqual([
    { id: "1", name: "Cliente", amount: 150 },
    { id: "2", name: "Cliente", amount: 75 },
  ]);
});
