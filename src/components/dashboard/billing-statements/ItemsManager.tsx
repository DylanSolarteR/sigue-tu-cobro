"use client";

import SelectField from "@/components/dashboard/SelectField";
import ItemPagination, { ITEM_PAGE_SIZE } from "@/components/dashboard/ItemPagination";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import MoneyInput from "@/components/dashboard/MoneyInput";
import {
  createPendingItem,
  deleteBillingStatementItem,
  getPendingItemsByClient,
  updateBillingStatementItem,
} from "@/actions/billing-statement.item.api";
import type { Actor } from "@/types/actor";
import type { billing_statement_item } from "@/types/billing-statement";

export default function ItemsManager({ clients }: { clients: Actor[] }) {
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState<billing_statement_item[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const sequence = useRef(0);
  const selectedClient = useRef("");

  async function load(clientId: string) {
    const request = ++sequence.current;
    setItems([]);
    setLoadFailed(false);
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

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !client ||
      !description.trim() ||
      !Number.isSafeInteger(Number(amount)) ||
      Number(amount) <= 0 ||
      Number(amount) > 2147483647
    ) {
      setMessage(
        "Seleccione un cliente e ingrese una descripción y un valor entero mayor que cero.",
      );
      return;
    }
    setSaving(true);
    const result = await createPendingItem(client, description, Number(amount));
    setMessage(result.message);
    if (result.success) {
      setDescription("");
      setAmount("");
      await load(client);
    }
    setSaving(false);
  }

  const clientName = clients.find((actor) => actor.id === client)?.name;
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const fieldClass =
    "input min-h-12 w-full rounded-2xl border border-stc-border bg-stc-field text-base text-stc-text outline-none hover:border-stc-focus focus:border-stc-focus";
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, Math.max(0, Math.ceil(items.length / ITEM_PAGE_SIZE) - 1));
  const visibleItems = items.slice(safePage * ITEM_PAGE_SIZE, (safePage + 1) * ITEM_PAGE_SIZE);
  const buttonClass =
    "min-h-11 rounded-xl border border-stc-border px-4 font-medium text-stc-text outline-none hover:bg-stc-hover focus-visible:border-stc-focus disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="text-stc-text flex w-full min-w-0 flex-col gap-8 rounded-2xl">
      <header className="bg-stc-surface rounded-2xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Ítems pendientes</h1>
        <p className="text-stc-label text-stc-muted mt-2 max-w-2xl leading-6">
          Registra los conceptos que después incluirás en una cuenta de cobro.
        </p>
      </header>

      <div className="bg-stc-surface grid items-start gap-8 rounded-2xl px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div className="contents">
          <div className="flex flex-col gap-2">
            <label htmlFor="item-client" className="font-medium">
              Cliente
            </label>
            <SelectField id="item-client" value={client} disabled={saving} placeholder="Selecciona un cliente" searchable searchLabel="Buscar cliente" onChange={(id) => { selectedClient.current = id; setPage(0); setClient(id); setMessage(""); void load(id); }} options={[{ value: "", label: "Selecciona un cliente" }, ...clients.flatMap((actor) => actor.id ? [{ value: actor.id, label: actor.name }] : [])]} />
            {clients.length === 0 && (
              <p className="text-stc-label text-stc-muted leading-6">
                Crea un cliente antes de registrar ítems.{" "}
                <Link
                  className="text-stc-accent focus-visible:outline-stc-focus inline-block min-h-11 content-center rounded-md font-medium underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
                  href="/dashboard/clientes/crear"
                >
                  Crear cliente
                </Link>
              </p>
            )}
          </div>

          <form
            onSubmit={(event) => void create(event)}
            className="border-stc-border bg-stc-bg space-y-5 rounded-2xl border p-4 sm:p-6 lg:col-start-1 lg:row-start-2"
          >
            <div>
              <h2 className="text-lg font-semibold">Nuevo ítem</h2>
              <p className="text-stc-label text-stc-muted mt-1 leading-6">
                Agrega un concepto y su valor para el cliente seleccionado.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="item-description" className="font-medium">
                Descripción
              </label>
              <input
                className={fieldClass}
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={150}
                required
              />
            </div>
            <div className="[&_div:focus-within]:border-stc-focus space-y-2">
              <label htmlFor="item-amount" className="font-medium">
                Valor
              </label>
              <MoneyInput
                id="item-amount"
                value={amount}
                onChange={setAmount}
                required
              />
            </div>
            <button
              className="bg-stc-accent text-stc-ink focus-visible:border-stc-focus min-h-12 w-full rounded-xl border border-transparent px-5 font-semibold outline-none hover:bg-[var(--color-stc-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              type="submit"
              disabled={!client || saving}
            >
              {saving ? "Creando…" : "Crear ítem"}
            </button>
            {message && (
              <p
                role="status"
                className="text-stc-label text-stc-muted leading-6"
              >
                {message}
              </p>
            )}
          </form>
        </div>

        <section aria-live="polite" className="space-y-stc-group border-stc-border bg-stc-bg min-w-0 rounded-2xl border p-4 sm:p-6 lg:col-start-2 lg:row-start-2">
          <div>
            <h2 className="text-lg font-semibold">Pendientes del cliente</h2>
            <p className="text-stc-label text-stc-muted mt-1 leading-6">
              Consulta, edita o elimina los conceptos pendientes.
            </p>
          </div>
          {client && !loading && !loadFailed && (
            <div className="border-stc-border flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b pb-4">
              <div className="min-w-0">
                <p className="font-medium break-words">{clientName}</p>
                <p className="text-stc-label text-stc-muted">
                  {items.length} {items.length === 1 ? "ítem" : "ítems"}
                </p>
              </div>
              <p className="font-semibold tabular-nums">
                <span className="text-stc-label text-stc-muted mr-2 font-normal">
                  Total
                </span>
                ${new Intl.NumberFormat("es-CO").format(total)}
              </p>
            </div>
          )}
          {!client ? (
            <p className="border-stc-border text-stc-label text-stc-muted rounded-2xl border px-5 py-6 leading-6">
              Selecciona un cliente para ver sus ítems pendientes.
            </p>
          ) : loading ? (
            <div
              role="status"
              aria-label="Cargando items pendientes"
              className="space-y-2"
            >
              <div className="skeleton rounded h-32 w-full" />
              <div className="skeleton rounded h-32 w-full" />
            </div>
          ) : loadFailed ? (
            <button
              className={buttonClass}
              type="button"
              onClick={() => {
                setMessage("");
                void load(client);
              }}
            >
              Reintentar carga
            </button>
          ) : items.length ? (
            <div>
            <ul className="space-y-3">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  <PendingItem
                    item={item}
                    onChange={async () => {
                      if (selectedClient.current === client) await load(client);
                    }}
                  />
                </li>
              ))}
            </ul>
            <ItemPagination count={items.length} page={safePage} onChange={setPage} />
            </div>
          ) : (
            <p className="border-stc-border text-stc-label text-stc-muted rounded-2xl border px-5 py-6 leading-6">
              Este cliente no tiene ítems pendientes.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function PendingItem({
  item,
  onChange,
}: {
  item: billing_statement_item;
  onChange: () => Promise<void>;
}) {
  const [description, setDescription] = useState(item.desc);
  const [amount, setAmount] = useState(String(item.amount));
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (
      !item.id ||
      !description.trim() ||
      !Number.isSafeInteger(value) ||
      value <= 0 ||
      value > 2147483647
    ) {
      setMessage("Ingrese una descripción y un valor entero mayor que cero.");
      return;
    }
    setBusy(true);
    const result = await updateBillingStatementItem(
      item.id,
      description,
      value,
    );
    setMessage(result.message);
    if (result.success) await onChange();
    setBusy(false);
  }
  async function remove() {
    if (!item.id) return;
    setBusy(true);
    const result = await deleteBillingStatementItem(item.id);
    setMessage(result.message);
    if (result.success) await onChange();
    setBusy(false);
    setConfirming(false);
  }
  const fieldClass =
    "input min-h-12 w-full rounded-2xl border border-stc-border bg-stc-field text-base text-stc-text outline-none hover:border-stc-focus focus:border-stc-focus";
  const buttonClass =
    "min-h-11 rounded-xl border border-stc-border px-4 font-medium text-stc-text outline-none hover:bg-stc-hover focus-visible:border-stc-focus disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <div className="border-stc-border bg-stc-surface rounded-2xl border">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`pending-details-${item.id}`}
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-stc-hover focus-visible:border-stc-focus flex min-h-14 w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left outline-none"
      >
        <span className="min-w-0 flex-1 font-medium break-words">
          {item.desc}
        </span>
        <span className="shrink-0 tabular-nums">
          ${new Intl.NumberFormat("es-CO").format(Number(item.amount))}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <form
          id={`pending-details-${item.id}`}
          onSubmit={(event) => void save(event)}
          className="space-y-stc-group border-stc-border border-t p-4 sm:p-5"
        >
          <div className="gap-stc-group grid sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
            <div className="min-w-0 space-y-2">
              <label
                className="block font-medium"
                htmlFor={`pending-desc-${item.id}`}
              >
                Descripción<span className="sr-only"> de {item.desc}</span>
              </label>
              <input
                className={fieldClass}
                id={`pending-desc-${item.id}`}
                value={description}
                maxLength={150}
                required
                disabled={busy}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="[&_div:focus-within]:border-stc-focus min-w-0 space-y-2">
              <label
                className="block font-medium"
                htmlFor={`pending-amount-${item.id}`}
              >
                Valor<span className="sr-only"> de {item.desc}</span>
              </label>
              <MoneyInput
                id={`pending-amount-${item.id}`}
                value={amount}
                onChange={setAmount}
                required
                disabled={busy}
              />
            </div>
          </div>
          {message && (
            <p
              role="status"
              className="text-stc-label text-stc-muted leading-6"
            >
              {message}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className={buttonClass}
              type="submit"
              disabled={
                busy ||
                (description === item.desc && amount === String(item.amount))
              }
            >
              Guardar ítem
            </button>
            {confirming ? (
              <>
                <button
                  className="min-h-11 rounded-xl border border-[var(--color-stc-danger)] px-4 font-medium text-[var(--color-stc-danger)] outline-none hover:bg-[var(--color-stc-danger-surface)] focus-visible:border-stc-focus"
                  type="button"
                  disabled={busy}
                  onClick={() => void remove()}
                >
                  Confirmar eliminación
                </button>
                <button
                  className={buttonClass}
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                className={buttonClass}
                type="button"
                disabled={busy}
                onClick={() => setConfirming(true)}
              >
                Eliminar ítem
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
