import { describe, expect, it } from "vitest";
import { formatDanishCurrency, parseDanishAmount } from "../src/domain/amount";

describe("danske beløb", () => {
  it.each([
    ["12500", 1250000],
    ["12.500", 1250000],
    ["12.500,00", 1250000],
    ["12.500,50 kr.", 1250050],
    ["12500.50", 1250050],
    ["0,25", 25],
    ["", 0],
  ])("fortolker %s korrekt", (input, expectedOre) => {
    expect(parseDanishAmount(input)).toEqual({ok: true, ore: expectedOre});
  });

  it("afviser mere end to decimaler", () => {
    expect(parseDanishAmount("12,345").ok).toBe(false);
  });

  it("formaterer beløb som danske kroner", () => {
    expect(formatDanishCurrency(1250050)).toMatch(/12\.500,50\s*kr\./);
  });
});
