"use client";
import { Actor } from "@/types/actor";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/datatable/Datatable";
import { useEffect, useState } from "react";
import { deleteCreditorById, getCreditors } from "@/actions/actor.api";
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

function ListCreditors() {
  const [creditors, setCreditors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const columns: ColumnDef<Actor>[] = [
    {
      accessorKey: "name",
      header: () => (
        <div className="text-center text-xl text-foreground">Nombre</div>
      ),
    },
    {
      accessorKey: "docType",
      header: () => (
        <div className="text-center text-xl text-foreground">Tipo de doc.</div>
      ),
    },
    {
      accessorKey: "docNumber",
      header: () => (
        <div className="text-center text-xl text-foreground">
          {"Núm. de doc."}
        </div>
      ),
    },
    {
      accessorKey: "expeditionPlace",
      header: () => (
        <div className="text-center text-xl text-foreground">
          Lugar de expedición
        </div>
      ),
      cell: ({ row }) => {
        const actor = row.original;
        return (
          <div className="text-center text-foreground">
            {actor.expeditionPlace}
          </div>
        );
      },
    },
    {
      accessorKey: "telephone",
      header: () => (
        <div className="text-center text-xl text-foreground">Teléfono</div>
      ),
      cell: ({ row }) => {
        const actor = row.original;
        return (
          <div className="text-center text-foreground">{actor.telephone}</div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => (
        <div className="text-center text-xl text-foreground">Acciones</div>
      ),
      cell: ({ row }) => {
        const creditor = row.original;

        return (
          <div className="flex flex-row items-center justify-center">
            <button
              onClick={() => {
                handleEdit(creditor.id as string);
              }}
            >
              <Edit size={24} />
            </button>
            <Popover>
              <PopoverTrigger>
                <Trash size={24} />
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-4 rounded-lg bg-background p-4 text-center">
                <p>¿Estás seguro de eliminar este acreedor?</p>
                <Button
                  onClick={() => {
                    handleDelete(creditor.id as string);
                  }}
                >
                  Eliminar
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];

  async function CallForClients() {
    setCreditors(await getCreditors());
    setLoading(false);
  }
  useEffect(() => {
    CallForClients();
  }, []);

  function handleEdit(id: string) {
    router.push(`/dashboard/acreedores/editar/${id}`);
  }
  async function handleDelete(id: string) {
    const result = await deleteCreditorById(id);
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
        <DataTable columns={columns} data={creditors}></DataTable>
      )}
    </div>
  );
}

export default ListCreditors;
