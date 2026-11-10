import { describe, expect, it } from "vitest";
import { validateSelection, itemStatusForStatement } from "@/server/api/billing-domain";

describe("reglas de cuentas de cobro", () => {
  const item = { id: "i1", ownerId: "owner", client_id: "client", status: "pending" as const, billing_statement_id: null, isActive: true, amount: 1200 };

  it("calcula el total de ítems pendientes del cliente y propietario", () => {
    expect(validateSelection([item], ["i1"], "owner", "client")).toEqual({ ok: true, value: 1200 });
  });

  it.each([
    [[item], [], "owner", "client"],
    [[item], ["i1", "i1"], "owner", "client"],
    [[item], ["i1"], "other", "client"],
    [[item], ["i1"], "owner", "other"],
    [[{ ...item, status: "added" as const }], ["i1"], "owner", "client"],
    [[{ ...item, isActive: false }], ["i1"], "owner", "client"],
    [[item], ["i1", "missing"], "owner", "client"],
  ])("rechaza selecciones vacías, repetidas o no disponibles", (items, ids, owner, client) => {
    expect(validateSelection(items, ids, owner, client).ok).toBe(false);
  });

  it("sincroniza estados de ítems al pagar o reabrir", () => {
    expect(itemStatusForStatement("paid")).toBe("paid");
    expect(itemStatusForStatement("pending")).toBe("added");
  });
});
