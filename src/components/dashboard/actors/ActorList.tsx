"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { deleteClientById, deleteCreditorById, getClients, getCreditors } from "@/actions/actor.api";
import type { Actor } from "@/types/actor";

const PAGE_SIZE = 10;

export function ActorList({ kind }: { kind: "client" | "creditor" }) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const subject = kind === "client" ? "cliente" : "acreedor";
  const section = kind === "client" ? "clientes" : "acreedores";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const request = kind === "client" ? getClients() : getCreditors();
    void request.then((result) => { if (active) { setActors(result); setLoading(false); } })
      .catch(() => { if (active) { setError(true); setLoading(false); } });
    return () => { active = false; };
  }, [kind]);

  async function remove(actor: Actor) {
    if (!actor.id || !window.confirm(`¿Eliminar a ${actor.name}?`)) return;
    setDeleting(actor.id);
    try {
      const result = await (kind === "client" ? deleteClientById(actor.id) : deleteCreditorById(actor.id));
      if (!result.success) toast.error(result.message);
      else {
        toast.success(result.message);
        setActors((previous) => previous.filter((item) => item.id !== actor.id));
        setPage((current) => Math.min(current, Math.max(0, Math.ceil((actors.length - 1) / PAGE_SIZE) - 1)));
      }
    } catch { toast.error(`No se pudo eliminar el ${subject}.`); }
    finally { setDeleting(null); }
  }

  if (loading) return <p role="status" className="text-base-content/70">Cargando {section}…</p>;
  if (error) return <p role="alert" className="alert alert-error">No se pudieron cargar los {section}.</p>;

  const pageCount = Math.max(1, Math.ceil(actors.length / PAGE_SIZE));
  const visible = actors.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table w-full">
          <thead><tr><th scope="col">Nombre</th><th scope="col">Documento</th><th scope="col">Lugar de expedición</th><th scope="col">Teléfono</th><th scope="col">Acciones</th></tr></thead>
          <tbody>{visible.length ? visible.map((actor) => <tr key={actor.id}>
            <td>{actor.name}</td><td>{actor.docType} {actor.docNumber}</td><td>{actor.expeditionPlace || "—"}</td><td>{actor.telephone || "—"}</td>
            <td><div className="flex gap-2"><Link className="btn btn-ghost btn-sm" href={`/dashboard/${section}/editar/${actor.id}`} aria-label={`Editar ${actor.name}`}><Edit size={18} aria-hidden="true" /></Link><button type="button" className="btn btn-ghost btn-sm" disabled={!actor.id || deleting !== null} onClick={() => void remove(actor)} aria-label={`Eliminar ${actor.name}`}><Trash size={18} aria-hidden="true" /></button></div></td>
          </tr>) : <tr><td colSpan={5} className="py-8 text-center">No hay {section} registrados.</td></tr>}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-3"><button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Anterior</button><span className="text-sm text-base-content/70">{page + 1} de {pageCount}</span><button type="button" className="btn btn-outline btn-sm" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)}>Siguiente</button></div>
    </div>
  );
}
