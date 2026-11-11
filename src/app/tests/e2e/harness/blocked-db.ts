// A stray real database import fails before a query can reach SingleStore.
export const db = new Proxy({}, { get() { throw new Error("La base real está bloqueada en E2E."); } });
