import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressHeader } from "../src/components/ProgressHeader";

describe("bilagsprogression", () => {
  it("låser kommende bilag og bevarer adgang til gennemførte bilag", () => {
    render(
      <ProgressHeader
        currentVoucherId={2}
        completedVoucherIds={[1]}
        highestUnlockedVoucherId={2}
        onNavigate={() => {}}
      />,
    );
    expect(screen.getByRole("button", {name: "Bilag 1, gennemført"})).toBeEnabled();
    expect(screen.getByRole("button", {name: "Bilag 2, aktuelt"})).toBeEnabled();
    expect(screen.getByRole("button", {name: "Bilag 3"})).toBeDisabled();
    expect(screen.getByRole("progressbar", {name: "Gennemførte bilag"})).toHaveAttribute("aria-valuenow", "1");
  });
});
