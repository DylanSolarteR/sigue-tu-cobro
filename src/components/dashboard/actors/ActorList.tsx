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

  if (loading) return (
    <div role="status" aria-label={`Cargando ${section}`} className="w-full space-y-4">
      <div aria-hidden="true" className="overflow-hidden rounded-box border border-base-300 bg-base-100">
        <div className="hidden gap-6 border-b border-base-300 p-4 md:grid md:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-4 w-24 max-w-full rounded bg-base-300" />)}
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="grid gap-3 border-b border-base-300 p-4 last:border-0 md:grid-cols-5 md:items-center md:gap-6">
            <div className="h-5 w-40 max-w-full rounded bg-base-300" />
            <div className="h-4 w-36 max-w-full rounded bg-base-300" />
            <div className="h-4 w-28 max-w-full rounded bg-base-300" />
            <div className="h-4 w-28 max-w-full rounded bg-base-300" />
            <div className="h-11 w-24 rounded bg-base-300" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="ml-auto h-11 w-56 max-w-full rounded bg-base-300" />
    </div>
  );
  if (error) return <p role="alert" className="alert alert-error">No se pudieron cargar los {section}.</p>;

  const pageCount = Math.max(1, Math.ceil(actors.length / PAGE_SIZE));
  const visible = actors.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table w-full max-md:block">
          <thead className="max-md:sr-only"><tr><th scope="col">Nombre</th><th scope="col">Documento</th><th scope="col">Lugar de expedición</th><th scope="col">Teléfono</th><th scope="col">Acciones</th></tr></thead>
          <tbody className="max-md:block">{visible.length ? visible.map((actor) => <tr key={actor.id} className="max-md:block max-md:border-b max-md:border-base-300 max-md:p-4">
            <td className="font-semibold max-md:block max-md:whitespace-normal max-md:break-words max-md:px-0 max-md:pb-3 max-md:text-base">{actor.name}</td><td data-label="Documento" className="max-md:block max-md:whitespace-normal max-md:break-all max-md:px-0 max-md:py-1 max-md:before:mr-2 max-md:before:font-medium max-md:before:text-base-content/70 max-md:before:content-[attr(data-label)]">{actor.docType} {actor.docNumber}</td><td data-label="Lugar de expedición" className="max-md:block max-md:whitespace-normal max-md:break-words max-md:px-0 max-md:py-1 max-md:before:mr-2 max-md:before:font-medium max-md:before:text-base-content/70 max-md:before:content-[attr(data-label)]">{actor.expeditionPlace || "—"}</td><td data-label="Teléfono" className="max-md:block max-md:whitespace-normal max-md:break-all max-md:px-0 max-md:py-1 max-md:before:mr-2 max-md:before:font-medium max-md:before:text-base-content/70 max-md:before:content-[attr(data-label)]">{actor.telephone || "—"}</td>
            <td className="max-md:block max-md:px-0 max-md:pt-3"><div className="flex gap-2"><Link className="btn btn-ghost min-h-11 min-w-11" href={`/dashboard/${section}/editar/${actor.id}`} aria-label={`Editar ${actor.name}`}><Edit size={18} aria-hidden="true" /></Link><button type="button" className="btn btn-ghost min-h-11 min-w-11" disabled={!actor.id || deleting !== null} onClick={() => void remove(actor)} aria-label={`Eliminar ${actor.name}`}><Trash size={18} aria-hidden="true" /></button></div></td>
          </tr>) : <tr><td colSpan={5} className="py-8 text-center">No hay {section} registrados.</td></tr>}</tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><button type="button" className="btn btn-outline min-h-11" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Anterior</button><span className="text-sm text-base-content/70">{page + 1} de {pageCount}</span><button type="button" className="btn btn-outline min-h-11" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)}>Siguiente</button></div>
    </div>
  );
}
