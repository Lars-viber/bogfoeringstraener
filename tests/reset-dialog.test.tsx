import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResetDialog } from "../src/components/ResetDialog";

describe("nulstilling af hele forløbet", () => {
  it("kræver en ekstra bekræftelse før nulstilling", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<ResetDialog open={true} onCancel={onCancel} onConfirm={onConfirm} />);
    expect(screen.getByRole("alertdialog", {name: "Nulstil hele forløbet?"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Annuller"}));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Ja, nulstil hele forløbet"}));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
