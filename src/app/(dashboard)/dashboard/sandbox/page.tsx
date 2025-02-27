import { UserButton } from "@clerk/nextjs";
import { api } from "@/trpc/server";
import { getClients } from "@/actions/actor.api";
import * as bs from "@/actions/billing-statement.api";

function page() {
  async function createClient() {
    "use server";
    const resultId = await api.actor.mutations.client.create({
      name: "John Doe",
      docType: "CC",
      docNumber: "123456789",
      type: "client",
    });
    console.log("Created client", resultId);
  }
  async function createCreditor() {
    "use server";
    const resultId = await api.actor.mutations.creditor.create({
      name: "Doe Jhon",
      docType: "CC",
      docNumber: "123456789",
      type: "creditor",
    });
    console.log("Created creditor", resultId);
  }
  async function createBillingStatement() {
    "use server";
    const resultId = await api.billing_statement.mutations.create({
      client_id: "a7372268-f0e6-4df9-9d8b-0d0ed3ee084f",
      creditor_id: "b60dfe71-6125-4a02-9995-27b6aac40190",
      status: "pending",
    });
    console.log("Created billing statement", resultId);
  }
  async function createBillingStatementItem() {
    "use server";
    const resultId = await api.billing_statement_item.mutations.create({
      billing_statement_id: "72bb43de-473a-422a-8ce9-4276a11b48c8",
      amount: 100,
    });
    console.log("Created billing statement item", resultId);
  }

  async function listClients() {
    "use server";
    const clients = await getClients();
    console.log(clients);
  }

  async function listBillingStatements() {
    "use server";
    const billingStatements = await api.billing_statement.queries.getAll();
    console.log(billingStatements);
  }

  async function listCreditors() {
    "use server";
    const creditors = await api.actor.queries.getCreditors();
    console.log(creditors);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <UserButton></UserButton>
      <button onClick={createClient}>Create Client</button>
      <button onClick={createCreditor}>Create Creditor</button>
      <button onClick={createBillingStatement}>Create Billing Statement</button>
      <button onClick={createBillingStatementItem}>
        Create Billing Statement Item
      </button>
      <button onClick={listClients}>List Clients</button>
      <button onClick={listCreditors}>List Creditors</button>
      <button onClick={listBillingStatements}>List Billing Statements</button>
    </div>
  );
}

export default page;
