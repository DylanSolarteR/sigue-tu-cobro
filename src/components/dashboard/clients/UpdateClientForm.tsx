import { ActorForm } from "@/components/dashboard/actors/ActorForm";

export default function UpdateClientForm({ id }: { id: string }) {
  return <ActorForm kind="client" id={id} />;
}
