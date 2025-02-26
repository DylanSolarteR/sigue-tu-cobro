import KPICard from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui";
import Link from "next/link";

function Dashboard() {
  return (
    <>
      <section className="grid h-full w-full grid-cols-2 items-center justify-center gap-3 md:flex md:h-[16rem] md:w-full md:flex-row md:items-center md:justify-between md:gap-3">
        <KPICard title="Ganancia total" value={"$" + 0}></KPICard>
        <KPICard title="Ganancia mes" value={"$" + 0}></KPICard>
        <KPICard title="Cuentas cobradas" value={0}></KPICard>
        <KPICard title="Cuentas sin cobrar" value={0}></KPICard>
      </section>
      <section className="flex h-full max-h-[30rem] w-full items-center justify-center gap-3">
        <div className="h-full grow rounded-lg bg-muted"></div>
        <div className="flex h-full w-[17rem] flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-secondary to-accent p-2">
          {/* <h2></h2> */}
          <p className="text-bold text-center text-2xl">
            Crea una nueva cuenta de cobro en unos pocos clicks
          </p>
          <Link href={"/cuentas-cobro"} className="hover:drop-shadow-xl">
            <Button size={"xl"}>Crear nueva</Button>
          </Link>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
