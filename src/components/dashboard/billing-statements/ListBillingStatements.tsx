"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/datatable/Datatable";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { Edit, Trash } from "lucide-react";
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
  updateBillingStatementStatus,
} from "@/actions/billing-statement.api";

import DownloadPDFButton from "@/components/generatePDF";
import { formatBillingDate } from "@/lib/billing-date";

function ListBillingStatements() {
  const [billingStatements, setBillingStatements] = useState<
    billing_statement[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const columns: ColumnDef<billing_statement>[] = [
    {
      accessorKey: "client.name",
      header: () => (
        <div className="text-center text-xl text-foreground">Cliente</div>
      ),
    },
    {
      accessorKey: "creditor.name",
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
            {billing_statement.status === "paid" ? "Pagada" : "Pendiente"}
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
        const date = formatBillingDate(billing_statement.payDate);
        return (
          <div className="text-center text-foreground">
            {date.ok ? date.value : "Fecha no válida"}
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
        const billingS = row.original;

        return (
          <div className="flex flex-row items-center justify-center">
            {billingS.status === "pending" && (
              <Button size="sm" onClick={() => void handleMarkPaid(billingS)}>
                Marcar pagada
              </Button>
            )}
            <button
              aria-label="Editar cuenta"
              onClick={() => {
                handleEdit(billingS.id as string);
              }}
            >
              <Edit size={24} />
            </button>
            <Popover>
              <PopoverTrigger>
                <Trash size={24} />
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-4 rounded-lg bg-background p-4 text-center">
                <p>¿Estás seguro de eliminar esta cuenta de cobro?</p>
                <Button
                  onClick={() => {
                    handleDelete(billingS.id as string);
                  }}
                >
                  Eliminar
                </Button>
              </PopoverContent>
            </Popover>
            <DownloadPDFButton data={billingS} />
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

  async function handleMarkPaid(statement: billing_statement) {
    if (!statement.id) return;
    const result = await updateBillingStatementStatus(statement.id, "paid");
    if (!result.success) { toast.error(result.message); return; }
    setBillingStatements((current) => current.map((account) => account.id === statement.id ? { ...account, status: "paid" } : account));
    toast.success("Cuenta marcada como pagada.");
  }

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
