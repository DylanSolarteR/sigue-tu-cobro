"use client";

import { calendarDateToCivil, parseBillingDateForCalendar } from "@/lib/billing-date";

export function DatePicker({ date, setDate }: { date: Date; setDate: (date: Date) => void }) {
  const current = calendarDateToCivil(date);
  return (
    <input
      type="date"
      aria-label="Fecha de pago"
      className="input w-full sm:max-w-xs"
      value={current.ok ? current.value : ""}
      onChange={(event) => {
        const selected = parseBillingDateForCalendar(event.target.value);
        if (selected.ok) setDate(selected.value);
      }}
    />
  );
}
