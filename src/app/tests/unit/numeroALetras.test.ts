import { describe, expect, it } from "vitest";
import { convertirNumeroALetras } from "../../../lib/numeroALetras";

describe("conversión de valores para el PDF", () => {
  it.each([
    [0, "cero pesos"],
    [1, "un peso"],
    [100, "cien pesos"],
    [1000, "mil pesos"],
    [2, "dos pesos"],
  ])("convierte %i a %s", (valor, esperado) => {
    expect(convertirNumeroALetras(valor)).toBe(esperado);
  });
});
