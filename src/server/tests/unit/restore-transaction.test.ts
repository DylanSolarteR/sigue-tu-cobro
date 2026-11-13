import { expect, it, vi } from "vitest";
import { executeRestore, type RestoreStore } from "../../restore/transaction";
import { fingerprint, type Dataset } from "../../restore/historical";

function fixture(): Dataset {
  const base = { owner_id: "owner", is_active: 1, created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" };
  return {
    actors: [
      { ...base, id: "client", name: "Cliente", doc_type: "CC", doc_number: "12345", type: "client", expedition_place: null, telephone: null },
      { ...base, id: "creditor", name: "Acreedor", doc_type: "CC", doc_number: "67890", type: "creditor", expedition_place: null, telephone: null },
    ],
    statements: [{ ...base, id: "account", client_id: "client", creditor_id: "creditor", amount: 1000, extra_info: "", status: "pending", show_item_amount: 0, pay_date: "2026-01-01" }],
    items: [{ ...base, id: "item", client_id: "client", billing_statement_id: "account", status: "added", desc: "Servicio", amount: 1000 }],
  };
}
function fakeStore(initial: Dataset = { actors: [], statements: [], items: [] }) {
  let current = structuredClone(initial);
  let snapshot = structuredClone(initial);
  const store = {
    begin: vi.fn(async () => { snapshot = structuredClone(current); }),
    read: vi.fn(async () => structuredClone(current)),
    clear: vi.fn(async (key: keyof Dataset) => { current[key] = []; }),
    insert: vi.fn(async (key: keyof Dataset, rows: Dataset[keyof Dataset]) => { current[key].push(...structuredClone(rows)); }),
    commit: vi.fn(async () => undefined),
    rollback: vi.fn(async () => { current = structuredClone(snapshot); }),
  } satisfies RestoreStore;
  return { store, data: () => current };
}
it("sustituye todas las entidades y verifica los datos antes de confirmar", async () => {
  const { store, data } = fakeStore();
  const result = await executeRestore(store, fixture(), fingerprint(data()));
  expect(result.ok).toBe(true);
  expect(data()).toEqual(fixture());
  expect(store.clear.mock.calls.map(([key]) => key)).toEqual(["items", "statements", "actors"]);
  expect(store.insert.mock.calls.map(([key]) => key)).toEqual(["actors", "statements", "items"]);
  expect(store.read.mock.invocationCallOrder.at(-1)).toBeLessThan(store.commit.mock.invocationCallOrder[0]!);
  expect(store.rollback).not.toHaveBeenCalled();
});
it.each(["clear", "insert"] as const)("revierte un fallo durante %s sin confirmar", async (operation) => {
  const { store, data } = fakeStore(fixture());
  store[operation].mockRejectedValueOnce(new Error("fallo simulado"));
  const result = await executeRestore(store, fixture(), fingerprint(data()));
  expect(result).toMatchObject({ ok: false, code: "ROLLED_BACK" });
  expect(data()).toEqual(fixture());
  expect(store.rollback).toHaveBeenCalledOnce();
  expect(store.commit).not.toHaveBeenCalled();
});
it("se detiene si el destino cambió después del respaldo", async () => {
  const { store } = fakeStore(fixture());
  expect(await executeRestore(store, fixture(), "hash-antiguo")).toMatchObject({ ok: false });
  expect(store.clear).not.toHaveBeenCalled();
  expect(store.rollback).toHaveBeenCalledOnce();
});
it("revierte si la lectura posterior a la inserción no coincide", async () => {
  const { store, data } = fakeStore();
  const hash = fingerprint(data());
  store.read.mockResolvedValueOnce(data()).mockResolvedValueOnce({ actors: [], statements: [], items: [] });
  expect(await executeRestore(store, fixture(), hash)).toMatchObject({ ok: false, code: "ROLLED_BACK" });
  expect(store.commit).not.toHaveBeenCalled();
});
it("rechaza relaciones inválidas antes de comenzar la transacción", async () => {
  const { store, data } = fakeStore();
  const invalid = fixture(); invalid.items[0]!.client_id = "unknown";
  expect(await executeRestore(store, invalid, fingerprint(data()))).toMatchObject({ ok: false, code: "REJECTED" });
  expect(store.begin).not.toHaveBeenCalled();
});
it("un fallo al confirmar exige verificar el destino y nunca reintenta", async () => {
  const { store, data } = fakeStore();
  store.commit.mockRejectedValueOnce(new Error("conexión perdida"));
  expect(await executeRestore(store, fixture(), fingerprint(data()))).toMatchObject({ ok: false, code: "COMMIT_UNCERTAIN" });
  expect(store.commit).toHaveBeenCalledOnce();
  expect(store.rollback).not.toHaveBeenCalled();
});
it("expone la necesidad de recuperación si tampoco puede revertir", async () => {
  const { store, data } = fakeStore();
  store.insert.mockRejectedValueOnce(new Error("fallo"));
  store.rollback.mockRejectedValueOnce(new Error("conexión perdida"));
  expect(await executeRestore(store, fixture(), fingerprint(data()))).toMatchObject({ ok: false, code: "ROLLBACK_FAILED" });
  expect(store.commit).not.toHaveBeenCalled();
});
