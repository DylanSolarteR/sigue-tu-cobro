"use client";

import { useActionState, useState } from "react";
import { createBillingStatement } from "@/actions/billing-statement.api";
import { ActionResponse } from "@/types/actionResponses";
import {
  Alert,
  AlertDescription,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  Input,
} from "@/components/ui";
import { DatePicker } from "@/components/DatePicker";
import { billing_statement } from "@/types/billing-statement";
import { Actor } from "@/types/actor";

const initialState: ActionResponse<billing_statement> = {
  success: false,
  message: "",
};
function ActorForm(props: { clientsList: Actor[]; creditorsList: Actor[] }) {
  const { clientsList, creditorsList } = props;
  const [state, action, isPending] = useActionState(
    (prevState: ActionResponse<billing_statement>, formData: FormData) =>
      createBillingStatement(prevState, formData, date.toISOString()),
    initialState,
  );
  const [date, setDate] = useState<Date>(new Date());
  return (
    <>
      {state?.message && (
        <Alert
          variant={state.success ? "default" : "destructive"}
          className={`${state.success ? "border border-green-800" : "bg-background"} mb-4 flex items-center justify-start`}
        >
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="space-y-6" autoComplete="on">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Select name="client">
              <SelectTrigger>
                <SelectValue
                  placeholder="Seleccione un cliente"
                  aria-describedby="client-error"
                  className={`${state?.errors?.client_id ? "border-red-500" : ""} placeholder:brightness-50`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clientsList.length !== 0 ? (
                    clientsList.map((client) => (
                      <SelectItem key={client.id} value={client.id as string}>
                        {client.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={"None"}>
                      {"No hay clientes disponibles, por favor cree uno."}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state?.errors?.client_id && (
              <p id="client-error" className="text-sm text-red-500">
                {state.errors.client_id[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditor">Acreedor</Label>
            <Select name="creditor">
              <SelectTrigger>
                <SelectValue
                  placeholder="Seleccione un acreedor"
                  aria-describedby="creditor-error"
                  className={`${state?.errors?.creditor_id ? "border-red-500" : ""} placeholder:brightness-50`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {creditorsList.length !== 0 ? (
                    creditorsList?.map((creditor) => (
                      <SelectItem
                        key={creditor.id}
                        value={creditor.id as string}
                      >
                        {creditor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={"None"}>
                      {"No hay acreedores disponibles, por favor cree uno."}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state?.errors?.creditor_id && (
              <p id="creditor-error" className="text-sm text-red-500">
                {state.errors.creditor_id[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="payDate">Fecha</Label>

            <DatePicker date={date} setDate={setDate} />
            {state?.errors?.payDate && (
              <p id="payDate-error" className="text-sm text-red-500">
                {state.errors.payDate[0]}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creando..." : "Crear Cuenta de cobro"}
        </Button>
      </form>
    </>
  );
}

export default ActorForm;
