import { useEffect, useReducer, useState } from "react";
import version from "../../../package.json";
import "./calculator_window.scss";

const OPERATIONS = {
  "+": (left, right) => left + right,
  "−": (left, right) => left - right,
  "×": (left, right) => left * right,
  "÷": (left, right) => (right === 0 ? null : left / right),
};

const MAX_INPUT_DIGITS = 10;

export const initialCalculatorState = {
  display: "0",
  accumulator: null,
  pendingOperation: null,
  waitingForOperand: false,
  repeatedOperation: null,
  memory: 0,
  hint: "",
  hasError: false,
};

export const formatValue = (value) => {
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

const calculate = (left, right, operation) => {
  const result = OPERATIONS[operation]?.(left, right);
  return result === null || !Number.isFinite(result) ? null : result;
};

const getCalculationErrorHint = (operation, right) =>
  operation === "÷" && right === 0
    ? "Division par zéro impossible"
    : "Résultat hors limites";

const errorState = (state, hint) => ({
  ...state,
  display: "Erreur",
  accumulator: null,
  pendingOperation: null,
  waitingForOperand: true,
  repeatedOperation: null,
  hint,
  hasError: true,
});

const resetCalculation = (state) => ({
  ...initialCalculatorState,
  memory: state.memory,
});

const digitCount = (display) => display.replace(/[-.]/g, "").length;

export function calculatorReducer(state, action) {
  switch (action.type) {
    case "INPUT_DIGIT": {
      const startsNewValue = state.hasError || state.waitingForOperand;
      if (!startsNewValue && digitCount(state.display) >= MAX_INPUT_DIGITS) {
        return state;
      }

      const display = startsNewValue
        ? action.digit
        : state.display === "0"
          ? action.digit
          : `${state.display}${action.digit}`;
      return {
        ...state,
        display,
        accumulator: state.hasError ? null : state.accumulator,
        pendingOperation: state.hasError ? null : state.pendingOperation,
        waitingForOperand: false,
        repeatedOperation:
          state.pendingOperation && !state.hasError
            ? state.repeatedOperation
            : null,
        hint: "",
        hasError: false,
      };
    }

    case "INPUT_DECIMAL": {
      if (state.hasError || state.waitingForOperand) {
        return {
          ...state,
          display: "0.",
          accumulator: state.hasError ? null : state.accumulator,
          pendingOperation: state.hasError ? null : state.pendingOperation,
          waitingForOperand: false,
          repeatedOperation: null,
          hint: "",
          hasError: false,
        };
      }
      if (state.display.includes(".")) return state;
      return { ...state, display: `${state.display}.`, hint: "" };
    }

    case "CHOOSE_OPERATION": {
      if (state.hasError) return resetCalculation(state);

      if (state.pendingOperation && state.waitingForOperand) {
        return {
          ...state,
          pendingOperation: action.operation,
          repeatedOperation: null,
          hint: "",
        };
      }

      const inputValue = Number(state.display);
      let accumulator = inputValue;
      let display = state.display;
      if (state.accumulator !== null && state.pendingOperation) {
        const result = calculate(
          state.accumulator,
          inputValue,
          state.pendingOperation
        );
        if (result === null) {
          return errorState(
            state,
            getCalculationErrorHint(state.pendingOperation, inputValue)
          );
        }
        accumulator = result;
        display = formatValue(result);
      }

      return {
        ...state,
        display,
        accumulator,
        pendingOperation: action.operation,
        waitingForOperand: true,
        repeatedOperation: null,
        hint: "",
      };
    }

    case "EQUALS": {
      if (state.hasError) return state;

      let operation = state.pendingOperation;
      let left = state.accumulator;
      let right = Number(state.display);
      if (!operation && state.repeatedOperation) {
        operation = state.repeatedOperation.operation;
        left = Number(state.display);
        right = state.repeatedOperation.operand;
      }
      if (!operation || left === null) return state;

      const result = calculate(left, right, operation);
      if (result === null) {
        return errorState(state, getCalculationErrorHint(operation, right));
      }

      return {
        ...state,
        display: formatValue(result),
        accumulator: null,
        pendingOperation: null,
        waitingForOperand: true,
        repeatedOperation: { operation, operand: right },
        hint: getEasterEgg(result),
        hasError: false,
      };
    }

    case "TOGGLE_SIGN": {
      if (state.hasError || state.display === "0") return state;
      const value = Number(state.display) * -1;
      return {
        ...state,
        display: formatValue(value),
        waitingForOperand: false,
        repeatedOperation: state.pendingOperation
          ? state.repeatedOperation
          : null,
        hint: "",
      };
    }

    case "PERCENTAGE": {
      if (state.hasError) return state;
      const inputValue = Number(state.display);
      const isRelativePercentage =
        state.accumulator !== null &&
        ["+", "−"].includes(state.pendingOperation);
      const result = isRelativePercentage
        ? (state.accumulator * inputValue) / 100
        : inputValue / 100;
      return {
        ...state,
        display: formatValue(result),
        waitingForOperand: false,
        repeatedOperation: null,
        hint: isRelativePercentage
          ? `${inputValue} % de ${formatValue(state.accumulator)}`
          : `${inputValue} ÷ 100`,
      };
    }

    case "BACKSPACE": {
      if (state.waitingForOperand || state.hasError) return state;
      const display =
        state.display.length > 1
          ? state.display.slice(0, -1)
          : "0";
      return {
        ...state,
        display: display === "-" ? "0" : display,
        hint: "",
      };
    }

    case "CLEAR":
      return resetCalculation(state);

    case "MEMORY_CLEAR":
      return { ...state, memory: 0, hint: "Mémoire effacée" };

    case "MEMORY_ADD": {
      if (state.hasError) return state;
      const memory = state.memory + Number(state.display);
      return {
        ...state,
        memory,
        hint: `Mémoire : ${formatValue(memory)}`,
      };
    }

    case "MEMORY_SUBTRACT": {
      if (state.hasError) return state;
      const memory = state.memory - Number(state.display);
      return {
        ...state,
        memory,
        hint: `Mémoire : ${formatValue(memory)}`,
      };
    }

    case "MEMORY_RECALL":
      return {
        ...state,
        display: formatValue(state.memory),
        waitingForOperand: !state.pendingOperation,
        repeatedOperation: null,
        hint: `Mémoire : ${formatValue(state.memory)}`,
        hasError: false,
      };

    case "SET_HINT":
      return { ...state, hint: action.hint };

    default:
      return state;
  }
}

const KEYBOARD_ACTIONS = {
  ".": { label: ",", action: { type: "INPUT_DECIMAL" } },
  ",": { label: ",", action: { type: "INPUT_DECIMAL" } },
  "+": { label: "+", action: { type: "CHOOSE_OPERATION", operation: "+" } },
  "-": { label: "−", action: { type: "CHOOSE_OPERATION", operation: "−" } },
  "*": { label: "×", action: { type: "CHOOSE_OPERATION", operation: "×" } },
  "/": { label: "÷", action: { type: "CHOOSE_OPERATION", operation: "÷" } },
  "%": { label: "%", action: { type: "PERCENTAGE" } },
  Enter: { label: "=", action: { type: "EQUALS" } },
  "=": { label: "=", action: { type: "EQUALS" } },
  Escape: { label: "AC", action: { type: "CLEAR" } },
  Backspace: { label: "Backspace", action: { type: "BACKSPACE" } },
};

const getKeyboardAction = (key) => {
  if (/^[0-9]$/.test(key)) {
    return { label: key, action: { type: "INPUT_DIGIT", digit: key } };
  }
  return KEYBOARD_ACTIONS[key] || null;
};

const KEYPAD_BUTTONS = [
  { label: "AC", action: { type: "CLEAR" }, type: "utility" },
  { label: "+/−", action: { type: "TOGGLE_SIGN" }, type: "utility" },
  { label: "%", action: { type: "PERCENTAGE" }, type: "utility" },
  { label: "÷", action: { type: "CHOOSE_OPERATION", operation: "÷" }, type: "operator" },
  ...["7", "8", "9"].map((digit) => ({
    label: digit,
    action: { type: "INPUT_DIGIT", digit },
  })),
  { label: "×", action: { type: "CHOOSE_OPERATION", operation: "×" }, type: "operator" },
  ...["4", "5", "6"].map((digit) => ({
    label: digit,
    action: { type: "INPUT_DIGIT", digit },
  })),
  { label: "−", action: { type: "CHOOSE_OPERATION", operation: "−" }, type: "operator" },
  ...["1", "2", "3"].map((digit) => ({
    label: digit,
    action: { type: "INPUT_DIGIT", digit },
  })),
  { label: "+", action: { type: "CHOOSE_OPERATION", operation: "+" }, type: "operator" },
  { label: "0", action: { type: "INPUT_DIGIT", digit: "0" }, type: "zero" },
  { label: ",", action: { type: "INPUT_DECIMAL" } },
  { label: "=", action: { type: "EQUALS" }, type: "operator equals" },
];

const MEMORY_BUTTONS = [
  { label: "MC", action: { type: "MEMORY_CLEAR" } },
  { label: "M+", action: { type: "MEMORY_ADD" } },
  { label: "M−", action: { type: "MEMORY_SUBTRACT" } },
  { label: "MR", action: { type: "MEMORY_RECALL" } },
];

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export default function CalculatorWindow({
  isActive = true,
  isVisible = true,
}) {
  const [state, dispatch] = useReducer(
    calculatorReducer,
    initialCalculatorState
  );
  const [pressedKeys, setPressedKeys] = useState(() => new Set());

  useEffect(() => {
    if (!isActive || !isVisible) {
      setPressedKeys(new Set());
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const keyboardAction = getKeyboardAction(event.key);
      if (!keyboardAction) return;
      event.preventDefault();
      dispatch(keyboardAction.action);
      setPressedKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        nextKeys.add(keyboardAction.label);
        return nextKeys;
      });
    };

    const handleKeyUp = (event) => {
      const keyboardAction = getKeyboardAction(event.key);
      if (!keyboardAction) return;
      setPressedKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        nextKeys.delete(keyboardAction.label);
        return nextKeys;
      });
    };

    const releaseAllKeys = () => setPressedKeys(new Set());
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseAllKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseAllKeys);
    };
  }, [isActive, isVisible]);

  const copyResult = async () => {
    if (state.hasError) return;
    try {
      await navigator.clipboard.writeText(state.display);
      dispatch({ type: "SET_HINT", hint: "Résultat copié" });
    } catch (error) {
      dispatch({ type: "SET_HINT", hint: "Copie indisponible" });
    }
  };

  return (
    <>
      <div className="calculator-display" aria-live="polite">
        <div className="display-status">
          <span className={`memory-indicator${state.memory !== 0 ? " visible" : ""}`}>
            M
          </span>
          <span className="calculator-hint">{state.hint || "\u00a0"}</span>
          <button
            type="button"
            aria-label="Copier le résultat"
            disabled={state.hasError}
            onClick={copyResult}
          >
            <CopyIcon />
          </button>
        </div>
        <output aria-label="Résultat">{state.display.replace(".", ",")}</output>
      </div>

      <div className="calculator-memory" aria-label="Mémoire">
        {MEMORY_BUTTONS.map((button) => (
          <button
            type="button"
            key={button.label}
            onClick={() => dispatch(button.action)}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="calculator-keypad">
        {KEYPAD_BUTTONS.map((button) => {
          const isSelectedOperator =
            button.type?.includes("operator") &&
            button.label !== "=" &&
            state.pendingOperation === button.label;
          const isKeyboardPressed = pressedKeys.has(button.label);
          return (
            <button
              type="button"
              className={`${button.type || "number"}${
                isSelectedOperator ? " selected" : ""
              }${isKeyboardPressed ? " keyboard-pressed" : ""}`}
              key={button.label}
              aria-pressed={isSelectedOperator || undefined}
              onClick={() => dispatch(button.action)}
            >
              {button.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
