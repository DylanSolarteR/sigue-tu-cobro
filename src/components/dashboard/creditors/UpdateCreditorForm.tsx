import { ActorForm } from "@/components/dashboard/actors/ActorForm";

export default function UpdateCreditorForm({ id }: { id: string }) {
  return <ActorForm kind="creditor" id={id} />;
}
