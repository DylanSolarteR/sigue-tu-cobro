"use client";

import { useState } from "react";

export default function MoneyInput({
  id,
  value,
  onChange,
  disabled,
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const [error, setError] = useState(false);
  const display = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (
    <div className="space-y-2">
      <div className="border-stc-border bg-stc-field hover:border-stc-focus focus-within:border-stc-focus flex items-center gap-2 rounded-2xl border px-4 text-[var(--color-stc-money-prefix)]">
        <span aria-hidden="true">$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="text-stc-text min-h-12 w-full bg-transparent text-base outline-none"
          value={display}
          disabled={disabled}
          required={required}
          aria-invalid={error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            const next = event.target.value;
            if (!/^[\d.]*$/.test(next)) {
              setError(true);
              return;
            }
            setError(false);
            onChange(next.replace(/\./g, ""));
          }}
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-stc-label text-stc-error"
        >
          Usa únicamente números.
        </p>
      )}
    </div>
  );
}
