"use client";

import SelectField from "@/components/dashboard/SelectField";
import ItemPagination, { ITEM_PAGE_SIZE } from "@/components/dashboard/ItemPagination";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBillingStatement } from "@/actions/billing-statement.api";
import { getPendingItemsByClient } from "@/actions/billing-statement.item.api";
import { DatePicker } from "@/components/DatePicker";
import type { Actor } from "@/types/actor";
import type { billing_statement_item } from "@/types/billing-statement";
import { calendarDateToCivil } from "@/lib/billing-date";

export default function ActorForm({
  clientsList,
  creditorsList,
}: {
  clientsList: Actor[];
  creditorsList: Actor[];
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [client, setClient] = useState("");
  const [creditor, setCreditor] = useState("");
  const [date, setDate] = useState(new Date());
  const [items, setItems] = useState<billing_statement_item[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const sequence = useRef(0);

  async function changeClient(clientId: string) {
    setClient(clientId);
    setPage(0);
    setItems([]);
    setSelected([]);
    setMessage("");
    setLoadFailed(false);
    const request = ++sequence.current;
    if (!clientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getPendingItemsByClient(clientId);
    if (request !== sequence.current) return;
    setItems(result.data ?? []);
    setLoadFailed(!result.success);
    if (!result.success) setMessage(result.message);
    setLoading(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const civilDate = calendarDateToCivil(date);
    if (!client || !creditor || !selected.length || !civilDate.ok) {
      setMessage(
        "Seleccione cliente, acreedor, fecha válida y al menos un ítem pendiente.",
      );
      return;
    }
    setSaving(true);
    setMessage("");
    const result = await createBillingStatement({
      client_id: client,
      creditor_id: creditor,
      payDate: civilDate.value,
      item_ids: selected,
    });
    if (result.success && result.data)
      router.push(`/dashboard/cuentas-cobro/editar/${result.data.id}`);
    else setMessage(result.message);
    setSaving(false);
  }

  const safePage = Math.min(page, Math.max(0, Math.ceil(items.length / ITEM_PAGE_SIZE) - 1));
  const visibleItems = items.slice(safePage * ITEM_PAGE_SIZE, (safePage + 1) * ITEM_PAGE_SIZE);
  const total = items
    .filter((item) => item.id && selected.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="text-stc-text space-y-6"
    >
      <div className="gap-stc-group grid sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0 space-y-2">
          <label
            htmlFor="statement-client"
            className="text-stc-label block font-medium text-[var(--color-stc-label)]"
          >
            Cliente
          </label>
          <SelectField id="statement-client" value={client} disabled={saving} onChange={(value) => void changeClient(value)} placeholder="Selecciona un cliente" searchable searchLabel="Buscar cliente" options={[{ value: "", label: "Selecciona un cliente" }, ...clientsList.flatMap((item) => item.id ? [{ value: item.id, label: item.name }] : [])]} />
        </div>
        <div className="min-w-0 space-y-2">
          <label
            htmlFor="statement-creditor"
            className="text-stc-label block font-medium text-[var(--color-stc-label)]"
          >
            Acreedor
          </label>
          <SelectField id="statement-creditor" value={creditor} disabled={saving} onChange={setCreditor} placeholder="Selecciona un acreedor" searchable searchLabel="Buscar acreedor" options={[{ value: "", label: "Selecciona un acreedor" }, ...creditorsList.flatMap((item) => item.id ? [{ value: item.id, label: item.name }] : [])]} />
        </div>
        <DatePicker date={date} setDate={setDate} />
      </div>
      <fieldset
        disabled={saving || loading}
        className="border-stc-divider min-w-0 space-y-4 border-t pt-5"
      >
        <legend className="sr-only">Ítems pendientes</legend>
        <h3 aria-hidden="true" className="text-lg font-semibold">
          Ítems pendientes
        </h3>
        {!client ? (
          <p className="text-stc-label text-stc-muted leading-6">
            Selecciona un cliente para ver sus ítems.
          </p>
        ) : loading ? (
          <div
            role="status"
            aria-label="Cargando conceptos pendientes"
            className="space-y-3"
          >
            <div className="skeleton rounded h-12 w-full" />
            <div className="skeleton rounded h-12 w-full" />
          </div>
        ) : loadFailed ? (
          <button
            type="button"
            className="border-stc-border text-stc-label hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover min-h-11 rounded-xl border px-4 font-medium"
            onClick={() => void changeClient(client)}
          >
            Reintentar carga
          </button>
        ) : items.length ? (
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <label
                key={item.id}
                className="border-stc-border bg-stc-field hover:border-stc-focus focus-within:border-stc-focus flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary shrink-0"
                  checked={selected.includes(item.id ?? "")}
                  onChange={(event) => {
                    if (!item.id) return;
                    const id = item.id;
                    setSelected((previous) =>
                      event.target.checked
                        ? [...previous, id]
                        : previous.filter((value) => value !== id),
                    );
                  }}
                />
                <span className="text-stc-label min-w-0 flex-1 break-words">
                  {item.desc} ·{" "}
                  <span className="tabular-nums">
                    ${item.amount.toLocaleString("es-CO")}
                  </span>
                </span>
              </label>
            ))}
            <ItemPagination count={items.length} page={safePage} onChange={setPage} />
            <p aria-live="polite" className="text-stc-label text-stc-muted">{selected.length} seleccionados de {items.length} ítems</p>
          </div>
        ) : (
          <p className="text-stc-label text-stc-muted leading-6">
            No hay ítems pendientes.{" "}
            <Link
              href="/dashboard/items"
              className="text-stc-accent font-medium underline underline-offset-4"
            >
              Crear un ítem
            </Link>
          </p>
        )}
        <p className="border-stc-divider text-stc-label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-4 font-medium">
          <span>Total seleccionado:</span>{" "}
          <strong className="text-base tabular-nums">
            ${total.toLocaleString("es-CO")}
          </strong>
        </p>
      </fieldset>
      {message && (
        <p role="alert" className="alert alert-error text-sm">
          {message}
        </p>
      )}
      <button
        type="submit"
        className="bg-stc-accent text-stc-ink hover:bg-stc-accent-hover focus-visible:border-stc-focus focus-visible:bg-stc-accent-focus min-h-12 w-full rounded-xl border border-transparent px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={saving || loading || !selected.length}
      >
        {saving ? "Creando…" : "Crear cuenta de cobro"}
      </button>
    </form>
  );
}
