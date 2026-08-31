import { describe, expect, it } from "vitest";
import publicCourse from "../src/data/public-course.json";
import privateCourse from "../shared/course-solutions.json";
import { validateAnswer, validateCourseDataset } from "../shared/validation.mjs";

describe("kursusdata fra Excel", () => {
  it("indeholder 15 bilag og 42 bogføringslinjer med de aftalte kontroltal", () => {
    const validation = validateCourseDataset(publicCourse, privateCourse);
    expect(validation.issues).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(validation.totals).toEqual({
      postingCount: 42,
      debitOre: 16042500,
      creditOre: 16042500,
      outputVatOre: 1075000,
      inputVatOre: 1437500,
      netVatReceivableOre: 362500,
    });
  });

  it.each(privateCourse.solutions.map((solution) => [solution.voucherId, solution]))("accepterer det korrekte facit for bilag %i", (_id, solution) => {
    expect(validateAnswer(solution, solution.entries, 1).correct).toBe(true);
  });

  it.each(privateCourse.solutions.map((solution) => [solution.voucherId, solution]))("afviser forkert side i bilag %i", (_id, solution) => {
    const wrong = solution.entries.map((entry, index) => index === 0 ? {...entry, side: entry.side === "debit" ? "credit" : "debit"} : entry);
    expect(validateAnswer(solution, wrong, 1).correct).toBe(false);
  });

  it.each(privateCourse.solutions.map((solution) => [solution.voucherId, solution]))("afviser forkert beløb i bilag %i", (_id, solution) => {
    const wrong = solution.entries.map((entry, index) => index === 0 ? {...entry, amountOre: entry.amountOre + 1} : entry);
    expect(validateAnswer(solution, wrong, 1).correct).toBe(false);
  });

  it.each(privateCourse.solutions.map((solution) => [solution.voucherId, solution]))("afviser manglende postering i bilag %i", (_id, solution) => {
    expect(validateAnswer(solution, solution.entries.slice(1), 1).correct).toBe(false);
  });

  it("bruger de præcise kontonavne fra kontoplanen", () => {
    const expectedAccounts = {
      1010: "Salg af varer/ydelser m/moms",
      1330: "Vareforbrug",
      2800: "Annoncer og reklame",
      3130: "Vægtafgift",
      3410: "Husleje",
      3430: "Vedligeholdelse og rengøring",
      3600: "Kontorartikler og tryksager",
      3610: "Rep./vedligeholdelse af inventar",
      3617: "Mindre anskaffelser",
      3621: "Internetforbindelse",
      3628: "Porto og gebyrer",
      3640: "Revisor",
      5520: "Varelager",
      5600: "Debitorer",
      5820: "Bankkonto",
      6750: "Kassekredit",
      6902: "Udgående (salg) moms",
      6903: "Indgående (køb) moms",
    } as Record<number, string>;
    const actual = Object.fromEntries(publicCourse.vouchers.flatMap((voucher) => voucher.accounts).map((account) => [account.number, account.name]));
    expect(actual).toEqual(expectedAccounts);
  });

  it("bogfører bilag 13 som kreditsalg på Debitorer uden Bankkonto", () => {
    const voucher = publicCourse.vouchers.find((item) => item.id === 13)!;
    const solution = privateCourse.solutions.find((item) => item.voucherId === 13)!;
    expect(voucher).toMatchObject({
      date: "2025-01-27",
      amountOre: 2250000,
      vatContext: "Momspligtigt salg. Salgsmoms udgør 4.500 kr.",
    });
    expect(voucher.text).toContain("Kunden får fakturaen til betaling senere");
    expect(voucher.accounts).toEqual([
      {number: 5600, name: "Debitorer"},
      {number: 1010, name: "Salg af varer/ydelser m/moms"},
      {number: 6902, name: "Udgående (salg) moms"},
    ]);
    expect(voucher.accounts.some((account) => account.number === 5820)).toBe(false);
    expect(solution.entries).toEqual([
      {accountNumber: 5600, side: "debit", amountOre: 2250000},
      {accountNumber: 1010, side: "credit", amountOre: 1800000},
      {accountNumber: 6902, side: "credit", amountOre: 450000},
    ]);
    expect(solution.hints.join(" ")).toMatch(/fakturaen udstedes.*betaler senere/i);
    expect(solution.explanation).toContain("Debet og kredit er begge 22.500,00 kr.");
    expect(validateAnswer(solution, solution.entries, 1)).toMatchObject({correct: true, balanced: true});
  });

  it("bogfører bilag 14 med 8.125 kr. og korrekt købsmoms", () => {
    const voucher = publicCourse.vouchers.find((item) => item.id === 14)!;
    const solution = privateCourse.solutions.find((item) => item.voucherId === 14)!;
    expect(voucher).toMatchObject({
      date: "2025-01-29",
      amountOre: 812500,
      vatContext: "Fuldt momsfradrag. Købsmoms udgør 1.625 kr.",
    });
    expect(voucher.text).toContain("8.125 kr.");
    expect(voucher.text).not.toContain("6.250 kr.");
    expect(solution.entries).toEqual([
      {accountNumber: 3610, side: "debit", amountOre: 650000},
      {accountNumber: 6903, side: "debit", amountOre: 162500},
      {accountNumber: 6750, side: "credit", amountOre: 812500},
    ]);
    expect(solution.explanation).toContain("Debet og kredit er begge 8.125,00 kr.");
    expect(validateAnswer(solution, solution.entries, 1)).toMatchObject({correct: true, balanced: true});
  });

  it("bevarer bilag 15 uændret som ompostering uden betaling og ny moms", () => {
    const voucher = publicCourse.vouchers.find((item) => item.id === 15)!;
    const solution = privateCourse.solutions.find((item) => item.voucherId === 15)!;
    expect(voucher.amountOre).toBe(3000000);
    expect(voucher.vatContext).toBe("Ingen ny momsbehandling. Momsen blev behandlet ved varekøbet.");
    expect(solution.entries).toEqual([
      {accountNumber: 1330, side: "debit", amountOre: 3000000},
      {accountNumber: 5520, side: "credit", amountOre: 3000000},
    ]);
  });

  it("leverer debitorer og salg på kredit til afslutningsskærmens faglige områder", () => {
    const learningAreas = new Set(publicCourse.vouchers.flatMap((voucher) => voucher.learningAreas));
    expect(learningAreas).toContain("debitorer");
    expect(learningAreas).toContain("salg på kredit");
  });
});
