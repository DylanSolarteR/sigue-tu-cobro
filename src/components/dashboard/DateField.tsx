"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatBillingDate } from "@/lib/billing-date";

function civil(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function firstMonth(value: string) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(value);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
}

export default function DateField({
  id,
  label,
  value,
  onChange,
  disabled,
  allowClear = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => firstMonth(value));
  const formatted = value ? formatBillingDate(value) : null;
  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const title = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(month);
  return (
    <div
      className="relative min-w-0 space-y-2"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span className="block text-sm font-medium text-[#d8e6df]">{label}</span>
      <button
        id={id}
        type="button"
        aria-label={label}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (!open) setMonth(firstMonth(value));
          setOpen(!open);
        }}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-[#52645d] bg-[#101815] px-4 text-left text-sm text-[#edf5ef] hover:border-[#87bba5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74d5a7] disabled:opacity-50"
      >
        <CalendarDays
          size={18}
          aria-hidden="true"
          className="shrink-0 text-[#74d5a7]"
        />
        <span className="flex-1">
          {formatted?.ok ? formatted.value : "Seleccionar fecha"}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-[#40544b] bg-[#0b1512] p-4 shadow-xl"
          role="group"
          aria-label={`Calendario: ${label}`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="rounded-xl p-2 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#74d5a7]"
            >
              <ChevronLeft size={18} />
            </button>
            <strong className="text-[#edf5ef] capitalize">{title}</strong>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              className="rounded-xl p-2 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#74d5a7]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div
            className="mt-3 grid grid-cols-7 text-center text-xs text-[#a9bdb2]"
            aria-hidden="true"
          >
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <span key={index} className="py-2">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: offset }, (_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const day = index + 1;
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              const key = civil(date);
              const name = new Intl.DateTimeFormat("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(date);
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={name}
                  aria-pressed={value === key}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-sm focus-visible:outline-2 focus-visible:outline-[#74d5a7] ${value === key ? "bg-[#74d5a7] font-semibold text-[#10231b]" : "text-[#e2eee8] hover:bg-[#355146]"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {value && allowClear && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-3 flex items-center gap-1 text-sm text-[#b5c9be] hover:text-white"
            >
              <X size={15} /> Limpiar fecha
            </button>
          )}
        </div>
      )}
    </div>
  );
}
