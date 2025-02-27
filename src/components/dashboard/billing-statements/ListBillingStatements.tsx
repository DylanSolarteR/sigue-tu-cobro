"use client";
import { Actor } from "@/types/actor";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/datatable/Datatable";
import { useEffect, useState } from "react";
import { deleteClientById, getClients } from "@/actions/actor.api";
import Loading from "@/components/Loading";
import { Download, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { toast } from "sonner";
import { billing_statement } from "@/types/billing-statement";
import {
  deleteBillingstatement,
  getBillingStatements,
} from "@/actions/billing-statement.api";

function ListBillingStatements() {
  const [billingStatements, setBillingStatements] = useState<
    billing_statement[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const columns: ColumnDef<billing_statement>[] = [
    {
      accessorKey: "client_name",
      header: () => (
        <div className="text-center text-xl text-foreground">Cliente</div>
      ),
    },
    {
      accessorKey: "creditor_name",
      header: () => (
        <div className="text-center text-xl text-foreground">Acreedor</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-center text-xl text-foreground">Estado</div>
      ),
      cell: ({ row }) => {
        const billing_statement = row.original;
        return (
          <div className="text-center text-foreground">
            {billing_statement.status === "payed" ? "Pagado" : "Pendiente"}
          </div>
        );
      },
    },
    {
      accessorKey: "payDate",
      header: () => (
        <div className="text-center text-xl text-foreground">{"Fecha"}</div>
      ),
      cell: ({ row }) => {
        const billing_statement = row.original;
        return (
          <div className="text-center text-foreground">
            {new Date(billing_statement.payDate).toLocaleString("es-CO", {
              dateStyle: "long",
            })}
          </div>
        );
      },
    },

    {
      accessorKey: "amount",
      header: () => (
        <div className="text-center text-xl text-foreground">Valor total</div>
      ),
    },
    {
      accessorKey: "actions",
      header: () => (
        <div className="text-center text-xl text-foreground">Acciones</div>
      ),
      cell: ({ row }) => {
        const client = row.original;

        return (
          <div className="flex flex-row items-center justify-center">
            <button
              onClick={() => {
                handleEdit(client.id as string);
              }}
            >
              <Edit size={24} />
            </button>
            <Popover>
              <PopoverTrigger>
                <Trash size={24} />
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-4 rounded-lg bg-background p-4 text-center">
                <p>¿Estás seguro de eliminar este cliente?</p>
                <Button
                  onClick={() => {
                    handleDelete(client.id as string);
                  }}
                >
                  Eliminar
                </Button>
              </PopoverContent>
            </Popover>
            <button
              onClick={() => {
                handleDownload(client.id as string);
              }}
            >
              <Download size={24} />
            </button>
          </div>
        );
      },
    },
  ];

  async function CallForClients() {
    const result = await getBillingStatements();
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setBillingStatements(result.data!);
    setLoading(false);
  }
  useEffect(() => {
    CallForClients();
  }, []);

  function handleEdit(id: string) {
    router.push(`/dashboard/cuentas-cobro/editar/${id}`);
  }

  function handleDownload(id: string) {}

  async function handleDelete(id: string) {
    const result = await deleteBillingstatement(id);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      location.reload();
    }
  }

  return (
    <div className="flex h-full min-h-full w-full min-w-full items-center justify-center">
      {loading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} data={billingStatements}></DataTable>
      )}
    </div>
  );
}

export default ListBillingStatements;
