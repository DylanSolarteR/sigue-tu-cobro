import { getClients, getCreditors } from "@/actions/actor.api";
import ActorForm from "./ActorForm";

async function CreateBillingStatementForm() {
  const clientsList = await getClients();
  const creditorsList = await getCreditors();

  return (
    <section className="w-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-stc-text text-xl font-semibold">
            Información de la cuenta de cobro
          </h2>
          <p className="text-stc-label text-stc-muted mt-2 leading-6">
            Selecciona los datos y conceptos de esta cuenta.
          </p>
        </div>
        <ActorForm clientsList={clientsList} creditorsList={creditorsList} />
      </div>
    </section>
  );
}

export default CreateBillingStatementForm;
