import { describe, expect, it } from "vitest";
import { billingDateSchema, calendarDateToCivil, formatBillingDate, parseBillingDateForCalendar } from "../../../lib/billing-date";

describe("fecha civil de cuenta de cobro", () => {
  it("conserva el día elegido en el calendario al guardarlo", () => {
    const selected = new Date(2026, 0, 1, 23, 45);
    expect(calendarDateToCivil(selected)).toEqual({ ok: true, value: "2026-01-01" });
    const parsed = parseBillingDateForCalendar("2026-01-01");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect([parsed.value.getFullYear(), parsed.value.getMonth(), parsed.value.getDate()]).toEqual([2026, 0, 1]);
  });

  it.each(["2026-02-29", "2026-13-01", "2026-00-01", "2026-01-32", "no es fecha", ""]) (
    "rechaza fecha inválida %s", (value) => {
      expect(billingDateSchema.safeParse(value).success).toBe(false);
    },
  );

  it("acepta año bisiesto y fechas ISO existentes", () => {
    expect(billingDateSchema.safeParse("2024-02-29").success).toBe(true);
    expect(billingDateSchema.safeParse("2026-01-01T05:00:00.000Z").success).toBe(true);
  });

  it("formatea una fecha civil igual sin depender del huso horario", () => {
    const previous = process.env.TZ;
    try {
      for (const timeZone of ["America/Bogota", "UTC", "Asia/Tokyo"]) {
        process.env.TZ = timeZone;
        expect(formatBillingDate("2026-01-01")).toEqual({ ok: true, value: "1 de enero de 2026" });
      }
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });

  it.each(["America/Bogota", "UTC", "Asia/Tokyo"])("interpreta ISO históricos en hora de Colombia con dispositivo en %s", (timeZone) => {
    const previous = process.env.TZ;
    try {
      process.env.TZ = timeZone;
      expect(formatBillingDate("2026-01-01T00:00:00.000Z")).toEqual({ ok: true, value: "31 de diciembre de 2025" });
      expect(formatBillingDate("2026-01-01T05:00:00.000Z")).toEqual({ ok: true, value: "1 de enero de 2026" });
      const parsed = parseBillingDateForCalendar("2026-01-01T00:00:00.000Z");
      expect(parsed.ok && calendarDateToCivil(parsed.value)).toEqual({ ok: true, value: "2025-12-31" });
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });
});
