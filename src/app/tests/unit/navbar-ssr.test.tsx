import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("renderiza la portada en el servidor sin depender del navegador", async () => {
  const { default: Home } = await import("../../page");
  expect(renderToString(await Home())).toContain("SigueTuCobro");
}, 15000);
