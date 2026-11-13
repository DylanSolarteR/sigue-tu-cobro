import { expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({ db: {} }));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn(async () => ({ userId: null })) }));

import { createTRPCRouter, privateProcedure } from "../../api/trpc";

it("rechaza la sesión sin identificador de usuario antes de ejecutar un procedimiento privado", async () => {
  const handler = vi.fn(() => "ok");
  const router = createTRPCRouter({ protected: privateProcedure.query(handler) });
  const caller = router.createCaller({ db: {} as never, headers: new Headers() });
  await expect(caller.protected()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  expect(handler).not.toHaveBeenCalled();
});
