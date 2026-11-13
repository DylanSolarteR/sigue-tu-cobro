"use client";

import { calendarDateToCivil, parseBillingDateForCalendar } from "@/lib/billing-date";
import DateField from "@/components/dashboard/DateField";
import { useId } from "react";

export function DatePicker({ date, setDate }: { date: Date; setDate: (date: Date) => void }) {
  const current = calendarDateToCivil(date);
  const id = useId();
  return (
    <DateField
      id={id}
      label="Fecha de pago"
      allowClear={false}
      value={current.ok ? current.value : ""}
      onChange={(value) => {
        const selected = parseBillingDateForCalendar(value);
        if (selected.ok) setDate(selected.value);
      }}
    />
  );
}
