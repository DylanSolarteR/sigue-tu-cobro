import { getClients } from "@/actions/actor.api";
import ItemsManager from "@/components/dashboard/billing-statements/ItemsManager";

export default async function ItemsPage() {
  const clients = await getClients();
  return <section className="w-full rounded-box bg-base-200"><ItemsManager clients={clients} /></section>;
}
