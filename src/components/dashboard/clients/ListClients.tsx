"use client";
import { Actor } from "@/types/actor";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/datatable/Datatable";
import { useEffect, useState } from "react";
import { getClients } from "@/actions/actor.api";
import Loading from "@/components/Loading";
import { Edit, Trash } from "lucide-react";

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
          {actor.telephone ?? ""}
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
        <div className="text-center text-foreground">
          {actor.telephone ?? ""}
        </div>
      );
    },
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
          <button onClick={() => {}}>
            <Edit size={30} />
          </button>
          <button onClick={() => {}}>
            <Trash size={30} />
          </button>
        </div>
      );
    },
  },
];
function ListClients() {
  const [clients, setClients] = useState<Actor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  async function CallForClients() {
    setClients(await getClients());
    setLoading(false);
  }
  useEffect(() => {
    CallForClients();
  }, []);

  return (
    <div className="flex h-full min-h-full w-full min-w-full items-center justify-center">
      {loading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} data={clients}></DataTable>
      )}
    </div>
  );
}

export default ListClients;
