import UpdateBillingStatmenteForm from "@/components/dashboard/billing-statements/UpdateBillingStatementForm";
import { Button } from "@/components/ui";
import Link from "next/link";

async function UpdateBillingStatement(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return (
    <>
      <section className="rounded-lg bg-secondary py-6 md:h-[20%] md:max-h-[20%] md:w-[70rem] md:max-w-full">
        <div className="flex h-full flex-col items-start justify-start gap-4">
          <h1 className="px-8 text-2xl text-white">Cuentas de cobro</h1>
          <div className="flex w-full flex-row items-center justify-start gap-4 px-8">
            <Link href={"/dashboard/cuentas-cobro"}>
              <Button
                size={"xl"}
                variant={"outline"}
                className="bg-primary drop-shadow-lg hover:brightness-110"
              >
                Ver lista de cuentas de cobro
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center rounded-lg bg-muted md:h-full md:max-h-[80%] md:w-[70rem] md:max-w-full">
        <UpdateBillingStatmenteForm id={id} />
      </section>
    </>
  );
}

export default UpdateBillingStatement;
