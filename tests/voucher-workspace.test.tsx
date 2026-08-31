import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VoucherWorkspace } from "../src/components/VoucherWorkspace";

vi.mock("../src/api", () => ({
  checkAnswer: vi.fn().mockResolvedValue({
    correct: false,
    balanced: false,
    message: "Prøv igen",
    hint: "Et fagligt hint",
  }),
}));

const voucher = {
  id: 1,
  date: "2025-01-03",
  text: "Et testbilag med moms.",
  amountOre: 1250000,
  vatContext: "Salgsmoms udgør 2.500 kr.",
  accounts: [{number: 5820, name: "Bankkonto"}],
  learningAreas: ["bank"],
};

describe("øvelsessiden", () => {
  it("beholder momsoplysningen og formaterer ved feltets afslutning", () => {
    render(<VoucherWorkspace voucher={voucher} alreadyCompleted={false} previousAttempts={0} onAttempt={() => {}} onHintUsed={() => {}} onNext={() => {}} />);
    expect(screen.getByText(/Salgsmoms udgør 2.500 kr./)).toBeInTheDocument();
    const debit = screen.getByRole("textbox", {name: /debet/i});
    fireEvent.change(debit, {target: {value: "0"}});
    fireEvent.blur(debit);
    expect(debit).toHaveValue("0,00 kr.");
    fireEvent.change(debit, {target: {value: "2500"}});
    fireEvent.blur(debit);
    expect(debit).toHaveValue("2.500,00 kr.");
  });

  it("formaterer et uformateret beløb, når svaret kontrolleres", async () => {
    render(<VoucherWorkspace voucher={voucher} alreadyCompleted={false} previousAttempts={0} onAttempt={() => {}} onHintUsed={() => {}} onNext={() => {}} />);
    const debit = screen.getByRole("textbox", {name: /debet/i});
    fireEvent.change(debit, {target: {value: "12500"}});
    fireEvent.click(screen.getByRole("button", {name: "Kontrollér svar"}));
    await waitFor(() => expect(debit).toHaveValue("12.500,00 kr."));
  });

  it("åbner et gennemført bilag med tomme T-konti og bevaret repetitionsstatus", () => {
    render(<VoucherWorkspace voucher={voucher} alreadyCompleted={true} previousAttempts={2} onAttempt={() => {}} onHintUsed={() => {}} onNext={() => {}} />);
    expect(screen.getByText("Gennemført · repetition")).toBeInTheDocument();
    expect(screen.getByRole("textbox", {name: /debet/i})).toHaveValue("");
    expect(screen.getByRole("textbox", {name: /kredit/i})).toHaveValue("");
    expect(screen.getByRole("button", {name: "Næste bilag"})).toBeEnabled();
  });
});
