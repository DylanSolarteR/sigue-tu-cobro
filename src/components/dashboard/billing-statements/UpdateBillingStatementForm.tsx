"use client";

import { useEffect, useState } from "react";
import {
  getBillingStatement,
  saveBillingStatement,
} from "@/actions/billing-statement.api";
import {
  getBillingStatementItems,
  updateBillingStatementItem,
} from "@/actions/billing-statement.item.api";
import { DatePicker } from "@/components/DatePicker";
import MoneyInput from "@/components/dashboard/MoneyInput";
import type {
  billing_statement,
  billing_statement_item,
} from "@/types/billing-statement";
import {
  calendarDateToCivil,
  parseBillingDateForCalendar,
} from "@/lib/billing-date";

export default function UpdateBillingStatementForm({
  id,
  onUpdated,
  onPdfInvalidated,
  onItemsRefreshing,
  onItemsRefreshed,
}: {
  id: string;
  onUpdated?: (account: billing_statement) => void;
  onPdfInvalidated?: () => void;
  onItemsRefreshing?: () => void;
  onItemsRefreshed?: () => void;
}) {
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
      const [result, itemResult] = await Promise.all([
        getBillingStatement(id),
        getBillingStatementItems(id),
      ]);
      if (!active) return;
      if (!result.success || !result.data) {
        setMessage(result.message);
        setLoading(false);
        return;
      }
      if (!itemResult.success) {
        setMessage(itemResult.message);
        setLoading(false);
        return;
      }
      const parsedDate = parseBillingDateForCalendar(result.data.payDate);
      if (!parsedDate.ok) {
        setMessage("La fecha guardada no es válida.");
        setLoading(false);
        return;
      }
      setAccount(result.data);
      setItems(itemResult.data ?? []);
      onUpdated?.(result.data);
      onItemsRefreshed?.();
      setStatus(result.data.status === "paid" ? "paid" : "pending");
      setDate(parsedDate.value);
      setExtraInfo(result.data.extraInfo);
      setShowItemAmount(Boolean(result.data.showItemAmount));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const civilDate = calendarDateToCivil(date);
    if (!civilDate.ok) {
      setMessage("Selecciona una fecha válida.");
      return;
    }
    setSaving(true);
    const result = await saveBillingStatement({
      id,
      status,
      extraInfo,
      payDate: civilDate.value,
      showItemAmount,
    });
    setMessage(result.message);
    if (result.success && account) {
      const updated = {
        ...account,
        status,
        extraInfo,
        payDate: civilDate.value,
        showItemAmount,
      };
      setAccount(updated);
      onUpdated?.(updated);
      onPdfInvalidated?.();
    }
    setSaving(false);
  }
  async function editItem(itemId: string, desc: string, amount: number) {
    const result = await updateBillingStatementItem(itemId, desc, amount);
    setMessage(result.message);
    if (result.success) {
      onItemsRefreshing?.();
      const [accountResult, itemResult] = await Promise.all([
        getBillingStatement(id),
        getBillingStatementItems(id),
      ]);
      if (accountResult.success && accountResult.data) {
        setAccount(accountResult.data);
        onUpdated?.(accountResult.data);
      }
      if (itemResult.success && itemResult.data) setItems(itemResult.data);
      if (
        accountResult.success &&
        accountResult.data &&
        itemResult.success &&
        itemResult.data
      )
        onItemsRefreshed?.();
      if (!accountResult.success || !itemResult.success)
        setMessage("Ítem actualizado, pero no se pudieron recargar los datos.");
    }
  }
  if (loading)
    return (
      <div
        role="status"
        aria-label="Cargando cuenta"
        className="w-full max-w-4xl space-y-stc-group"
      >
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  if (!account) return <p role="alert">{message || "La cuenta no existe."}</p>;

  return (
    <div className="w-full space-y-6">
      <h2 className="w-full text-xl font-semibold">
        Información de la cuenta de cobro
      </h2>
      {message && <p role="status">{message}</p>}
      <div className="flex w-full flex-col gap-stc-group px-6">
        <section className="flex w-full flex-col gap-2">
          <h3 className="w-full text-lg font-semibold">Ítems de la cuenta</h3>
          {account.status === "paid" && (
            <p className="text-stc-label">
              Para editar los ítems, cambia la cuenta a pendiente y guarda el
              cambio.
            </p>
          )}
          {items.length ? (
            items.map((item) => (
              <ItemEditor
                key={item.id}
                item={item}
                disabled={account.status === "paid"}
                onSave={editItem}
              />
            ))
          ) : (
            <p>No hay ítems en esta cuenta.</p>
          )}
        </section>
        <form
          onSubmit={(event) => void save(event)}
          className="flex w-full flex-col gap-stc-group rounded-2xl border border-stc-border sm:p-6"
        >
          <div className="flex w-full flex-col gap-2">
            <label htmlFor="statement-status" className="font-medium">
              Estado
            </label>
            <select
              id="statement-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value === "paid" ? "paid" : "pending")
              }
              className="select min-h-12 w-full rounded-2xl border border-stc-border bg-stc-field outline-0 hover:border-stc-focus focus-visible:border-stc-focus"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagada</option>
            </select>
          </div>
          <p>Valor total: ${(account.amount ?? 0).toLocaleString("es-CO")}</p>
          <DatePicker date={date} setDate={setDate} />
          <div className="flex items-center gap-2">
            <input
              id="show-item-amount"
              type="checkbox"
              className="checkbox checkbox-primary rounded-md"
              checked={showItemAmount}
              onChange={(event) => setShowItemAmount(event.target.checked)}
            />
            <label htmlFor="show-item-amount" className="text-stc-label">
              Mostrar valor de los ítems en el PDF
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="extra-info" className="font-medium">
              Información adicional
            </label>
            <textarea
              className="textarea min-h-24 w-full rounded-2xl border border-stc-border bg-stc-field outline-0 hover:border-stc-focus focus-visible:border-stc-focus"
              id="extra-info"
              value={extraInfo}
              onChange={(event) => setExtraInfo(event.target.value)}
              maxLength={2000}
            />
          </div>
          <button
            className="btn btn-primary min-h-12 w-full rounded-xl sm:w-auto"
            disabled={saving}
            type="submit"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ItemEditor({
  item,
  disabled,
  onSave,
}: {
  item: billing_statement_item;
  disabled: boolean;
  onSave: (id: string, desc: string, amount: number) => Promise<void>;
}) {
  const [description, setDescription] = useState(item.desc);
  const [amount, setAmount] = useState(String(item.amount));
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    setMessage("");
    await onSave(item.id, description, value);
    setSaving(false);
  }
  return (
    <form
      onSubmit={(event) => void save(event)}
      className="grid w-full gap-3 rounded-2xl border border-stc-border p-4 sm:grid-cols-2"
    >
      <div className="space-y-2">
        <label className="font-medium" htmlFor={`desc-${item.id}`}>
          Descripción del ítem {item.desc}
        </label>
        <input
          className="input min-h-12 w-full rounded-2xl border border-stc-border bg-stc-field text-base outline-0 hover:border-stc-focus focus-visible:border-stc-focus"
          id={`desc-${item.id}`}
          value={description}
          disabled={disabled || saving}
          maxLength={200}
          required
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="font-medium" htmlFor={`amount-${item.id}`}>
          Valor del ítem
        </label>
        <MoneyInput
          id={`amount-${item.id}`}
          value={amount}
          disabled={disabled || saving}
          required
          onChange={setAmount}
        />
      </div>
      {message && <p role="alert">{message}</p>}
      <button
        className="btn btn-primary btn-sm w-full rounded-xl border sm:w-fit"
        type="submit"
        disabled={
          disabled ||
          saving ||
          (description === item.desc && amount === String(item.amount))
        }
      >
        Guardar ítem
      </button>
    </form>
  );
}
