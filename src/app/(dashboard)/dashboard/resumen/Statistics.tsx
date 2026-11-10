import Link from "next/link";
import { getBillingStatements } from "@/actions/billing-statement.api";
import { buildDashboardStatistics } from "@/lib/dashboard-statistics";

const money = (value: number) => `$${new Intl.NumberFormat("es-CO").format(value)}`;

export default async function Statistics() {
  const response = await getBillingStatements();
  if (!response.success || !response.data) {
    return <div role="alert" className="rounded-2xl border border-error/30 bg-base-200 p-6 text-base-content">No pudimos cargar el resumen. Actualiza la página para intentarlo de nuevo.</div>;
  }
  const stats = buildDashboardStatistics(response.data);
  const paidPercent = stats.total ? Math.round((stats.paid / stats.total) * 100) : 0;
  const maxAmount = Math.max(...stats.months.map((month) => month.amount), 0);
  const measures = [
    { label: "Valor de cuentas", value: money(stats.totalAmount), hint: "Total registrado" },
    { label: "Cuentas creadas", value: String(stats.total), hint: "Todas tus cuentas" },
    { label: "Por cobrar", value: String(stats.pending), hint: "Cuentas pendientes" },
    { label: "Cobradas", value: String(stats.paid), hint: "Cuentas pagadas" },
  ];
  return (
    <div className="space-y-5">
      <section aria-label="Indicadores de cuentas" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {measures.map((measure) => (
          <div key={measure.label} className="rounded-2xl border border-base-content/10 bg-base-200 p-5">
            <p className="text-sm text-base-content/70">{measure.label}</p>
            <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-base-content">{measure.value}</p>
            <p className="mt-1 text-xs text-base-content/60">{measure.hint}</p>
          </div>
        ))}
      </section>
      {stats.total === 0 ? (
        <section className="rounded-2xl border border-base-content/10 bg-base-200 p-7">
          <h2 className="text-lg font-semibold text-base-content">Tu resumen comienza aquí</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/70">Cuando crees tu primera cuenta, aquí podrás seguir su estado y el valor de tus cuentas a lo largo del tiempo.</p>
          <Link href="/dashboard/cuentas-cobro/crear" className="btn btn-primary mt-5">Crear cuenta de cobro</Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <section aria-labelledby="status-chart-title" className="rounded-2xl border border-base-content/10 bg-base-200 p-6">
            <h2 id="status-chart-title" className="text-base font-semibold text-base-content">Estado de tus cuentas</h2>
            <p className="mt-1 text-sm text-base-content/65">Distribución de {stats.total} {stats.total === 1 ? "cuenta" : "cuentas"}</p>
            <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-base-300" aria-hidden="true">
              <div className="bg-[#73d2ae]" style={{ width: `${paidPercent}%` }} />
              <div className="bg-[#58796c]" style={{ width: `${100 - paidPercent}%` }} />
            </div>
            <ul className="mt-5 space-y-3 text-sm text-base-content/80">
              <li className="flex items-center justify-between gap-4"><span className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#73d2ae]" />Pagadas</span><strong>{stats.paid} · {paidPercent}%</strong></li>
              <li className="flex items-center justify-between gap-4"><span className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#58796c]" />Pendientes</span><strong>{stats.pending} · {100 - paidPercent}%</strong></li>
            </ul>
          </section>
          <section aria-labelledby="timeline-chart-title" className="min-w-0 rounded-2xl border border-base-content/10 bg-base-200 p-6">
            <h2 id="timeline-chart-title" className="text-base font-semibold text-base-content">Valor de cuentas creadas</h2>
            <p className="mt-1 text-sm text-base-content/65">Últimos seis meses · por fecha de creación</p>
            {maxAmount === 0 ? <p className="mt-7 text-sm text-base-content/70">No hay cuentas creadas en este período.</p> : (
              <div className="mt-6 overflow-x-auto">
                <ol className="flex min-w-[30rem] items-end gap-2" aria-label="Valor registrado por mes de creación">
                  {stats.months.map((month) => (
                    <li key={month.key} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                      <span className="sr-only">{month.label}: {money(month.amount)}</span>
                      <span aria-hidden="true" className="h-32 w-full max-w-12 overflow-hidden rounded-t-md bg-base-300/60 flex items-end">
                        <span className="w-full rounded-t-md bg-[#73d2ae]" style={{ height: `${Math.max(month.amount > 0 ? 3 : 0, (month.amount / maxAmount) * 100)}%` }} />
                      </span>
                      <span aria-hidden="true" className="text-xs text-base-content/65">{month.label}</span>
                      <span aria-hidden="true" className="text-xs text-base-content/80">{money(month.amount)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
