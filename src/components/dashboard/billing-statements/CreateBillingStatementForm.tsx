import { getClients, getCreditors } from "@/actions/actor.api";
import ActorForm from "./ActorForm";

async function CreateBillingStatementForm() {
  const clientsList = await getClients();
  const creditorsList = await getCreditors();

  return (
    <section className="w-full max-w-4xl">
      <div className="space-y-6">
        <div>
        <h2 className="text-xl font-semibold text-stc-text">Información de la cuenta de cobro</h2>
        <p className="mt-2 text-stc-label leading-6 text-stc-muted">Selecciona los datos y conceptos de esta cuenta.</p>
        </div>
        <ActorForm clientsList={clientsList} creditorsList={creditorsList} />
      </div>
    </section>
  );
}

export default CreateBillingStatementForm;
