import { getClients, getCreditors } from "@/actions/actor.api";
import ActorForm from "./ActorForm";

async function CreateBillingStatementForm() {
  const clientsList = await getClients();
  const creditorsList = await getCreditors();

  return (
    <section className="w-full max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Información de la cuenta de cobro</h2>
        <p className="text-sm text-base-content/70">Selecciona los datos y conceptos de esta cuenta.</p>
        <ActorForm clientsList={clientsList} creditorsList={creditorsList} />
      </div>
    </section>
  );
}

export default CreateBillingStatementForm;
