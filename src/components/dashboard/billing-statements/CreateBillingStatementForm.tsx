import { getClients, getCreditors } from "@/actions/actor.api";
import ActorForm from "./ActorForm";

async function CreateBillingStatementForm() {
  const clientsList = await getClients();
  const creditorsList = await getCreditors();

  return (
    <section className="card w-full border border-base-300 bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Información de la cuenta de cobro</h2>
        <p className="mb-4 text-sm text-base-content/70">Selecciona los datos y conceptos de esta cuenta.</p>
        <ActorForm clientsList={clientsList} creditorsList={creditorsList} />
      </div>
    </section>
  );
}

export default CreateBillingStatementForm;
