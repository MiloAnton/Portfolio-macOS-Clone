import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CalculatorWindow from "./calculator_window";

const press = (...labels) => {
  labels.forEach((label) => {
    fireEvent.click(screen.getByRole("button", { name: label }));
  });
};

const result = () => screen.getByLabelText("Résultat");

describe("CalculatorWindow", () => {
  let originalClipboard;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
    jest.restoreAllMocks();
  });

  test("highlights the selected operator until the calculation is resolved", () => {
    render(<CalculatorWindow />);
    press("8", "+");

    const addButton = screen.getByRole("button", { name: "+" });
    expect(addButton).toHaveClass("selected");
    expect(addButton).toHaveAttribute("aria-pressed", "true");

    press("2", "=");
    expect(addButton).not.toHaveClass("selected");
    expect(result()).toHaveTextContent("10");
  });

  test("repeats the last operation on successive equals presses", () => {
    render(<CalculatorWindow />);
    press("2", "+", "3", "=", "=", "=");
    expect(result()).toHaveTextContent("11");
  });

  test("handles chained calculations and replaces a pending operator", () => {
    render(<CalculatorWindow />);
    press("2", "+", "3", "×", "4", "=");
    expect(result()).toHaveTextContent("20");

    press("AC", "8", "+", "×", "2", "=");
    expect(result()).toHaveTextContent("16");
  });

  test("uses relative percentages for addition and fractional percentages for multiplication", () => {
    render(<CalculatorWindow />);
    press("2", "0", "0", "+", "1", "0", "%");
    expect(result()).toHaveTextContent("20");
    expect(screen.getByText("10 % de 200")).toBeInTheDocument();
    press("=");
    expect(result()).toHaveTextContent("220");

    press("AC", "2", "0", "0", "×", "1", "0", "%", "=");
    expect(result()).toHaveTextContent("20");

    press("AC", "5", "0", "%");
    expect(result()).toHaveTextContent("0,5");
  });

  test("reports division by zero and starts a clean calculation afterward", () => {
    render(<CalculatorWindow />);
    press("8", "÷", "0", "=");
    expect(result()).toHaveTextContent("Erreur");
    expect(screen.getByText("Division par zéro impossible")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copier le résultat" })
    ).toBeDisabled();

    press("7", "=");
    expect(result()).toHaveTextContent("7");
  });

  test("supports memory add, subtract, recall and clear", () => {
    render(<CalculatorWindow />);
    press("8", "M+");
    expect(screen.getByText("M", { selector: ".memory-indicator" })).toHaveClass(
      "visible"
    );

    press("AC", "3", "M−", "AC", "MR");
    expect(result()).toHaveTextContent("5");
    press("MC");
    expect(
      screen.getByText("M", { selector: ".memory-indicator" })
    ).not.toHaveClass("visible");
  });

  test("copies the raw numerical result through the Clipboard API", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CalculatorWindow />);
    press("4", "2");

    fireEvent.click(
      screen.getByRole("button", { name: "Copier le résultat" })
    );
    expect(await screen.findByText("Résultat copié")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("42");
  });

  test("keeps one stable keyboard listener and mirrors physical key presses", () => {
    const addEventListener = jest.spyOn(window, "addEventListener");
    render(<CalculatorWindow isActive isVisible />);
    expect(
      addEventListener.mock.calls.filter(([eventName]) => eventName === "keydown")
    ).toHaveLength(1);

    fireEvent.keyDown(window, { key: "7" });
    const sevenButton = screen.getByRole("button", { name: "7" });
    expect(sevenButton).toHaveClass("keyboard-pressed");
    expect(result()).toHaveTextContent("7");
    expect(
      addEventListener.mock.calls.filter(([eventName]) => eventName === "keydown")
    ).toHaveLength(1);

    fireEvent.keyUp(window, { key: "7" });
    expect(sevenButton).not.toHaveClass("keyboard-pressed");
  });

  test("ignores physical keyboard input while the window is inactive", () => {
    render(<CalculatorWindow isActive={false} isVisible />);
    fireEvent.keyDown(window, { key: "9" });
    expect(result()).toHaveTextContent("0");
  });
});
