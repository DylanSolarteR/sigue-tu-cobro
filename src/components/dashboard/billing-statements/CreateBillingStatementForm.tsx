import { getClients, getCreditors } from "@/actions/actor.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import ActorForm from "./ActorForm";

async function CreateBillingStatementForm() {
  const clientsList = await getClients();
  const creditorsList = await getCreditors();

  return (
    <Card className="mx-auto flex h-full w-full max-w-full flex-col overflow-auto bg-transparent">
      <CardHeader>
        <CardTitle className="text-xl">
          Información de la cuenta de cobro.
        </CardTitle>
        <CardDescription className="brightness-75">
          Por favor ingrese la información de la cuenta de cobro a crear.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActorForm clientsList={clientsList} creditorsList={creditorsList} />
      </CardContent>
    </Card>
  );
}

export default CreateBillingStatementForm;
