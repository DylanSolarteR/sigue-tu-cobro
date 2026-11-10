"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBillingStatement } from "@/actions/billing-statement.api";
import { getPendingItemsByClient } from "@/actions/billing-statement.item.api";
import { DatePicker } from "@/components/DatePicker";
import type { Actor } from "@/types/actor";
import type { billing_statement_item } from "@/types/billing-statement";
import { calendarDateToCivil } from "@/lib/billing-date";

export default function ActorForm({ clientsList, creditorsList }: { clientsList: Actor[]; creditorsList: Actor[] }) {
  const router = useRouter();
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
    setClient(clientId); setItems([]); setSelected([]); setMessage(""); setLoadFailed(false);
    const request = ++sequence.current;
    if (!clientId) { setLoading(false); return; }
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
    if (!client || !creditor || !selected.length || !civilDate.ok) { setMessage("Seleccione cliente, acreedor, fecha válida y al menos un ítem pendiente."); return; }
    setSaving(true); setMessage("");
    const result = await createBillingStatement({ client_id: client, creditor_id: creditor, payDate: civilDate.value, item_ids: selected });
    if (result.success && result.data) router.push(`/dashboard/cuentas-cobro/editar/${result.data.id}`);
    else setMessage(result.message);
    setSaving(false);
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="statement-client" className="font-medium">Cliente</label><select id="statement-client" value={client} disabled={saving} onChange={(event) => void changeClient(event.target.value)} className="select w-full"><option value="">Selecciona un cliente</option>{clientsList.filter((item) => item.id).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
      <div className="space-y-2"><label htmlFor="statement-creditor" className="font-medium">Acreedor</label><select id="statement-creditor" value={creditor} disabled={saving} onChange={(event) => setCreditor(event.target.value)} className="select w-full"><option value="">Selecciona un acreedor</option>{creditorsList.filter((item) => item.id).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div></div>
      <fieldset disabled={saving || loading} className="space-y-3 rounded-box border border-base-300 p-4"><legend className="px-1 font-medium">Ítems pendientes</legend>{!client ? <p>Selecciona un cliente para ver sus ítems.</p> : loading ? <p>Cargando ítems…</p> : loadFailed ? <button type="button" className="btn btn-outline btn-sm" onClick={() => void changeClient(client)}>Reintentar carga</button> : items.length ? items.map((item) => <label key={item.id} className="flex items-center gap-3"><input type="checkbox" className="checkbox checkbox-primary" checked={selected.includes(item.id ?? "")} onChange={(event) => { if (!item.id) return; const id = item.id; setSelected((previous) => event.target.checked ? [...previous, id] : previous.filter((value) => value !== id)); }} /><span>{item.desc} · ${item.amount.toLocaleString("es-CO")}</span></label>) : <p>No hay ítems pendientes. <Link href="/dashboard/items" className="link link-primary">Crear un ítem</Link></p>}
      <p className="text-sm font-medium">Total seleccionado: ${items.filter((item) => item.id && selected.includes(item.id)).reduce((sum, item) => sum + item.amount, 0).toLocaleString("es-CO")}</p></fieldset>
      <div className="space-y-2"><p className="font-medium">Fecha de pago</p><DatePicker date={date} setDate={setDate} /></div>
      {message && <p role="alert" className="alert alert-error text-sm">{message}</p>}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving || loading || !selected.length}>{saving ? "Creando…" : "Crear cuenta de cobro"}</button>
    </form>
  );
}
