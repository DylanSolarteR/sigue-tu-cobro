"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ICON_ACTION_CLASS } from "./action-styles";

type PaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  label: string;
  position: "superior" | "inferior";
  disabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
};
export default function Pagination({
  page,
  pages,
  onChange,
  label,
  position,
  disabled = false,
  previousLabel = "Anterior",
  nextLabel = "Siguiente",
}: PaginationProps) {
  if (pages <= 1) return null;
  const current = Math.min(Math.max(0, page), pages - 1);
  const start = Math.max(0, current - 1);
  const end = Math.min(pages - 1, current + 1);
  const neighbors = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  );
  const action = cn(
    ICON_ACTION_CLASS,
    "px-2 text-[length:var(--text-stc-label)] font-medium tabular-nums transition-colors motion-reduce:transition-none",
  );
  return (
    <nav
      aria-label={`${label} ${position}`}
      className="flex min-w-0 items-center gap-1 sm:gap-2"
    >
      <button
        type="button"
        className={action}
        aria-label={previousLabel}
        disabled={disabled || current === 0}
        onClick={() => onChange(current - 1)}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      {neighbors.map((number) => (
        <button
          key={number}
          type="button"
          aria-label={`Página ${number + 1}`}
          aria-current={number === current ? "page" : undefined}
          disabled={disabled}
          className={cn(
            action,
            number === current &&
                "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:bg-[var(--color-primary)]",
          )}
          onClick={() => {
            if (number !== current) onChange(number);
          }}
        >
          {number + 1}
        </button>
      ))}
      <button
        type="button"
        className={action}
        aria-label={nextLabel}
        disabled={disabled || current === pages - 1}
        onClick={() => onChange(current + 1)}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
      <span
        className="sr-only"
        aria-live={position === "inferior" ? "polite" : undefined}
      >
        Página {current + 1} de {pages}
      </span>
    </nav>
  );
}

type PaginatedListProps = Omit<PaginationProps, "position"> & {
  children: ReactNode;
  countLabel?: string;
};
export function PaginatedList({
  children,
  countLabel,
  ...pagination
}: PaginatedListProps) {
  const content = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const node = content.current;
    if (!node) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const exceeds = node.getBoundingClientRect().height > window.innerHeight;
      if (!exceeds && top.current?.contains(document.activeElement)) {
        bottom.current
          ?.querySelector<HTMLButtonElement>('[aria-current="page"]')
          ?.focus({ preventScroll: true });
      }
      setTall(exceeds);
    };
    // Observe only rows: inserting navigation cannot change its own threshold.
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(node);
    window.addEventListener("resize", measure);
    queueMicrotask(measure);
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <div className="w-full min-w-0 space-y-3">
      {tall && pagination.pages > 1 && (
        <div ref={top} className="flex justify-end">
          <Pagination {...pagination} position="superior" />
        </div>
      )}
      <div ref={content} className="min-w-0">
        {children}
      </div>
      {pagination.pages > 1 && (
        <div
          ref={bottom}
          className="flex flex-wrap items-center justify-center gap-3 sm:justify-end"
        >
          {countLabel && (
            <p className="text-stc-muted text-[length:var(--text-stc-label)] sm:mr-auto">
              {countLabel}
            </p>
          )}
          <Pagination {...pagination} position="inferior" />
        </div>
      )}
    </div>
  );
}
