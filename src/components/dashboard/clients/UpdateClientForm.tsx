"use client";

import { useActionState, useEffect, useState } from "react";
import { updateClientById, getClientById } from "@/actions/actor.api";
import { Actor } from "@/types/actor";
import { ActionResponse } from "@/types/actionResponses";
import {
  Alert,
  AlertDescription,
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { onlyNumberInput } from "@/lib/utils";
import Loading from "@/components/Loading";

const initialState: ActionResponse<Actor> = {
  success: false,
  message: "",
};

function UpdateClientForm({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [clientInitialData, setClientInitialData] = useState<Actor | null>(
    null,
  );
  const [clientExists, setClientExists] = useState(true);
  const [state, action, isPending] = useActionState(
    (prevState: ActionResponse<Actor>, formData: FormData) =>
      updateClientById(prevState, formData, id),
    initialState,
  );

  useEffect(() => {
    getClientById(id).then((res) => {
      if (res.success) {
        setClientInitialData(res.data as Actor);
        setLoading(false);
      } else {
        setClientExists(false);
        setLoading(false);
      }
    });
  }, []);
  return loading ? (
    <Loading />
  ) : clientExists ? (
    <Card className="mx-auto flex h-full w-full max-w-full flex-col overflow-auto bg-transparent">
      <CardHeader>
        <CardTitle className="text-xl">Información del cliente</CardTitle>
        <CardDescription className="brightness-75">
          Por favor cambie la información del cliente a actualizar.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                minLength={3}
                maxLength={100}
                defaultValue={state.input?.name ?? clientInitialData?.name}
                autoComplete="name"
                aria-describedby="name-error"
                className={`${state?.errors?.name ? "border-red-500" : ""} placeholder:brightness-50`}
              />
              {state?.errors?.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="docType">Tipo de documento</Label>
              <Select name="docType" defaultValue={clientInitialData?.docType}>
                <SelectTrigger>
                  <SelectValue
                    placeholder="Seleccione un tipo de documento"
                    aria-describedby="docType-error"
                    className={`${state?.errors?.docType ? "border-red-500" : ""} placeholder:brightness-50`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.docType && (
                <p id="docType-error" className="text-sm text-red-500">
                  {state.errors.docType[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="docNumber">Número de documento</Label>
              <Input
                id="docNumber"
                name="docNumber"
                placeholder="1234567890"
                required
                minLength={5}
                maxLength={100}
                onKeyDown={onlyNumberInput}
                defaultValue={
                  state.input?.docNumber ?? clientInitialData?.docNumber
                }
                autoComplete="document"
                aria-describedby="docNumber-error"
                className={`${state?.errors?.docNumber ? "border-red-500" : ""} placeholder:brightness-50`}
              />
              {state?.errors?.docNumber && (
                <p id="docNumber-error" className="text-sm text-red-500">
                  {state.errors.docNumber[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expeditionPlace">
                Lugar de expedición (Opcional)
              </Label>
              <Input
                id="expeditionPlace"
                name="expeditionPlace"
                placeholder="Bogotá"
                minLength={2}
                maxLength={10}
                defaultValue={
                  (state.input?.expeditionPlace as string) ??
                  clientInitialData?.expeditionPlace
                }
                autoComplete={"address-level-2"}
                aria-describedby="expeditionPlace-error"
                className={`${state?.errors?.expeditionPlace ? "border-red-500" : ""} placeholder:brightness-50`}
              />
              {state?.errors?.expeditionPlace && (
                <p id="expeditionPlace-error" className="text-sm text-red-500">
                  {state.errors.expeditionPlace[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Teléfono (Opcional)</Label>
              <Input
                id="telephone"
                name="telephone"
                placeholder="1234567890"
                minLength={10}
                maxLength={10}
                onKeyDown={onlyNumberInput}
                defaultValue={
                  (state.input?.telephone as string) ??
                  clientInitialData?.telephone
                }
                autoComplete={"tel"}
                aria-describedby="apartment-error"
                className={`${state?.errors?.telephone ? "border-red-500" : ""} placeholder:brightness-50`}
              />
              {state?.errors?.telephone && (
                <p id="telephone-error" className="text-sm text-red-500">
                  {state.errors.telephone[0]}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Actualizando..." : "Actualizar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  ) : (
    <Alert variant="destructive" className="w-fit">
      <AlertDescription>El cliente no existe</AlertDescription>
    </Alert>
  );
}

export default UpdateClientForm;
