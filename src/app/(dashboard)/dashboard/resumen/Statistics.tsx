import Link from "next/link";
import { getBillingStatements } from "@/actions/billing-statement.api";
import SummaryAnalytics from "@/components/dashboard/summary/SummaryAnalytics";
import { buildDashboardStatistics } from "@/lib/dashboard-statistics";

const money = (value: number) => `$${new Intl.NumberFormat("es-CO").format(value)}`;

export default async function Statistics() {
  const response = await getBillingStatements();
  if (!response.success || !response.data) {
    return <div role="alert" className="rounded-2xl border border-error/30 bg-base-200 p-6 text-base-content">No pudimos cargar el resumen. Actualiza la página para intentarlo de nuevo.</div>;
  }
  const stats = buildDashboardStatistics(response.data);
  const paidPercent = stats.total ? Math.round((stats.paid / stats.total) * 100) : 0;
  const measures = [
    { label: "Valor de cuentas", value: money(stats.totalAmount), hint: "Total registrado" },
    { label: "Cuentas creadas", value: String(stats.total), hint: "Todas tus cuentas" },
    { label: "Valor pendiente", value: money(stats.pendingAmount), hint: "Cuentas por cobrar" },
  ];
  return <div className="space-y-5">
    <section aria-label="Indicadores de cuentas" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {measures.map((measure) => <div key={measure.label} className="rounded-2xl border border-base-content/10 bg-base-200 p-5">
        <p className="text-stc-label text-base-content/70">{measure.label}</p><p className="mt-3 break-words text-2xl font-semibold tracking-tight text-base-content">{measure.value}</p><p className="mt-1 text-xs text-base-content/60">{measure.hint}</p>
      </div>)}
    </section>
    {stats.total === 0 ? <section className="rounded-2xl border border-base-content/10 bg-base-200 p-7">
      <h2 className="text-lg font-semibold text-base-content">Tu resumen comienza aquí</h2>
      <p className="mt-2 max-w-xl text-stc-label leading-relaxed text-base-content/70">Cuando crees tu primera cuenta, aquí podrás seguir su estado y el valor de tus cuentas a lo largo del tiempo.</p>
      <Link href="/dashboard/cuentas-cobro/crear" className="btn btn-primary mt-5">Crear cuenta de cobro</Link>
    </section> : <>
      <section aria-labelledby="status-chart-title" className="rounded-2xl border border-base-content/10 bg-base-200 p-6">
        <h2 id="status-chart-title" className="text-base font-semibold text-base-content">Estado de tus cuentas</h2>
        <p className="mt-1 text-stc-label text-base-content/65">Distribución de {stats.total} {stats.total === 1 ? "cuenta" : "cuentas"}</p>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-base-300" aria-hidden="true"><div className="bg-[#73d2ae]" style={{ width: `${paidPercent}%` }} /><div className="bg-[#58796c]" style={{ width: `${100 - paidPercent}%` }} /></div>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-stc-label text-base-content/80"><li>Pagadas: <strong>{stats.paid} · {paidPercent}%</strong></li><li>Pendientes: <strong>{stats.pending} · {100 - paidPercent}%</strong></li></ul>
      </section>
      <SummaryAnalytics statements={response.data} />
    </>}
  </div>;
}
