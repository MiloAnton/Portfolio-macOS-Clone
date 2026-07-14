import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Snake, {
  createFood,
  getMoveInterval,
  SNAKE_BEST_SCORE_KEY,
} from "./snake";

const createCanvasContext = () => ({
  arc: jest.fn(),
  beginPath: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  lineTo: jest.fn(),
  moveTo: jest.fn(),
  stroke: jest.fn(),
});

describe("Snake", () => {
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    getContextSpy = jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(createCanvasContext());
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = jest.fn(() => 1);
    window.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    jest.useRealTimers();
  });

  test("always creates food outside the snake", () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];

    expect(createFood(snake, () => 0)).toEqual({ x: 3, y: 0 });
    expect(snake).not.toContainEqual(createFood(snake, () => 0.5));
  });

  test("accelerates progressively while keeping a playable speed floor", () => {
    expect(getMoveInterval(0)).toBe(115);
    expect(getMoveInterval(5)).toBe(105);
    expect(getMoveInterval(100)).toBe(55);
  });

  test("loads the record and supports countdown, pause and wall mode", () => {
    localStorage.setItem(SNAKE_BEST_SCORE_KEY, "12");
    render(<Snake isActive />);

    expect(screen.getByText("Score 0 · Record 12")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));
    expect(screen.getByText("Départ dans 3")).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText("Niveau 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
    expect(screen.getByText("En pause")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Reprendre/ }));
    expect(screen.getByText("Niveau 1")).toBeInTheDocument();

    const wallMode = screen.getByRole("button", {
      name: /Traversée des murs/,
    });
    expect(wallMode).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(wallMode);
    expect(wallMode).toHaveAttribute("aria-pressed", "true");
  });
});
