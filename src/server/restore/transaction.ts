import { fingerprint, validateV2, type Dataset } from "./historical";

export interface RestoreStore {
  begin(): Promise<void>;
  read(): Promise<Dataset>;
  clear(entity: keyof Dataset): Promise<void>;
  insert(entity: keyof Dataset, rows: Dataset[keyof Dataset]): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
type RestoreResult =
  | { ok: true; value: { fingerprint: string } }
  | { ok: false; code: "REJECTED" | "ROLLED_BACK" | "COMMIT_UNCERTAIN" | "ROLLBACK_FAILED"; error: string };

/** All destructive DML shares one connection. A lost COMMIT acknowledgement is never retried. */
export async function executeRestore(store: RestoreStore, data: Dataset, expectedCurrent: string): Promise<RestoreResult> {
  const validated = validateV2(data);
  if (!validated.ok) return { ok: false, code: "REJECTED", error: validated.error };
  const expected = fingerprint(data);
  let begun = false;
  let confirming = false;
  try {
    await store.begin();
    begun = true;
    if (fingerprint(await store.read()) !== expectedCurrent) throw new Error("El destino cambió después del respaldo.");
    for (const entity of ["items", "statements", "actors"] as const) await store.clear(entity);
    for (const entity of ["actors", "statements", "items"] as const) await store.insert(entity, data[entity]);
    const actual = await store.read();
    const audit = validateV2(actual);
    if (!audit.ok || fingerprint(actual) !== expected) throw new Error("La verificación previa a COMMIT no coincide.");
    confirming = true;
    await store.commit();
    return { ok: true, value: { fingerprint: expected } };
  } catch {
    if (confirming) return { ok: false, code: "COMMIT_UNCERTAIN", error: "Confirmación incierta: verificar desde una nueva conexión antes de cualquier otra escritura." };
    if (!begun) return { ok: false, code: "REJECTED", error: "No se pudo iniciar la transacción. No se modificaron datos." };
    try {
      await store.rollback();
      return { ok: false, code: "ROLLED_BACK", error: "Restauración cancelada; la transacción se revirtió." };
    } catch {
      return { ok: false, code: "ROLLBACK_FAILED", error: "No se pudo confirmar la reversión: mantener las escrituras detenidas y verificar el destino." };
    }
  }
}
