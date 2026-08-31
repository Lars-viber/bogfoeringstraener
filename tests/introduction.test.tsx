import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntroductionScreen } from "../src/components/IntroductionScreen";

describe("introduktionssiden", () => {
  it("forklarer moms samt debet og kredit før bilag 1", () => {
    const onStart = vi.fn();
    render(<IntroductionScreen onStart={onStart} />);
    expect(screen.getByText(/momsregistreret virksomhed/i)).toBeInTheDocument();
    expect(screen.getByText(/udgående moms/i)).toBeInTheDocument();
    expect(screen.getByText(/indgående moms/i)).toBeInTheDocument();
    expect(screen.getByText(/debet er altid venstre side/i)).toBeInTheDocument();
    expect(screen.getByText(/kredit er altid højre side/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Start med bilag 1"}));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
