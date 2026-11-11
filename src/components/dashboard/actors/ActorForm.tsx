"use client";

import SelectField from "@/components/dashboard/SelectField";

import { useActionState, useEffect, useState } from "react";
import {
  createClient,
  createCreditor,
  getClientById,
  getCreditorById,
  updateClientById,
  updateCreditorById,
} from "@/actions/actor.api";
import { onlyNumberInput } from "@/lib/utils";
import type { Actor } from "@/types/actor";
import type { ActionResponse } from "@/types/actionResponses";

const INITIAL_STATE: ActionResponse<Actor> = { success: false, message: "" };

export function ActorForm({
  kind,
  id,
}: {
  kind: "client" | "creditor";
  id?: string;
}) {
  const editing = Boolean(id);
  const subject = kind === "client" ? "cliente" : "acreedor";
  const [record, setRecord] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState(false);
  const [state, action, pending] = useActionState(
    async (previous: ActionResponse<Actor>, formData: FormData) => {
      if (id)
        return kind === "client"
          ? updateClientById(previous, formData, id)
          : updateCreditorById(previous, formData, id);
      return kind === "client"
        ? createClient(previous, formData)
        : createCreditor(previous, formData);
    },
    INITIAL_STATE,
  );

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setLoadError(false);
    const request = kind === "client" ? getClientById(id) : getCreditorById(id);
    void request
      .then((result) => {
        if (!active) return;
        if (result.success && result.data) setRecord(result.data);
        else setLoadError(true);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, kind]);

  if (loading)
    return (
      <div
        role="status"
        aria-label={`Cargando información del ${subject}`}
        className="w-full"
      >
        <div aria-hidden="true" className="space-y-6">
          <div className="space-y-3">
            <div className="bg-base-300 h-6 w-48 max-w-full rounded" />
            <div className="bg-base-300 h-4 w-72 max-w-full rounded" />
          </div>
          <div className="bg-base-300 h-5 w-32 rounded" />
          <div className="space-y-2">
            <div className="bg-base-300 h-4 w-32 rounded" />
            <div className="bg-base-300 h-12 w-full rounded" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-base-300 h-4 w-36 max-w-full rounded" />
                <div className="bg-base-300 h-12 w-full rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="bg-base-300 h-4 w-40 rounded" />
            <div className="bg-base-300 h-12 w-full rounded" />
          </div>
          <div className="border-stc-border space-y-3 border-t pt-6">
            <div className="bg-base-300 h-5 w-24 rounded" />
            <div className="bg-base-300 h-4 w-28 rounded" />
            <div className="bg-base-300 h-12 w-full rounded" />
          </div>
          <div className="bg-base-300 h-12 w-full rounded sm:w-40" />
        </div>
      </div>
    );
  if (loadError || (editing && !record))
    return (
      <p role="alert" className="alert alert-error">
        No se pudo cargar el {subject}.
      </p>
    );
  const input = state.input ?? record;
  const error = (field: keyof Actor) => state.errors?.[field]?.[0];

  return (
    <section className="w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold">Información del {subject}</h2>
          <p className="text-stc-muted mt-2 text-sm">
            {editing
              ? "Actualiza los datos y guarda los cambios."
              : `Completa los datos para registrar el ${subject}.`}
          </p>
        </div>
        {state.message && (
          <p
            role={state.success ? "status" : "alert"}
            className={`alert ${state.success ? "alert-success" : "alert-error"}`}
          >
            {state.message}
          </p>
        )}
        <form
          key={JSON.stringify(input ?? null)}
          action={action}
          className="grid max-w-full gap-6"
          autoComplete="on"
        >
          <fieldset className="grid min-w-0 gap-5">
            <legend className="mb-4 text-base font-semibold">
              Identificación
            </legend>
            <div className="grid gap-2">
              <label htmlFor="name" className="font-medium">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                className="input border-stc-border bg-stc-field text-stc-text hover:border-stc-focus focus-visible:border-stc-focus min-h-12 w-full rounded-2xl border text-base outline-0"
                required
                minLength={3}
                maxLength={100}
                defaultValue={input?.name}
                autoComplete="name"
                aria-invalid={Boolean(error("name"))}
                aria-describedby={error("name") ? "name-error" : undefined}
              />
              {error("name") && (
                <p id="name-error" className="text-error text-sm">
                  {error("name")}
                </p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="docType" className="font-medium">
                  Tipo de documento
                </label>
                <SelectField
                  id="docType"
                  name="docType"
                  required
                  defaultValue={input?.docType ?? ""}
                  placeholder="Selecciona un tipo de documento"
                  aria-invalid={Boolean(error("docType"))}
                  aria-describedby={
                    error("docType") ? "docType-error" : undefined
                  }
                  options={[
                    { value: "CC", label: "Cédula de ciudadanía" },
                    { value: "CE", label: "Cédula de extranjería" },
                    { value: "NIT", label: "NIT" },
                  ]}
                />
                {error("docType") && (
                  <p id="docType-error" className="text-error text-sm">
                    {error("docType")}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="docNumber" className="font-medium">
                  Número de documento
                </label>
                <input
                  id="docNumber"
                  name="docNumber"
                  className="input border-stc-border bg-stc-field text-stc-text hover:border-stc-focus focus-visible:border-stc-focus min-h-12 w-full rounded-2xl border text-base outline-0"
                  required
                  minLength={5}
                  maxLength={100}
                  inputMode="numeric"
                  onKeyDown={onlyNumberInput}
                  defaultValue={input?.docNumber}
                  aria-invalid={Boolean(error("docNumber"))}
                  aria-describedby={
                    error("docNumber") ? "docNumber-error" : undefined
                  }
                />
                {error("docNumber") && (
                  <p id="docNumber-error" className="text-error text-sm">
                    {error("docNumber")}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="expeditionPlace" className="font-medium">
                Lugar de expedición{" "}
                <span className="text-stc-muted font-normal">(opcional)</span>
              </label>
              <input
                id="expeditionPlace"
                name="expeditionPlace"
                className="input border-stc-border bg-stc-field text-stc-text hover:border-stc-focus focus-visible:border-stc-focus min-h-12 w-full rounded-2xl border text-base outline-0"
                minLength={2}
                maxLength={10}
                defaultValue={input?.expeditionPlace ?? ""}
                autoComplete="address-level2"
                aria-invalid={Boolean(error("expeditionPlace"))}
                aria-describedby={
                  error("expeditionPlace") ? "expeditionPlace-error" : undefined
                }
              />
              {error("expeditionPlace") && (
                <p id="expeditionPlace-error" className="text-error text-sm">
                  {error("expeditionPlace")}
                </p>
              )}
            </div>
          </fieldset>
          <fieldset className="border-stc-border grid min-w-0 gap-5 border-t pt-6">
            <legend className="px-1 text-base font-semibold">Contacto</legend>
            <div className="grid gap-2">
              <label htmlFor="telephone" className="font-medium">
                Teléfono{" "}
                <span className="text-stc-muted font-normal">(opcional)</span>
              </label>
              <input
                id="telephone"
                name="telephone"
                className="input border-stc-border bg-stc-field text-stc-text hover:border-stc-focus focus-visible:border-stc-focus min-h-12 w-full rounded-2xl border text-base outline-0"
                minLength={10}
                maxLength={10}
                inputMode="tel"
                onKeyDown={onlyNumberInput}
                defaultValue={input?.telephone ?? ""}
                autoComplete="tel"
                aria-invalid={Boolean(error("telephone"))}
                aria-describedby={
                  error("telephone") ? "telephone-error" : undefined
                }
              />
              {error("telephone") && (
                <p id="telephone-error" className="text-error text-sm">
                  {error("telephone")}
                </p>
              )}
            </div>
          </fieldset>
          <button
            type="submit"
            className="bg-stc-accent text-stc-ink hover:bg-stc-accent-hover focus-visible:border-stc-focus min-h-12 w-full rounded-xl border border-transparent px-5 font-semibold disabled:opacity-50 sm:w-fit"
            disabled={pending}
          >
            {pending
              ? "Guardando…"
              : `${editing ? "Actualizar" : "Crear"} ${subject}`}
          </button>
        </form>
      </div>
    </section>
  );
}
