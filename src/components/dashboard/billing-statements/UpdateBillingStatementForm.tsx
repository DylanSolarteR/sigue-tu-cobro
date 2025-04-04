"use client";

import { useActionState, useEffect, useState, useMemo } from "react";
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
  Textarea,
  Checkbox,
} from "@/components/ui";
import { priceInput } from "@/lib/utils";
import Loading from "@/components/Loading";
import {
  billing_statement,
  billing_statement_item,
} from "@/types/billing-statement";
import {
  getBillingStatement,
  updateBillingStatement,
  updateBillingStatementAmount,
} from "@/actions/billing-statement.api";
import {
  createBillingStatementItem,
  deleteBillingStatementItem,
  getBillingStatementItems,
  updateBillingStatementItem,
} from "@/actions/billing-statement.item.api";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "sonner";

const initialState: ActionResponse<billing_statement> = {
  success: false,
  message: "",
};

function UpdateBillingStatmenteForm({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);

  const [BillingStatementInitialData, setBillingStatementInitialData] =
    useState<billing_statement | null>(null);

  const [bsExists, setBsExists] = useState(true);

  const [state, action, isPending] = useActionState(
    (prevState: ActionResponse<billing_statement>, formData: FormData) =>
      updateBillingStatement(
        prevState,
        formData,
        id,
        date.toISOString(),
        totalAmount,
      ),
    initialState,
  );

  const [date, setDate] = useState<Date>(new Date());

  const [isChekedItemsAmount, setIsChekedItemsAmount] = useState(false);

  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [items, setItems] = useState<billing_statement_item[]>([]);

  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.amount, 0);
    setTotalAmount(total);
  
    updateBillingStatementAmount(id, total).catch((err) => {
      console.error("Error actualizando el total:", err);
    });
  }, [items]);

  function addItem(item: billing_statement_item) {
    setItems((prevItems) => [...prevItems, item]);
  }

  async function deleteItem(idItem: string) {
    const result = await deleteBillingStatementItem(idItem);
    if (result.success) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== idItem));
      toast.success(result.message);
    } else toast.error(result.message);
  }
  async function updateItem(idItem: string, desc: string, amount: number) {
    const result = await updateBillingStatementItem(idItem, desc, amount);
    if (result.success) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === idItem ? { ...item, desc, amount } : item,
        ),
      );
      toast.success(result.message);
    } else toast.error(result.message);
  }

  async function init() {
    await getBillingStatement(id).then((res) => {
      if (res.success) {
        setBillingStatementInitialData(res.data as billing_statement);
        setIsChekedItemsAmount(res.data?.showItemAmount!);
        setDate(new Date(res.data?.payDate!));
        setLoading(false);
      } else {
        setBsExists(false);
        setLoading(false);
      }
    });
    if (!bsExists) {
      return;
    }
    await getBillingStatementItems(id).then((res) => {
      if (res.success) {
        setItems(res.data as billing_statement_item[]);
      }
    });
  }

  useEffect(() => {
    init();
  }, []);

  return loading ? (
    <Loading />
  ) : bsExists ? (
    <Card className="mx-auto flex h-full w-full max-w-full flex-col overflow-auto bg-transparent">
      <CardHeader>
        <CardTitle className="text-xl">
          Información de la cuenta de cobro
        </CardTitle>
        <CardDescription className="brightness-75">
          Por favor cambie la información de la cuenta de cobro a actualizar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex h-full flex-col gap-4">
          <ItemBuilder idBillingStatement={id} addToList={addItem} />
          <ItemList
            items={items}
            deleteItem={deleteItem}
            updateItem={updateItem}
          />
        </div>
        {state?.message && (
          <Alert
            variant={state.success ? "default" : "destructive"}
            className={`${state.success ? "border border-green-800" : "bg-background"} mb-4 flex items-center justify-start`}
          >
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <form action={action} className="w-full space-y-6" autoComplete="on">
          <div className="w-full space-y-4">
            <div className="flex w-full items-center justify-evenly space-x-4">
              <div className="mb-2 space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  name="status"
                  defaultValue={BillingStatementInitialData?.status}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue
                      placeholder="Seleccione el estado de la cuenta de cobro"
                      aria-describedby="status-error"
                      className={`${state?.errors?.status ? "border-red-500" : ""} placeholder:brightness-50`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="payed">Pagado</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.status && (
                  <p id="status-error" className="text-sm text-red-500">
                    {state.errors.status[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor total</Label>
                <Input id="amount" name="amount" disabled value={totalAmount} />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="payDate">Fecha</Label>
                <DatePicker date={date} setDate={setDate} />
              </div>
            </div>
            <div className="flex items-center justify-start gap-2">
              <Checkbox
                id="showItemAmount"
                name="showItemAmount"
                checked={isChekedItemsAmount}
                onCheckedChange={(e) =>
                  setIsChekedItemsAmount(!isChekedItemsAmount)
                }
                value={isChekedItemsAmount ? 1 : 0}
                aria-describedby="showItemAmount-error"
                className="border-accent"
              />
              <Label htmlFor="showItemAmount">
                Mostrar precio unitario de los Items
              </Label>
            </div>
            <div className="flex h-fit w-full items-center justify-start space-x-4"></div>
            <div className="space-y-2">
              <Label htmlFor="extraInfo">
                {"Información Extra (Opcional)"}
              </Label>
              <Textarea
                placeholder="Ej: Informacion de contacto, informacion de facturacion, etc."
                className="resize-none placeholder:brightness-50"
                name="extraInfo"
                defaultValue={
                  state.input?.extraInfo ??
                  BillingStatementInitialData?.extraInfo
                }
              />
              <p className="text-sm text-muted-foreground brightness-75">
                Informacion extra para agregar despues de los items.
              </p>
              {state?.errors?.extraInfo && (
                <p id="telephone-error" className="text-sm text-red-500">
                  {state.errors.extraInfo[0]}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Actualizando..." : "Actualizar Cuenta de cobro"}
          </Button>
        </form>
      </CardContent>
    </Card>
  ) : (
    <Alert variant="destructive" className="w-fit">
      <AlertDescription>La cuenta de cobro no existe</AlertDescription>
    </Alert>
  );
}

export default UpdateBillingStatmenteForm;

const initialStateItem: ActionResponse<billing_statement_item> = {
  success: false,
  message: "",
};
function ItemBuilder({
  idBillingStatement,
  addToList,
}: {
  idBillingStatement: string;
  addToList: (item: billing_statement_item) => void;
}) {
  const [state, action, isPending] = useActionState(
    (prevState: ActionResponse<billing_statement_item>, formData: FormData) =>
      createBillingStatementItem(prevState, formData, idBillingStatement),
    initialStateItem,
  );

  useEffect(() => {
    if (state.success) {
      addToList(state.data as billing_statement_item);
    }
  }, [state]);



  return (
    <form
      action={action}
      className="flex h-full w-full flex-col space-y-4 rounded-lg border p-8"
    >
      <h2 className="text-2xl">Crear Item</h2>
      {state?.message && (
        <Alert
          variant={state.success ? "default" : "destructive"}
          className={`${state.success ? "border border-green-800" : "bg-background"} mb-4 flex items-center justify-start`}
        >
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Label htmlFor="desc">Descripcion del item</Label>
      <Input
        id="desc"
        name="desc"
        placeholder="Ej: Servicio de diseño web"
        className="placeholder:brightness-50"
        defaultValue={state.input?.desc ?? ""}
      />
      {state?.errors?.desc && (
        <p id="desc-error" className="text-sm text-red-500">
          {state.errors.desc[0]}
        </p>
      )}
      <Label htmlFor="amount">Valor del item</Label>
      <Input
        className="placeholder:brightness-50"
        id="amount"
        name="amount"
        placeholder="Ej: 100000"
        onKeyDown={priceInput}
      />
      {state?.errors?.amount && (
        <p id="amount-error" className="text-sm text-red-500">
          {state.errors.amount[0]}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Crear item"}
      </Button>
    </form>
  );
}

function ItemList({
  items,
  deleteItem,
  updateItem,
}: {
  items: billing_statement_item[];
  deleteItem: (id: string) => void;
  updateItem: (id: string, desc: string, amount: number) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col space-y-4 rounded-lg border p-8">
      <h2 className="text-2xl">Items</h2>
      {items.length > 0 ? (
        <div className="flex flex-row flex-wrap items-start justify-start gap-4">
        {items.map((item) => (
          <Item
            key={item.id}
            item={item}
            deleteItem={() => deleteItem(item.id!)}
            updateItem={updateItem}
          />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground brightness-75">No hay items</p>
      )}
    </div>
  );
}

function Item({
  item,
  deleteItem,
  updateItem,
}: {
  item: billing_statement_item;
  deleteItem: () => void;
  updateItem: (id: string, desc: string, amount: number) => void;
}) {
  const [hasChanged, setHasChanged] = useState(false);
  const [description, setDescription] = useState(item.desc);
  const [amount, setAmount] = useState(String(item.amount));

  useEffect(() => {
    if (description !== item.desc || amount !== String(item.amount)) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [description, amount]);

  return (
    <Card className="mx-auto flex h-fit w-fit max-w-full flex-row overflow-auto bg-transparent">
      <CardHeader className="flex flex-row items-start justify-between">
        <CardTitle className="flex flex-col gap-2 text-lg">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`amountDesc-${item.id}`}>{"Descripción"}</Label>
            <Input
              id={`amountDesc-${item.id}`}
              name={`amountDesc-${item.id}`}
              className="placeholder:brightness-50"
              minLength={2}
              defaultValue={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`amountItem-${item.id}`}>Valor</Label>
            <Input
              id={`amountItem-${item.id}`}
              name={`amountItem-${item.id}`}
              className="placeholder:brightness-50"
              defaultValue={amount}
              minLength={2}
              maxLength={9}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={priceInput}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row gap-3">
        <div className="mt-6 flex flex-col justify-center gap-2">
          <Button onClick={deleteItem}>Eliminar</Button>
          <Button
            onClick={() => updateItem(item.id!, description, parseInt(amount))}
            disabled={!hasChanged}
          >
            Actualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
