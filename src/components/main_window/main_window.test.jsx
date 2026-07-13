import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import MainWindow from "./main_window";

describe("MainWindow stack animation", () => {
  test("renders each section animation cascade declaratively", () => {
    const { container } = render(<MainWindow />);
    const sections = container.querySelectorAll(".iconesStack");

    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section) => {
      expect(section.children[0]).toHaveStyle({ animationDelay: "0s" });
      expect(section.children[1]).toHaveStyle({ animationDelay: "0.08s" });
    });
  });
});
