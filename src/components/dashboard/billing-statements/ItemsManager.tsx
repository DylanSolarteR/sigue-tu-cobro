"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import MoneyInput from "@/components/dashboard/MoneyInput";
import { createPendingItem, deleteBillingStatementItem, getPendingItemsByClient, updateBillingStatementItem } from "@/actions/billing-statement.item.api";
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
    if (!clientId) { setLoading(false); return; }
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
    if (!client || !description.trim() || !Number.isSafeInteger(Number(amount)) || Number(amount) <= 0 || Number(amount) > 2147483647) {
      setMessage("Seleccione un cliente e ingrese una descripción y un valor entero mayor que cero.");
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
  const fieldClass = "input min-h-12 w-full rounded-2xl border border-stc-border bg-stc-field text-base text-stc-text outline-none hover:border-stc-focus focus:border-stc-focus focus:bg-stc-field-focus";
  const buttonClass = "min-h-11 rounded-xl border border-stc-border px-4 font-medium text-stc-text outline-none hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 text-stc-text sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">Ítems pendientes</h1>
        <p className="mt-2 max-w-2xl text-stc-label leading-6 text-stc-muted">Registra los conceptos que después incluirás en una cuenta de cobro.</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="item-client" className="font-medium">Cliente</label>
          <select id="item-client" value={client} disabled={saving} onChange={(event) => { const id = event.target.value; selectedClient.current = id; setClient(id); setMessage(""); void load(id); }} className={`${fieldClass} select`}>
            <option value="">Selecciona un cliente</option>
            {clients.filter((actor) => actor.id).map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}
          </select>
          {clients.length === 0 && <p className="text-stc-label leading-6 text-stc-muted">Crea un cliente antes de registrar ítems. <Link className="inline-block min-h-11 content-center rounded-md font-medium text-stc-accent underline underline-offset-4 outline-none focus-visible:bg-stc-hover" href="/dashboard/clientes/crear">Crear cliente</Link></p>}
        </div>

          <form onSubmit={(event) => void create(event)} className="space-y-5 rounded-2xl border border-stc-border bg-stc-surface p-4 sm:p-6">
            <div><h2 className="text-lg font-semibold">Nuevo ítem</h2><p className="mt-1 text-stc-label leading-6 text-stc-muted">Agrega un concepto y su valor para el cliente seleccionado.</p></div>
            <div className="space-y-2"><label htmlFor="item-description" className="font-medium">Descripción</label><input className={fieldClass} id="item-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={150} required /></div>
            <div className="space-y-2 [&_div:focus-within]:border-stc-focus [&_div:focus-within]:bg-stc-field-focus"><label htmlFor="item-amount" className="font-medium">Valor</label><MoneyInput id="item-amount" value={amount} onChange={setAmount} required /></div>
            <button className="min-h-12 w-full rounded-xl border border-transparent bg-stc-accent px-5 font-semibold text-stc-ink outline-none hover:bg-[var(--color-stc-accent-hover)] focus-visible:border-stc-focus focus-visible:bg-[var(--color-stc-accent-focus)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" type="submit" disabled={!client || saving}>{saving ? "Creando…" : "Crear ítem"}</button>
            {message && <p role="status" className="text-stc-label leading-6 text-stc-muted">{message}</p>}
          </form>
        </div>

        <section aria-live="polite" className="min-w-0 space-y-stc-group">
          <div><h2 className="text-lg font-semibold">Pendientes del cliente</h2><p className="mt-1 text-stc-label leading-6 text-stc-muted">Consulta, edita o elimina los conceptos pendientes.</p></div>
          {client && !loading && !loadFailed && <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-stc-border pb-4"><div className="min-w-0"><p className="break-words font-medium">{clientName}</p><p className="text-stc-label text-stc-muted">{items.length} {items.length === 1 ? "ítem" : "ítems"}</p></div><p className="font-semibold tabular-nums"><span className="mr-2 text-stc-label font-normal text-stc-muted">Total</span>${new Intl.NumberFormat("es-CO").format(total)}</p></div>}
          {!client ? <p className="rounded-2xl border border-stc-border px-5 py-6 text-stc-label leading-6 text-stc-muted">Selecciona un cliente para ver sus ítems pendientes.</p> : loading ? <div role="status" aria-label="Cargando items pendientes" className="space-y-2"><div className="skeleton h-32 w-full" /><div className="skeleton h-32 w-full" /></div> : loadFailed ? <button className={buttonClass} type="button" onClick={() => { setMessage(""); void load(client); }}>Reintentar carga</button> : items.length ? <ul className="space-y-3">{items.map((item) => <li key={item.id}><PendingItem item={item} onChange={async () => { if (selectedClient.current === client) await load(client); }} /></li>)}</ul> : <p className="rounded-2xl border border-stc-border px-5 py-6 text-stc-label leading-6 text-stc-muted">Este cliente no tiene ítems pendientes.</p>}
        </section>
      </div>
    </div>
  );
}

function PendingItem({ item, onChange }: { item: billing_statement_item; onChange: () => Promise<void> }) {
  const [description, setDescription] = useState(item.desc);
  const [amount, setAmount] = useState(String(item.amount));
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!item.id || !description.trim() || !Number.isSafeInteger(value) || value <= 0 || value > 2147483647) { setMessage("Ingrese una descripción y un valor entero mayor que cero."); return; }
    setBusy(true);
    const result = await updateBillingStatementItem(item.id, description, value);
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
    setBusy(false); setConfirming(false);
  }
  const fieldClass = "input min-h-12 w-full rounded-2xl border border-stc-border bg-stc-field text-base text-stc-text outline-none hover:border-stc-focus focus:border-stc-focus focus:bg-stc-field-focus";
  const buttonClass = "min-h-11 rounded-xl border border-stc-border px-4 font-medium text-stc-text outline-none hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover disabled:cursor-not-allowed disabled:opacity-50";
  return <div className="rounded-2xl border border-stc-border bg-stc-surface">
    <button type="button" aria-expanded={expanded} aria-controls={`pending-details-${item.id}`} onClick={() => setExpanded(!expanded)} className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left outline-none hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover">
      <span className="min-w-0 flex-1 break-words font-medium">{item.desc}</span>
      <span className="shrink-0 tabular-nums">${new Intl.NumberFormat("es-CO").format(Number(item.amount))}</span>
      <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 ${expanded ? "rotate-180" : ""}`} />
    </button>
    {expanded && <form id={`pending-details-${item.id}`} onSubmit={(event) => void save(event)} className="space-y-stc-group border-t border-stc-border p-4 sm:p-5">
    <div className="grid gap-stc-group sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
      <div className="min-w-0 space-y-2"><label className="block font-medium" htmlFor={`pending-desc-${item.id}`}>Descripción de <span className="break-words">{item.desc}</span></label><input className={fieldClass} id={`pending-desc-${item.id}`} value={description} maxLength={150} required disabled={busy} onChange={(event) => setDescription(event.target.value)} /></div>
      <div className="min-w-0 space-y-2 [&_div:focus-within]:border-stc-focus [&_div:focus-within]:bg-stc-field-focus"><label className="block font-medium" htmlFor={`pending-amount-${item.id}`}>Valor de <span className="break-words">{item.desc}</span></label><MoneyInput id={`pending-amount-${item.id}`} value={amount} onChange={setAmount} required disabled={busy} /></div>
    </div>
    {message && <p role="status" className="text-stc-label leading-6 text-stc-muted">{message}</p>}
    <div className="flex flex-wrap gap-2"><button className={buttonClass} type="submit" disabled={busy || (description === item.desc && amount === String(item.amount))}>Guardar ítem</button>{confirming ? <><button className="min-h-11 rounded-xl border border-[var(--color-stc-danger)] px-4 font-medium text-[var(--color-stc-danger)] outline-none hover:bg-[var(--color-stc-danger-surface)] focus-visible:bg-[var(--color-stc-danger-surface)]" type="button" disabled={busy} onClick={() => void remove()}>Confirmar eliminación</button><button className={buttonClass} type="button" disabled={busy} onClick={() => setConfirming(false)}>Cancelar</button></> : <button className={buttonClass} type="button" disabled={busy} onClick={() => setConfirming(true)}>Eliminar ítem</button>}</div>
  </form>}
  </div>;
}
