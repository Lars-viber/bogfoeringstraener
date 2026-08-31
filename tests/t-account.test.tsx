import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TAccount } from "../src/components/TAccount";

describe("T-konto", () => {
  it("viser præcist kontonummer og kontonavn samt debet før kredit", () => {
    const onChange = vi.fn();
    render(<TAccount account={{number: 5820, name: "Bankkonto"}} values={{debit: "", credit: ""}} onChange={onChange} onBlur={() => {}} />);
    expect(screen.getByRole("heading", {name: "5820 Bankkonto"})).toBeInTheDocument();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveAccessibleName(/debet/i);
    expect(inputs[1]).toHaveAccessibleName(/kredit/i);
    expect(inputs[0]).toHaveValue("");
    expect(inputs[1]).toHaveValue("");
    fireEvent.change(inputs[0], {target: {value: "12500"}});
    expect(onChange).toHaveBeenCalledWith("debit", "12500");
  });
});
