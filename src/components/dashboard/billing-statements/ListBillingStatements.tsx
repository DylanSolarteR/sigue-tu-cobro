"use client";

import SelectField from "@/components/dashboard/SelectField";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Trash } from "lucide-react";
import { ICON_ACTION_CLASS } from "@/components/dashboard/action-styles";
import DateField from "@/components/dashboard/DateField";
import { toast } from "sonner";
import {
  deleteBillingstatement,
  getBillingStatements,
  updateBillingStatementStatus,
} from "@/actions/billing-statement.api";
import DownloadPDFButton from "@/components/generatePDF";
import UpdateBillingStatementForm from "./UpdateBillingStatementForm";
import {
  calendarDateToCivil,
  formatBillingDate,
  parseBillingDateForCalendar,
} from "@/lib/billing-date";
import type { billing_statement } from "@/types/billing-statement";

const PAGE_SIZE = 10;
const HOLD_MS = 600;

export default function ListBillingStatements() {
  const [accounts, setAccounts] = useState<billing_statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [pdfVersions, setPdfVersions] = useState<Record<string, number>>({});
  const [pdfBlocked, setPdfBlocked] = useState<string[]>([]);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const held = useRef(false);

  useEffect(() => {
    let active = true;
    void getBillingStatements()
      .then((result) => {
        if (!active) return;
        if (result.success) setAccounts(result.data ?? []);
        else setError(result.message);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("No se pudieron cargar las cuentas.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(
    () => () => {
      if (hold.current) clearTimeout(hold.current);
    },
    [],
  );

  function cancelHold() {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
    touchStart.current = null;
  }
  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }
  function toggleEditor(id: string) {
    if (busy) return;
    if (
      expanded !== null &&
      !window.confirm(
        "¿Cerrar la edición actual? Los cambios que no hayas guardado se perderán.",
      )
    )
      return;
    setExpanded(expanded === id ? null : id);
  }
  async function markPaid(account: billing_statement) {
    if (!account.id || account.status !== "pending") return;
    setBusy(true);
    try {
      const result = await updateBillingStatementStatus(account.id, "paid");
      if (!result.success) toast.error(result.message);
      else {
        setAccounts((current) =>
          current.map((item) =>
            item.id === account.id ? { ...item, status: "paid" } : item,
          ),
        );
        toast.success("Cuenta marcada como pagada.");
      }
    } catch {
      toast.error("No se pudo actualizar la cuenta.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(account: billing_statement) {
    if (
      !account.id ||
      account.status !== "pending" ||
      !window.confirm(
        "¿Eliminar esta cuenta de cobro? Sus ítems volverán a quedar pendientes.",
      )
    )
      return;
    setBusy(true);
    try {
      const result = await deleteBillingstatement(account.id);
      if (!result.success) toast.error(result.message);
      else {
        toast.success(result.message);
        setAccounts((current) =>
          current.filter((item) => item.id !== account.id),
        );
        setSelected((current) => current.filter((id) => id !== account.id));
      }
    } catch {
      toast.error("No se pudo eliminar la cuenta.");
    } finally {
      setBusy(false);
    }
  }
  async function batch(action: "paid" | "delete") {
    if (busy || expanded) return;
    setBusy(true);
    setSummary("");
    let currentAccounts: billing_statement[];
    try {
      const result = await getBillingStatements();
      if (!result.success || !result.data)
        throw new Error("No se pudieron verificar las cuentas.");
      currentAccounts = result.data;
    } catch {
      setSummary(
        "No se pudieron verificar las cuentas. No se realizó ninguna acción; intenta de nuevo.",
      );
      setBusy(false);
      return;
    }
    setAccounts(currentAccounts);
    const chosen = currentAccounts.filter(
      (account) => account.id && selected.includes(account.id),
    );
    const eligible = chosen.filter((account) => account.status === "pending");
    const omitted = selected.length - eligible.length;
    if (!eligible.length) {
      setSummary(
        "No hay cuentas pendientes seleccionadas; las cuentas no elegibles se omiten.",
      );
      setBusy(false);
      return;
    }
    if (
      action === "delete" &&
      !window.confirm(
        `¿Eliminar ${eligible.length} cuentas pendientes? Sus ítems volverán a quedar pendientes. Se omitirán ${omitted} cuentas no elegibles.`,
      )
    ) {
      setBusy(false);
      return;
    }
    const succeeded: string[] = [];
    for (const account of eligible) {
      if (!account.id) continue;
      try {
        const result =
          action === "paid"
            ? await updateBillingStatementStatus(account.id, "paid")
            : await deleteBillingstatement(account.id);
        if (result.success) succeeded.push(account.id);
      } catch {
        /* Keep failed accounts selected for retry. */
      }
    }
    const failed = eligible.length - succeeded.length;
    setAccounts((current) =>
      action === "delete"
        ? current.filter((item) => !item.id || !succeeded.includes(item.id))
        : current.map((item) =>
            item.id && succeeded.includes(item.id)
              ? { ...item, status: "paid" }
              : item,
          ),
    );
    setSelected((current) => current.filter((id) => !succeeded.includes(id)));
    setSummary(
      `${succeeded.length} ${action === "paid" ? (succeeded.length === 1 ? "actualizada" : "actualizadas") : succeeded.length === 1 ? "eliminada" : "eliminadas"}; ${failed} ${failed === 1 ? "fallida" : "fallidas"}; ${omitted} ${omitted === 1 ? "omitida" : "omitidas"} por no ser elegibles. Las fallidas siguen seleccionadas para reintentar.`,
    );
    setBusy(false);
  }

  if (loading)
    return (
      <div
        role="status"
        aria-label="Cargando cuentas"
        className="space-y-stc-group"
      >
        <div className="skeleton rounded h-12 w-full" />
        <div className="skeleton rounded h-36 w-full" />
        <div className="skeleton rounded h-36 w-full" />
      </div>
    );
  if (error)
    return (
      <p role="alert" className="alert alert-error">
        {error}
      </p>
    );

  const invalidRange = Boolean(from && to && from > to);
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const filtered = accounts.filter((account) => {
    // Keep an open editor mounted if saving changes its status or payment date.
    if (account.id && account.id === expanded) return true;
    if (status !== "all" && account.status !== status) return false;
    if (normalizedQuery && !account.client.name.toLocaleLowerCase("es").includes(normalizedQuery)) return false;
    // Date validation is expensive across thousands of rows; only run it for active date filters.
    if (from || to) {
      const parsed = parseBillingDateForCalendar(account.payDate);
      const civil = parsed.ok ? calendarDateToCivil(parsed.value) : null;
      if (!civil?.ok || (from && civil.value < from) || (to && civil.value > to)) return false;
    }
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = invalidRange
    ? []
    : filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const locked = busy || expanded !== null;
  return (
    <div className="w-full space-y-5">
      <fieldset
        disabled={locked}
        className="gap-stc-group bg-stc-bg grid rounded-2xl border border-[var(--color-stc-divider)] p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4"
      >
        <legend className="text-stc-label px-2 font-semibold text-[var(--color-stc-filter-title)]">
          Filtros
        </legend>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="billing-search"
            className="text-stc-label font-medium"
          >
            Buscar cliente
          </label>
          <input
            id="billing-search"
            className="input border-stc-border bg-stc-field text-stc-text hover:border-stc-focus focus-visible:border-stc-focus min-h-12 w-full rounded-2xl border outline-0"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="billing-status"
            className="text-stc-label font-medium"
          >
            Estado
          </label>
          <SelectField id="billing-status" value={status} onChange={(value) => { setStatus(value); setPage(0); }} options={[{ value: "all", label: "Todos" }, { value: "pending", label: "Pendiente" }, { value: "paid", label: "Pagada" }]} />
        </div>
        <DateField
          id="billing-from"
          label="Fecha prevista de pago desde"
          value={from}
          disabled={locked}
          onChange={(value) => {
            setFrom(value);
            setPage(0);
          }}
        />
        <DateField
          id="billing-to"
          label="Fecha prevista de pago hasta"
          value={to}
          disabled={locked}
          onChange={(value) => {
            setTo(value);
            setPage(0);
          }}
        />
      </fieldset>
      {invalidRange && (
        <p role="alert">
          La fecha inicial debe ser anterior o igual a la fecha final.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base-content/70 text-stc-label mr-auto">
          {selected.length} seleccionadas
        </span>
        <button
          type="button"
          className="btn btn-outline min-h-11 rounded-xl border"
          disabled={locked || !visible.some((item) => item.id)}
          onClick={() =>
            setSelected((current) =>
              Array.from(
                new Set([
                  ...current,
                  ...visible.flatMap((item) => (item.id ? [item.id] : [])),
                ]),
              ),
            )
          }
        >
          Seleccionar página
        </button>
        <button
          type="button"
          className="btn btn-ghost min-h-11 rounded-xl border"
          disabled={locked || !selected.length}
          onClick={() => setSelected([])}
        >
          Limpiar selección
        </button>
        <button
          type="button"
          className="btn btn-primary min-h-11 rounded-xl border"
          disabled={locked || !selected.length}
          onClick={() => void batch("paid")}
        >
          Marcar seleccionadas como pagadas
        </button>
        <button
          type="button"
          className="min-h-11 rounded-xl border border-transparent px-4 font-medium text-stc-text outline-none hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover disabled:cursor-not-allowed disabled:opacity-50"
          disabled={locked || !selected.length}
          onClick={() => void batch("delete")}
        >
          Eliminar seleccionadas
        </button>
      </div>
      <p className="text-base-content/70 text-stc-label">
        Pulsa para abrir; mantén pulsado para seleccionar.
      </p>
      {summary && (
        <p role="status" className="rounded-box bg-base-200 p-4">
          {summary}
        </p>
      )}
      {visible.length ? (
        <ul aria-label="Cuentas de cobro" className="space-y-3">
          {visible.map((account) => {
            const date = formatBillingDate(account.payDate);
            const id = account.id;
            const isSelected = Boolean(id && selected.includes(id));
            const isOpen = expanded === id;
            return (
              <li
                key={id}
                className={`space-y-stc-group rounded-2xl border p-4 sm:p-5 ${isSelected ? "bg-stc-bg/50 border-[var(--color-stc-accent)]" : "bg-stc-bg border-[var(--color-stc-divider)]"}`}
                onPointerDown={(event) => {
                  held.current = false;
                  if (
                    event.pointerType !== "touch" ||
                    !id ||
                    locked ||
                    ((event.target as HTMLElement).closest(
                      "button, a, input, select, textarea, [data-billing-editor]",
                    ) &&
                      !(event.target as HTMLElement).closest(
                        "[data-billing-trigger]",
                      ))
                  )
                    return;
                  cancelHold();
                  touchStart.current = { x: event.clientX, y: event.clientY };
                  hold.current = setTimeout(() => {
                    held.current = true;
                    toggle(id);
                    hold.current = null;
                  }, HOLD_MS);
                }}
                onPointerMove={(event) => {
                  if (
                    touchStart.current &&
                    (Math.abs(event.clientX - touchStart.current.x) > 10 ||
                      Math.abs(event.clientY - touchStart.current.y) > 10)
                  )
                    cancelHold();
                }}
                onPointerUp={cancelHold}
                onPointerCancel={cancelHold}
                onContextMenu={(event) => {
                  if (touchStart.current) event.preventDefault();
                }}
                onClick={(event) => {
                  if (held.current) {
                    held.current = false;
                    event.preventDefault();
                    return;
                  }
                  if (
                    !id ||
                    busy ||
                    (event.target as HTMLElement).closest(
                      "button, a, input, select, textarea, [data-billing-editor]",
                    )
                  )
                    return;
                  toggleEditor(id);
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2>
                      <button
                        type="button"
                        data-billing-trigger
                        className="focus-visible:border-stc-focus focus-visible:bg-stc-field flex min-h-11 items-center gap-2 rounded-md border border-transparent text-left text-lg font-semibold focus-visible:outline-none"
                        aria-label={`${isOpen ? "Cerrar cuenta de" : "Abrir cuenta de"} ${account.client.name}`}
                        aria-expanded={isOpen}
                        disabled={busy || !id}
                        onClick={() => {
                          if (held.current) {
                            held.current = false;
                            return;
                          }
                          if (id) toggleEditor(id);
                        }}
                      >
                        <span className="wrap-break-words">
                          {account.client.name}
                        </span>
                        <ChevronDown
                          size={18}
                          aria-hidden="true"
                          className={`shrink-0 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </h2>
                    <p className="text-base-content/70 wrap-break-words text-stc-label mt-1">
                      Acreedor: {account.creditor.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${account.status === "paid" ? "bg-[var(--color-stc-paid-surface)] text-[var(--color-stc-paid-text)]" : "bg-[var(--color-stc-pending-surface)] text-[var(--color-stc-warning)]"}`}
                    >
                      {account.status === "paid" ? "Pagada" : "Pendiente"}
                    </span>
                    <button
                      type="button"
                      className={`btn not-[]:min-h-11 rounded-xl border-0 ${isSelected ? "btn-primary" : ""}`}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? "Deseleccionar" : "Seleccionar"} cuenta de ${account.client.name}`}
                      disabled={!id || locked}
                      onClick={() => {
                        if (id) toggle(id);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-[var(--color-stc-selected-dot)] shadow-[0_0_8px_var(--color-stc-accent)]" : "border border-current"}`}
                      />
                      {isSelected ? "" : ""}
                    </button>
                  </div>
                </div>
                <dl className="text-stc-label flex flex-wrap gap-x-10 gap-y-3">
                  <div>
                    <dt className="text-base-content/70">
                      Fecha prevista de pago
                    </dt>
                    <dd className="mt-1">
                      {date.ok ? date.value : "Fecha no válida"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-base-content/70">Valor total</dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      ${(account.amount ?? 0).toLocaleString("es-CO")}
                    </dd>
                  </div>
                </dl>
                <div className="border-base-300 flex flex-wrap items-center gap-2 border-t pt-4">
                  {account.status === "pending" && (
                    <button
                      type="button"
                      className="btn btn-primary min-h-11 rounded-xl border"
                      disabled={locked}
                      onClick={() => void markPaid(account)}
                    >
                      Marcar pagada
                    </button>
                  )}
                  <button
                    type="button"
                    className={ICON_ACTION_CLASS}
                    disabled={locked || account.status !== "pending"}
                    aria-label={`Eliminar cuenta de ${account.client.name}`}
                    onClick={() => void remove(account)}
                  >
                    <Trash size={18} aria-hidden="true" />
                  </button>
                  {id && pdfBlocked.includes(id) ? (
                    <span role="status">
                      Actualiza la cuenta para preparar el PDF.
                    </span>
                  ) : (
                    <DownloadPDFButton
                      key={id ? (pdfVersions[id] ?? 0) : 0}
                      data={account}
                    />
                  )}
                </div>
                {isOpen && id && (
                  <div
                    data-billing-editor
                    className="border-base-300 border-t pt-5"
                  >
                    <UpdateBillingStatementForm
                      id={id}
                      onUpdated={(updated) =>
                        setAccounts((current) =>
                          current.map((item) =>
                            item.id === id ? updated : item,
                          ),
                        )
                      }
                      onPdfInvalidated={() =>
                        setPdfVersions((current) => ({
                          ...current,
                          [id]: (current[id] ?? 0) + 1,
                        }))
                      }
                      onItemsRefreshing={() =>
                        setPdfBlocked((current) =>
                          current.includes(id) ? current : [...current, id],
                        )
                      }
                      onItemsRefreshed={() => {
                        setPdfBlocked((current) =>
                          current.filter((item) => item !== id),
                        );
                        setPdfVersions((current) => ({
                          ...current,
                          [id]: (current[id] ?? 0) + 1,
                        }));
                      }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-box border-base-300 bg-base-100 text-base-content/70 border px-4 py-8 text-center">
          {accounts.length
            ? "No hay cuentas que coincidan con los filtros."
            : "No hay cuentas de cobro registradas."}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="btn btn-outline min-h-11 rounded-xl"
          disabled={locked || safePage === 0}
          onClick={() => setPage(safePage - 1)}
        >
          Anterior
        </button>
        <span className="text-base-content/70 text-stc-label">
          {safePage + 1} de {pageCount}
        </span>
        <button
          type="button"
          className="btn btn-outline min-h-11 rounded-xl"
          disabled={locked || safePage + 1 >= pageCount}
          onClick={() => setPage(safePage + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
