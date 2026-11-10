"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { deleteBillingstatement, getBillingStatements, updateBillingStatementStatus } from "@/actions/billing-statement.api";
import DownloadPDFButton from "@/components/generatePDF";
import { formatBillingDate } from "@/lib/billing-date";
import type { billing_statement } from "@/types/billing-statement";

const PAGE_SIZE = 10;

export default function ListBillingStatements() {
  const [accounts, setAccounts] = useState<billing_statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    void getBillingStatements().then((result) => {
      if (!active) return;
      if (result.success) setAccounts(result.data ?? []);
      else setError(result.message);
      setLoading(false);
    }).catch(() => { if (active) { setError("No se pudieron cargar las cuentas."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  async function markPaid(account: billing_statement) {
    if (!account.id) return;
    setBusy(account.id);
    try {
      const result = await updateBillingStatementStatus(account.id, "paid");
      if (!result.success) toast.error(result.message);
      else { setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, status: "paid" } : item)); toast.success("Cuenta marcada como pagada."); }
    } catch { toast.error("No se pudo actualizar la cuenta."); }
    finally { setBusy(null); }
  }

  async function remove(account: billing_statement) {
    if (!account.id || !window.confirm("¿Eliminar esta cuenta de cobro?")) return;
    setBusy(account.id);
    try {
      const result = await deleteBillingstatement(account.id);
      if (!result.success) toast.error(result.message);
      else { toast.success(result.message); setAccounts((current) => current.filter((item) => item.id !== account.id)); setPage((current) => Math.min(current, Math.max(0, Math.ceil((accounts.length - 1) / PAGE_SIZE) - 1))); }
    } catch { toast.error("No se pudo eliminar la cuenta."); }
    finally { setBusy(null); }
  }

  if (loading) return <p role="status" className="text-base-content/70">Cargando cuentas…</p>;
  if (error) return <p role="alert" className="alert alert-error">{error}</p>;

  const pageCount = Math.max(1, Math.ceil(accounts.length / PAGE_SIZE));
  const visible = accounts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return <div className="w-full space-y-4">
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100"><table className="table w-full"><thead><tr><th scope="col">Cliente</th><th scope="col">Acreedor</th><th scope="col">Estado</th><th scope="col">Fecha</th><th scope="col">Valor total</th><th scope="col">Acciones</th></tr></thead><tbody>
      {visible.length ? visible.map((account) => { const date = formatBillingDate(account.payDate); return <tr key={account.id}><td>{account.client.name}</td><td>{account.creditor.name}</td><td><span className={`badge ${account.status === "paid" ? "badge-success" : "badge-warning"}`}>{account.status === "paid" ? "Pagada" : "Pendiente"}</span></td><td>{date.ok ? date.value : "Fecha no válida"}</td><td>${(account.amount ?? 0).toLocaleString("es-CO")}</td><td><div className="flex flex-wrap items-center gap-2">{account.status === "pending" && <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null} onClick={() => void markPaid(account)}>Marcar pagada</button>}<Link href={`/dashboard/cuentas-cobro/editar/${account.id}`} className="btn btn-ghost btn-sm" aria-label={`Editar cuenta de ${account.client.name}`}><Edit size={18} aria-hidden="true" /></Link><button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} aria-label={`Eliminar cuenta de ${account.client.name}`} onClick={() => void remove(account)}><Trash size={18} aria-hidden="true" /></button><DownloadPDFButton data={account} /></div></td></tr>; }) : <tr><td colSpan={6} className="py-8 text-center">No hay cuentas de cobro registradas.</td></tr>}
    </tbody></table></div>
    <div className="flex items-center justify-end gap-3"><button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Anterior</button><span className="text-sm text-base-content/70">{page + 1} de {pageCount}</span><button type="button" className="btn btn-outline btn-sm" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)}>Siguiente</button></div>
  </div>;
}
