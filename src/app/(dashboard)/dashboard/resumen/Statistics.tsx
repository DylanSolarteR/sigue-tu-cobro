import { getStatistics } from "@/actions/billing-statement.api";
import KPICard from "@/components/dashboard/summary/KPICard";

async function Statistics() {
  const { data } = await getStatistics();
  return (
    <>
      <KPICard title="Ganancia total" value={"$" + data?.totalAmount}></KPICard>
      <KPICard
        title="Cuentas de cobro"
        value={data?.numberOfBillingStatements ?? 0}
      ></KPICard>
      <KPICard
        title="Cuentas cobradas"
        value={data?.numberOfPayedBillingStatements ?? 0}
      ></KPICard>
      <KPICard
        title="Cuentas sin cobrar"
        value={data?.numberOfPendingBillingStatements ?? 0}
      ></KPICard>
    </>
  );
}

export default Statistics;
