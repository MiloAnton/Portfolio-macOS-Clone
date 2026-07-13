import { useEffect, useState } from "react";
import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";
import version from "../../../package.json";
import "./calculator_window.scss";

const operations = {
  "+": (a, b) => a + b,
  "−": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => (b === 0 ? NaN : a / b),
};

const formatValue = (value) => {
  if (!Number.isFinite(value)) return "Erreur";
  const rounded = Number.parseFloat(value.toPrecision(10));
  const text = String(rounded);
  return text.length > 12 ? rounded.toExponential(6) : text;
};

const getEasterEgg = (value) => {
  if (value === 42) return "La réponse à tout";
  if (value === 404) return "Résultat introuvable";
  if (value === 1337) return "Mode élite activé";
  if (value === 2026) return `Portfolio v${version.version}`;
  return "";
};

export default function CalculatorWindow(props) {
  const { position, handleDragStop } = usePersistentWindowPosition(
    "calculator",
    320,
    480
  );
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState(null);
  const [pendingOperation, setPendingOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [hint, setHint] = useState("");

  const clear = () => {
    setDisplay("0");
    setStoredValue(null);
    setPendingOperation(null);
    setWaitingForOperand(false);
    setHint("");
  };

  const inputDigit = (digit) => {
    setHint("");
    if (display === "Erreur" || waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    if (display.replace("-", "").replace(".", "").length >= 10) return;
    setDisplay(display === "0" ? digit : `${display}${digit}`);
  };

  const inputDecimal = () => {
    setHint("");
    if (display === "Erreur" || waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(`${display}.`);
    }
  };

  const calculate = (left, right, operation) =>
    operations[operation]?.(left, right) ?? right;

  const chooseOperation = (operation) => {
    const inputValue = Number(display);
    if (!Number.isFinite(inputValue)) {
      clear();
      return;
    }

    if (storedValue !== null && pendingOperation && !waitingForOperand) {
      const result = calculate(storedValue, inputValue, pendingOperation);
      setDisplay(formatValue(result));
      setStoredValue(result);
    } else {
      setStoredValue(inputValue);
    }
    setPendingOperation(operation);
    setWaitingForOperand(true);
    setHint("");
  };

  const equals = () => {
    if (storedValue === null || !pendingOperation) return;
    const result = calculate(storedValue, Number(display), pendingOperation);
    const formattedResult = formatValue(result);
    setDisplay(formattedResult);
    setHint(Number.isFinite(result) ? getEasterEgg(result) : "Division impossible");
    setStoredValue(null);
    setPendingOperation(null);
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    if (display !== "0" && display !== "Erreur") {
      setDisplay(formatValue(Number(display) * -1));
      setHint("");
    }
  };

  const percentage = () => {
    if (display !== "Erreur") {
      setDisplay(formatValue(Number(display) / 100));
      setHint("");
    }
  };

  const backspace = () => {
    if (waitingForOperand || display === "Erreur") return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
    setHint("");
  };

  useEffect(() => {
    // Le clavier ne doit piloter la calculatrice que si sa fenêtre a le focus.
    if (!props.isActive) return undefined;
    const handleKeyboard = (event) => {
      if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
      else if (event.key === "." || event.key === ",") inputDecimal();
      else if (event.key === "+") chooseOperation("+");
      else if (event.key === "-") chooseOperation("−");
      else if (event.key === "*") chooseOperation("×");
      else if (event.key === "/") chooseOperation("÷");
      else if (event.key === "Enter" || event.key === "=") equals();
      else if (event.key === "Escape") clear();
      else if (event.key === "Backspace") backspace();
      else return;
      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  const buttons = [
    { label: "AC", action: clear, type: "utility" },
    { label: "+/−", action: toggleSign, type: "utility" },
    { label: "%", action: percentage, type: "utility" },
    { label: "÷", action: () => chooseOperation("÷"), type: "operator" },
    ...["7", "8", "9"].map((digit) => ({ label: digit, action: () => inputDigit(digit) })),
    { label: "×", action: () => chooseOperation("×"), type: "operator" },
    ...["4", "5", "6"].map((digit) => ({ label: digit, action: () => inputDigit(digit) })),
    { label: "−", action: () => chooseOperation("−"), type: "operator" },
    ...["1", "2", "3"].map((digit) => ({ label: digit, action: () => inputDigit(digit) })),
    { label: "+", action: () => chooseOperation("+"), type: "operator" },
    { label: "0", action: () => inputDigit("0"), type: "zero" },
    { label: ",", action: inputDecimal },
    { label: "=", action: equals, type: "operator" },
  ];

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <section
        className={`App calculator-window ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={props.handleClickZIndex}
      >
        <MenuBar
          title="Calculatrice"
          handleFullscreen={props.fullScreen}
          handleQuit={props.handleClose}
        />
        <div className="calculator-display" aria-live="polite">
          <span>{hint || " "}</span>
          <output>{display.replace(".", ",")}</output>
        </div>
        <div className="calculator-keypad">
          {buttons.map((button) => (
            <button
              type="button"
              className={button.type || "number"}
              key={button.label}
              onClick={button.action}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>
    </Draggable>
  );
}
