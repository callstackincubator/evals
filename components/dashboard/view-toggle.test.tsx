import { fireEvent, render, screen } from "@testing-library/react";
import { ViewToggle } from "@/components/dashboard/view-toggle";

describe("ViewToggle", () => {
  it("switches between chart, table, and cost", () => {
    let mode: "chart" | "table" | "cost" = "chart";

    const handleChange = (nextMode: "chart" | "table" | "cost") => {
      mode = nextMode;
    };

    render(<ViewToggle value={mode} onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: /table/i }));
    expect(mode).toBe("table");

    fireEvent.click(screen.getByRole("button", { name: /cost/i }));
    expect(mode).toBe("cost");
  });
});
