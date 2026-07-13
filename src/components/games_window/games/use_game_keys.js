import { useEffect, useRef } from "react";

const BLOCKED_BROWSER_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  " ",
]);

export default function useGameKeys(isEnabled) {
  const keys = useRef({});

  useEffect(() => {
    // Une fenêtre Jeux inactive ne doit jamais voler le scroll ou les touches
    // utilisées par le Terminal et les autres applications.
    if (!isEnabled) return undefined;

    const handleKeyDown = (event) => {
      if (BLOCKED_BROWSER_KEYS.has(event.key)) {
        event.preventDefault();
      }
      keys.current[event.key] = true;
    };

    const handleKeyUp = (event) => {
      keys.current[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      keys.current = {};
    };
  }, [isEnabled]);

  return keys;
}
