"use client";

import { useRef, useState } from "react";
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

  return (
    <div className="w-full space-y-8 p-4 sm:p-6">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Ítems pendientes</h1><p className="mt-2 text-sm text-base-content/70">Registra los conceptos que después incluirás en una cuenta de cobro.</p></div>
      <div className="max-w-xl space-y-2">
        <label htmlFor="item-client" className="font-medium">Cliente</label>
        <select id="item-client" value={client} disabled={saving} onChange={(event) => { const id = event.target.value; selectedClient.current = id; setClient(id); setMessage(""); void load(id); }} className="select w-full">
          <option value="">Selecciona un cliente</option>
          {clients.filter((actor) => actor.id).map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}
        </select>
        {clients.length === 0 && <p className="text-sm">Crea un cliente antes de registrar ítems.</p>}
      </div>
      <form onSubmit={(event) => void create(event)} className="max-w-3xl space-y-4 rounded-box border border-base-300 bg-base-100 p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Nuevo ítem</h2>
        <div className="space-y-2"><label htmlFor="item-description" className="font-medium">Descripción</label><input className="input w-full" id="item-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={150} required /></div>
        <div className="space-y-2"><label htmlFor="item-amount" className="font-medium">Valor</label><input className="input w-full" id="item-amount" type="number" min="1" max="2147483647" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
        <button className="btn btn-primary w-full sm:w-auto" type="submit" disabled={!client || saving}>{saving ? "Creando…" : "Crear ítem"}</button>
      </form>
      {message && <p role="status" className="text-sm">{message}</p>}
      <section aria-live="polite" className="max-w-3xl"><h2 className="mb-3 text-lg font-semibold">Pendientes del cliente</h2>{!client ? <p className="text-sm text-base-content/70">Selecciona un cliente para ver sus ítems pendientes.</p> : loading ? <div role="status" aria-label="Cargando items pendientes" className="space-y-2"><div className="skeleton h-32 w-full" /><div className="skeleton h-32 w-full" /></div> : loadFailed ? <button className="btn btn-outline min-h-11" type="button" onClick={() => { setMessage(""); void load(client); }}>Reintentar carga</button> : items.length ? <ul className="space-y-2">{items.map((item) => <li key={item.id}><PendingItem item={item} onChange={async () => { if (selectedClient.current === client) await load(client); }} /></li>)}</ul> : <p className="text-sm text-base-content/70">Este cliente no tiene ítems pendientes.</p>}</section>
    </div>
  );
}

function PendingItem({ item, onChange }: { item: billing_statement_item; onChange: () => Promise<void> }) {
  const [description, setDescription] = useState(item.desc);
  const [amount, setAmount] = useState(String(item.amount));
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
  return <form onSubmit={(event) => void save(event)} className="space-y-3 rounded-box border border-base-300 bg-base-100 p-4">
    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><label className="font-medium" htmlFor={`pending-desc-${item.id}`}>Descripción de {item.desc}</label><input className="input w-full" id={`pending-desc-${item.id}`} value={description} maxLength={150} required disabled={busy} onChange={(event) => setDescription(event.target.value)} /></div><div className="space-y-2"><label className="font-medium" htmlFor={`pending-amount-${item.id}`}>Valor de {item.desc}</label><input className="input w-full" id={`pending-amount-${item.id}`} type="number" min="1" max="2147483647" step="1" required value={amount} disabled={busy} onChange={(event) => setAmount(event.target.value)} /></div></div>
    {message && <p role="status">{message}</p>}
    <div className="flex flex-wrap gap-2"><button className="btn btn-primary min-h-11" type="submit" disabled={busy || (description === item.desc && amount === String(item.amount))}>Guardar ítem</button>{confirming ? <><button className="btn btn-error min-h-11" type="button" disabled={busy} onClick={() => void remove()}>Confirmar eliminación</button><button className="btn btn-outline min-h-11" type="button" onClick={() => setConfirming(false)}>Cancelar</button></> : <button className="btn btn-outline min-h-11" type="button" disabled={busy} onClick={() => setConfirming(true)}>Eliminar ítem</button>}</div>
  </form>;
}
