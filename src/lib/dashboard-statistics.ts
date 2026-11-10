import { billingDateSchema } from "@/lib/billing-date";

export type StatementSummary = { status: string; amount?: number; createdAt?: string; payDate?: string; client_id?: string; client?: { name: string } };

const civilDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
};

export function buildDashboardStatistics(statements: StatementSummary[], now = new Date()) {
  const current = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", timeZone: "America/Bogota",
  }).formatToParts(now);
  const year = Number(current.find((part) => part.type === "year")?.value);
  const month = Number(current.find((part) => part.type === "month")?.value);
  const formatter = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit", timeZone: "UTC" });
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 6 + index, 1));
    return { key: date.toISOString().slice(0, 7), label: formatter.format(date).replace(".", ""), amount: 0 };
  });
  const grouped = new Map(months.map((entry) => [entry.key, entry]));
  let totalAmount = 0;
  let paid = 0;
  let pending = 0;
  let pendingAmount = 0;
  let overdueAmount = 0;
  const today = civilDate(now);
  const clients = new Map<string, { id: string; name: string; amount: number }>();
  for (const statement of statements) {
    const amount = typeof statement.amount === "number" && Number.isFinite(statement.amount) ? statement.amount : 0;
    totalAmount += amount;
    if (statement.status === "paid") paid++;
    if (statement.status === "pending") {
      pending++;
      pendingAmount += amount;
      if (statement.payDate && billingDateSchema.safeParse(statement.payDate).success) {
        const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(statement.payDate)
          ? statement.payDate : civilDate(new Date(statement.payDate));
        if (dueDate < today) overdueAmount += amount;
      }
    }
    if (statement.client_id && statement.client?.name) {
      const client = clients.get(statement.client_id) ?? { id: statement.client_id, name: statement.client.name, amount: 0 };
      client.amount += amount;
      clients.set(statement.client_id, client);
    }
    if (!statement.createdAt) continue;
    const date = new Date(statement.createdAt);
    if (!Number.isFinite(date.getTime())) continue;
    const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "America/Bogota" }).formatToParts(date);
    const key = `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
    const entry = grouped.get(key);
    if (entry) entry.amount += amount;
  }
  return { totalAmount, paid, pending, pendingAmount, overdueAmount, clients: [...clients.values()].sort((a, b) => b.amount - a.amount), total: statements.length, months };
}

export type SummaryPeriod = { start: string; end: string };

export function getSummaryPeriod(monthCount: 3 | 6 | 12, now = new Date()): SummaryPeriod {
  const today = civilDate(now);
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  return {
    start: new Date(Date.UTC(year, month - monthCount, 1)).toISOString().slice(0, 10),
    end: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10),
  };
}

export function buildSummaryAnalytics(statements: StatementSummary[], period: SummaryPeriod, clientId: string) {
  const isCivil = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && billingDateSchema.safeParse(value).success;
  if (!isCivil(period.start) || !isCivil(period.end) || period.start > period.end) {
    return { ok: false as const, error: "Selecciona un rango de fechas válido." };
  }
  const startYear = Number(period.start.slice(0, 4));
  const startMonth = Number(period.start.slice(5, 7));
  const endYear = Number(period.end.slice(0, 4));
  const endMonth = Number(period.end.slice(5, 7));
  const count = (endYear - startYear) * 12 + endMonth - startMonth + 1;
  if (count > 1200) return { ok: false as const, error: "Selecciona un período de hasta 100 años." };
  const formatter = new Intl.DateTimeFormat("es-CO", { month: "short", year: "numeric", timeZone: "UTC" });
  const months = Array.from({ length: count }, (_, index) => {
    const date = new Date(0);
    date.setUTCFullYear(startYear, startMonth - 1 + index, 1);
    return { key: date.toISOString().slice(0, 7), label: formatter.format(date).replace(".", ""), amount: 0 };
  });
  const grouped = new Map(months.map((month) => [month.key, month]));
  const clients = new Map<string, { id: string; name: string; amount: number }>();
  for (const statement of statements) {
    if (!statement.payDate || !billingDateSchema.safeParse(statement.payDate).success) continue;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(statement.payDate) ? statement.payDate : civilDate(new Date(statement.payDate));
    if (date < period.start || date > period.end) continue;
    const amount = typeof statement.amount === "number" && Number.isFinite(statement.amount) ? statement.amount : 0;
    if (clientId === "all" || statement.client_id === clientId) {
      const month = grouped.get(date.slice(0, 7));
      if (month) month.amount += amount;
    }
    if (statement.status === "paid" && statement.client_id && statement.client?.name) {
      const client = clients.get(statement.client_id) ?? { id: statement.client_id, name: statement.client.name, amount: 0 };
      client.amount += amount;
      clients.set(statement.client_id, client);
    }
  }
  return { ok: true as const, value: { months, clients: [...clients.values()].sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "es")) } };
}
