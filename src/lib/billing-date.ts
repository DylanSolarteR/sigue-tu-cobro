import { z } from "zod";

type DateResult<T> = { ok: true; value: T } | { ok: false; error: string };

// Legacy timestamps are interpreted in the Colombian time zone.
export const billingDateSchema = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);

export function calendarDateToCivil(date: Date): DateResult<string> {
  if (!Number.isFinite(date.getTime())) return { ok: false, error: "Fecha inválida" };
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const value = `${year}-${month}-${day}`;
  return z.iso.date().safeParse(value).success
    ? { ok: true, value }
    : { ok: false, error: "Fecha inválida" };
}

export function parseBillingDateForCalendar(value: string): DateResult<Date> {
  if (!billingDateSchema.safeParse(value).success) return { ok: false, error: "Fecha inválida" };
  const civil = z.iso.date().safeParse(value).success
    ? value
    : new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const [year, month, day] = civil.split("-").map(Number) as [number, number, number];
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return { ok: true, value: date };
}

export function formatBillingDate(value: string): DateResult<string> {
  if (!billingDateSchema.safeParse(value).success) return { ok: false, error: "Fecha inválida" };
  if (!z.iso.date().safeParse(value).success) {
    return { ok: true, value: new Date(value).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }) };
  }
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return { ok: true, value: date.toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "UTC" }) };
}
