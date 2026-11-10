"use client";

import { useActionState, useEffect, useState } from "react";
import { createClient, createCreditor, getClientById, getCreditorById, updateClientById, updateCreditorById } from "@/actions/actor.api";
import { onlyNumberInput } from "@/lib/utils";
import type { Actor } from "@/types/actor";
import type { ActionResponse } from "@/types/actionResponses";

const INITIAL_STATE: ActionResponse<Actor> = { success: false, message: "" };

export function ActorForm({ kind, id }: { kind: "client" | "creditor"; id?: string }) {
  const editing = Boolean(id);
  const subject = kind === "client" ? "cliente" : "acreedor";
  const [record, setRecord] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState(false);
  const [state, action, pending] = useActionState(async (previous: ActionResponse<Actor>, formData: FormData) => {
    if (id) return kind === "client" ? updateClientById(previous, formData, id) : updateCreditorById(previous, formData, id);
    return kind === "client" ? createClient(previous, formData) : createCreditor(previous, formData);
  }, INITIAL_STATE);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setLoadError(false);
    const request = kind === "client" ? getClientById(id) : getCreditorById(id);
    void request.then((result) => {
      if (!active) return;
      if (result.success && result.data) setRecord(result.data);
      else setLoadError(true);
      setLoading(false);
    }).catch(() => { if (active) { setLoadError(true); setLoading(false); } });
    return () => { active = false; };
  }, [id, kind]);

  if (loading) return <p role="status" className="text-base-content/70">Cargando información…</p>;
  if (loadError || (editing && !record)) return <p role="alert" className="alert alert-error">No se pudo cargar el {subject}.</p>;
  const input = state.input ?? record;
  const error = (field: keyof Actor) => state.errors?.[field]?.[0];

  return (
    <section className="card w-full max-w-3xl border border-base-300 bg-base-200">
      <div className="card-body gap-6">
        <div><h2 className="card-title">Información del {subject}</h2><p className="mt-2 text-sm text-base-content/70">{editing ? "Actualiza los datos y guarda los cambios." : `Completa los datos para registrar el ${subject}.`}</p></div>
        {state.message && <p role={state.success ? "status" : "alert"} className={`alert ${state.success ? "alert-success" : "alert-error"}`}>{state.message}</p>}
        <form key={JSON.stringify(input ?? null)} action={action} className="grid gap-5" autoComplete="on">
          <div className="grid gap-2"><label htmlFor="name" className="font-medium">Nombre completo</label><input id="name" name="name" className="input w-full" required minLength={3} maxLength={100} defaultValue={input?.name} autoComplete="name" aria-invalid={Boolean(error("name"))} aria-describedby={error("name") ? "name-error" : undefined} />{error("name") && <p id="name-error" className="text-sm text-error">{error("name")}</p>}</div>
          <div className="grid gap-2"><label htmlFor="docType" className="font-medium">Tipo de documento</label><select id="docType" name="docType" className="select w-full" required defaultValue={input?.docType ?? ""} aria-invalid={Boolean(error("docType"))} aria-describedby={error("docType") ? "docType-error" : undefined}><option value="" disabled>Selecciona un tipo de documento</option><option value="CC">Cédula de ciudadanía</option><option value="CE">Cédula de extranjería</option><option value="NIT">NIT</option></select>{error("docType") && <p id="docType-error" className="text-sm text-error">{error("docType")}</p>}</div>
          <div className="grid gap-2"><label htmlFor="docNumber" className="font-medium">Número de documento</label><input id="docNumber" name="docNumber" className="input w-full" required minLength={5} maxLength={100} inputMode="numeric" onKeyDown={onlyNumberInput} defaultValue={input?.docNumber} aria-invalid={Boolean(error("docNumber"))} aria-describedby={error("docNumber") ? "docNumber-error" : undefined} />{error("docNumber") && <p id="docNumber-error" className="text-sm text-error">{error("docNumber")}</p>}</div>
          <div className="grid gap-2"><label htmlFor="expeditionPlace" className="font-medium">Lugar de expedición <span className="font-normal text-base-content/70">(opcional)</span></label><input id="expeditionPlace" name="expeditionPlace" className="input w-full" minLength={2} maxLength={10} defaultValue={input?.expeditionPlace ?? ""} autoComplete="address-level2" aria-invalid={Boolean(error("expeditionPlace"))} aria-describedby={error("expeditionPlace") ? "expeditionPlace-error" : undefined} />{error("expeditionPlace") && <p id="expeditionPlace-error" className="text-sm text-error">{error("expeditionPlace")}</p>}</div>
          <div className="grid gap-2"><label htmlFor="telephone" className="font-medium">Teléfono <span className="font-normal text-base-content/70">(opcional)</span></label><input id="telephone" name="telephone" className="input w-full" minLength={10} maxLength={10} inputMode="tel" onKeyDown={onlyNumberInput} defaultValue={input?.telephone ?? ""} autoComplete="tel" aria-invalid={Boolean(error("telephone"))} aria-describedby={error("telephone") ? "telephone-error" : undefined} />{error("telephone") && <p id="telephone-error" className="text-sm text-error">{error("telephone")}</p>}</div>
          <button type="submit" className="btn btn-primary w-full sm:w-fit" disabled={pending}>{pending ? "Guardando…" : `${editing ? "Actualizar" : "Crear"} ${subject}`}</button>
        </form>
      </div>
    </section>
  );
}
