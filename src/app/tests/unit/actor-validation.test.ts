import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/trpc/server", () => ({
  api: { actor: { mutations: { client: { create: mocks.create } } } },
}));

import { createClient } from "../../../actions/actor.api";

function clientForm(docType: string | null) {
  const form = new FormData();
  form.set("name", "Ana Pérez");
  form.set("docNumber", "12345");
  if (docType !== null) form.set("docType", docType);
  return form;
}

describe("validación del cliente", () => {
  beforeEach(() => mocks.create.mockReset());

  it.each(["invalid", null])("rechaza el tipo de documento %s y conserva el mensaje", async (docType) => {
    const result = await createClient(null, clientForm(docType));
    expect(result.success).toBe(false);
    expect(result.errors?.docType).toEqual(["Seleccione un tipo de documento."]);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("acepta un documento válido y lo envía al servidor", async () => {
    const result = await createClient(null, clientForm("CC"));
    expect(result.success).toBe(true);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ docType: "CC", type: "client" }));
  });
});
