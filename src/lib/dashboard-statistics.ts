type StatementSummary = { status: string; amount?: number; createdAt?: string };

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
  for (const statement of statements) {
    const amount = typeof statement.amount === "number" && Number.isFinite(statement.amount) ? statement.amount : 0;
    totalAmount += amount;
    if (statement.status === "paid") paid++;
    if (statement.status === "pending") pending++;
    if (!statement.createdAt) continue;
    const date = new Date(statement.createdAt);
    if (!Number.isFinite(date.getTime())) continue;
    const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "America/Bogota" }).formatToParts(date);
    const key = `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
    const entry = grouped.get(key);
    if (entry) entry.amount += amount;
  }
  return { totalAmount, paid, pending, total: statements.length, months };
}
