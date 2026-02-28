import { fireEvent, render, screen } from "@testing-library/react";
import { ViewToggle } from "@/components/dashboard/view-toggle";

describe("ViewToggle", () => {
  it("switches between chart and table", () => {
    let mode: "chart" | "table" = "chart";

    const handleChange = (nextMode: "chart" | "table") => {
      mode = nextMode;
    };

    render(<ViewToggle value={mode} onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: /table/i }));
    expect(mode).toBe("table");
  });
});
