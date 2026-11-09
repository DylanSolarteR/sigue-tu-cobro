import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("renderiza la navegación en el servidor sin depender del navegador", async () => {
  const { default: Navbar } = await import("../../../components/Navbar");
  expect(renderToString(<Navbar />)).toContain("SigueTuCobro");
});
