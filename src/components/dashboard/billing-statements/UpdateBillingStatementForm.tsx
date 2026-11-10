"use client";

import { useEffect, useState } from "react";
import { getBillingStatement, saveBillingStatement } from "@/actions/billing-statement.api";
import { getBillingStatementItems, updateBillingStatementItem } from "@/actions/billing-statement.item.api";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { DatePicker } from "@/components/DatePicker";
import Loading from "@/components/Loading";
import type { billing_statement, billing_statement_item } from "@/types/billing-statement";
import { calendarDateToCivil, parseBillingDateForCalendar } from "@/lib/billing-date";

export default function UpdateBillingStatementForm({ id }: { id: string }) {
  const [account, setAccount] = useState<billing_statement | null>(null);
  const [items, setItems] = useState<billing_statement_item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"pending" | "paid">("pending");
  const [date, setDate] = useState(new Date());
  const [extraInfo, setExtraInfo] = useState("");
  const [showItemAmount, setShowItemAmount] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const [result, itemResult] = await Promise.all([getBillingStatement(id), getBillingStatementItems(id)]);
      if (!active) return;
      if (!result.success || !result.data) { setMessage(result.message); setLoading(false); return; }
      if (!itemResult.success) { setMessage(itemResult.message); setLoading(false); return; }
      const parsedDate = parseBillingDateForCalendar(result.data.payDate);
      if (!parsedDate.ok) { setMessage("La fecha guardada no es válida."); setLoading(false); return; }
      setAccount(result.data); setItems(itemResult.data ?? []);
      setStatus(result.data.status === "paid" ? "paid" : "pending");
      setDate(parsedDate.value); setExtraInfo(result.data.extraInfo);
      setShowItemAmount(Boolean(result.data.showItemAmount)); setLoading(false);
    })();
    return () => { active = false; };
  }, [id]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const civilDate = calendarDateToCivil(date);
    if (!civilDate.ok) { setMessage("Selecciona una fecha válida."); return; }
    setSaving(true);
    const result = await saveBillingStatement({ id, status, extraInfo, payDate: civilDate.value, showItemAmount });
    setMessage(result.message);
    if (result.success) setAccount((current) => current ? { ...current, status, extraInfo, payDate: civilDate.value, showItemAmount } : current);
    setSaving(false);
  }
  async function editItem(itemId: string, desc: string, amount: number) {
    const result = await updateBillingStatementItem(itemId, desc, amount);
    setMessage(result.message);
    if (result.success) {
      const [accountResult, itemResult] = await Promise.all([getBillingStatement(id), getBillingStatementItems(id)]);
      if (accountResult.success && accountResult.data) setAccount(accountResult.data);
      if (itemResult.success && itemResult.data) setItems(itemResult.data);
      if (!accountResult.success || !itemResult.success) setMessage("Ítem actualizado, pero no se pudieron recargar los datos.");
    }
  }
  if (loading) return <Loading />;
  if (!account) return <p role="alert">{message || "La cuenta no existe."}</p>;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Información de la cuenta de cobro</h1>
      {message && <p role="status">{message}</p>}
      <section className="space-y-3"><h2 className="text-lg font-semibold">Ítems de la cuenta</h2>{account.status === "paid" && <p className="text-sm">Para editar los ítems, cambia la cuenta a pendiente y guarda el cambio.</p>}{items.length ? items.map((item) => <ItemEditor key={item.id} item={item} disabled={account.status === "paid"} onSave={editItem} />) : <p>No hay ítems en esta cuenta.</p>}</section>
      <form onSubmit={(event) => void save(event)} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2"><Label htmlFor="statement-status">Estado</Label><select id="statement-status" value={status} onChange={(event) => setStatus(event.target.value === "paid" ? "paid" : "pending")} className="w-full rounded-md border bg-background p-2"><option value="pending">Pendiente</option><option value="paid">Pagada</option></select></div>
        <p>Valor total: ${(account.amount ?? 0).toLocaleString("es-CO")}</p>
        <div className="space-y-2"><Label>Fecha de pago</Label><DatePicker date={date} setDate={setDate} /></div>
        <div className="flex items-center gap-2"><input id="show-item-amount" type="checkbox" checked={showItemAmount} onChange={(event) => setShowItemAmount(event.target.checked)} /><Label htmlFor="show-item-amount">Mostrar valor de los ítems en el PDF</Label></div>
        <div className="space-y-2"><Label htmlFor="extra-info">Información adicional</Label><Textarea id="extra-info" value={extraInfo} onChange={(event) => setExtraInfo(event.target.value)} maxLength={2000} /></div>
        <Button disabled={saving} type="submit">{saving ? "Guardando…" : "Guardar cambios"}</Button>
      </form>
    </div>
  );
}

function ItemEditor({ item, disabled, onSave }: { item: billing_statement_item; disabled: boolean; onSave: (id: string, desc: string, amount: number) => Promise<void> }) {
  const [description, setDescription] = useState(item.desc);
  const [amount, setAmount] = useState(String(item.amount));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!item.id || !description.trim() || !Number.isSafeInteger(value) || value <= 0 || value > 2147483647) { setMessage("Ingrese una descripción y un valor entero mayor que cero."); return; }
    setSaving(true); setMessage(""); await onSave(item.id, description, value); setSaving(false);
  }
  return <form onSubmit={(event) => void save(event)} className="grid gap-3 rounded-md border p-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`desc-${item.id}`}>Descripción del ítem {item.desc}</Label><Input id={`desc-${item.id}`} value={description} disabled={disabled || saving} maxLength={150} required onChange={(event) => setDescription(event.target.value)} /></div><div className="space-y-2"><Label htmlFor={`amount-${item.id}`}>Valor del ítem {item.desc}</Label><Input id={`amount-${item.id}`} type="number" min="1" max="2147483647" step="1" value={amount} disabled={disabled || saving} required onChange={(event) => setAmount(event.target.value)} /></div>{message && <p role="alert">{message}</p>}<Button type="submit" disabled={disabled || saving || (description === item.desc && amount === String(item.amount))}>Guardar ítem</Button></form>;
}
