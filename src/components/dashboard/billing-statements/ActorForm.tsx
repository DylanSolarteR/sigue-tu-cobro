"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBillingStatement } from "@/actions/billing-statement.api";
import { getPendingItemsByClient } from "@/actions/billing-statement.item.api";
import { Button, Label } from "@/components/ui";
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
      <div className="space-y-2"><Label htmlFor="statement-client">Cliente</Label><select id="statement-client" value={client} disabled={saving} onChange={(event) => void changeClient(event.target.value)} className="w-full rounded-md border bg-background p-2"><option value="">Selecciona un cliente</option>{clientsList.filter((item) => item.id).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="statement-creditor">Acreedor</Label><select id="statement-creditor" value={creditor} disabled={saving} onChange={(event) => setCreditor(event.target.value)} className="w-full rounded-md border bg-background p-2"><option value="">Selecciona un acreedor</option>{creditorsList.filter((item) => item.id).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
      <fieldset disabled={saving || loading} className="space-y-3 rounded-md border p-4"><legend className="px-1">Ítems pendientes</legend>{!client ? <p>Selecciona un cliente para ver sus ítems.</p> : loading ? <p>Cargando ítems…</p> : loadFailed ? <Button type="button" variant="outline" onClick={() => void changeClient(client)}>Reintentar carga</Button> : items.length ? items.map((item) => <label key={item.id} className="flex items-center gap-3"><input type="checkbox" checked={selected.includes(item.id ?? "")} onChange={(event) => { if (!item.id) return; const id = item.id; setSelected((previous) => event.target.checked ? [...previous, id] : previous.filter((value) => value !== id)); }} /><span>{item.desc} · ${item.amount.toLocaleString("es-CO")}</span></label>) : <p>No hay ítems pendientes. <Link href="/dashboard/items" className="underline">Crear un ítem</Link></p>}
      <p className="text-sm">Total seleccionado: ${items.filter((item) => item.id && selected.includes(item.id)).reduce((sum, item) => sum + item.amount, 0).toLocaleString("es-CO")}</p></fieldset>
      <div className="space-y-2"><Label>Fecha de pago</Label><DatePicker date={date} setDate={setDate} /></div>
      {message && <p role="alert" className="text-sm text-red-400">{message}</p>}
      <Button type="submit" className="w-full" disabled={saving || loading || !selected.length}>{saving ? "Creando…" : "Crear cuenta de cobro"}</Button>
    </form>
  );
}
