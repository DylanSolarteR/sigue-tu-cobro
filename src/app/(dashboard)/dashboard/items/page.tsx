import { getClients } from "@/actions/actor.api";
import ItemsManager from "@/components/dashboard/billing-statements/ItemsManager";

export default async function ItemsPage() {
  const clients = await getClients();
  return <section className="w-full rounded-lg bg-muted"><ItemsManager clients={clients} /></section>;
}
