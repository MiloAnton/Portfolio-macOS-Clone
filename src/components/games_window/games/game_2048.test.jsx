import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Game2048, {
  GAME_2048_BEST_SCORE_KEY,
  getGameStatus,
  hasAvailableMoves,
  MOVE_ANIMATION_MS,
  moveBoard,
} from "./game_2048";

const boardWithFirstRow = (row) => [
  ...row,
  ...Array(12).fill(0),
];

describe("2048", () => {
  let randomSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  test("moves and merges tiles while exposing their animation routes", () => {
    const result = moveBoard(boardWithFirstRow([2, 2, 4, 0]), "left");

    expect(result.board.slice(0, 4)).toEqual([4, 4, 0, 0]);
    expect(result.gained).toBe(4);
    expect(result.hasMoved).toBe(true);
    expect(
      result.transitions.filter(
        (transition) => transition.destinationIndex === 0
      )
    ).toHaveLength(2);
  });

  test("clearly detects victory and a full board with no legal move", () => {
    const blockedBoard = [
      2, 4, 2, 4,
      4, 2, 4, 2,
      2, 4, 2, 4,
      4, 2, 4, 2,
    ];

    expect(getGameStatus(boardWithFirstRow([2048, 0, 0, 0]))).toBe("won");
    expect(hasAvailableMoves(blockedBoard)).toBe(false);
    expect(getGameStatus(blockedBoard)).toBe("lost");
  });

  test("locks input during movement, animates tiles and saves the record", () => {
    render(<Game2048 isActive />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(screen.getByRole("button", { name: "Rejouer" })).toBeDisabled();
    act(() => vi.advanceTimersByTime(MOVE_ANIMATION_MS));

    expect(screen.getByText("Score").parentElement).toHaveTextContent("4");
    expect(localStorage.getItem(GAME_2048_BEST_SCORE_KEY)).toBe("4");
    expect(document.querySelectorAll(".grid-2048-tiles .tile")).toHaveLength(2);
    expect(document.querySelector(".tile-merged")).toHaveTextContent("4");
    expect(document.querySelector(".tile-new")).toHaveTextContent("2");
  });

  test("supports undo and touch swipes", () => {
    render(<Game2048 isActive />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    act(() => vi.advanceTimersByTime(MOVE_ANIMATION_MS));
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.getByText("Score").parentElement).toHaveTextContent("0");

    const grid = screen.getByRole("application", {
      name: "Grille de jeu 2048",
    });
    fireEvent.pointerDown(grid, { pointerId: 1, clientX: 100, clientY: 50 });
    fireEvent.pointerUp(grid, { pointerId: 1, clientX: 30, clientY: 50 });
    act(() => vi.advanceTimersByTime(MOVE_ANIMATION_MS));

    expect(screen.getByText("Score").parentElement).toHaveTextContent("4");
  });

  test("loads a persistent best score without lowering it after undo", () => {
    localStorage.setItem(GAME_2048_BEST_SCORE_KEY, "128");
    render(<Game2048 isActive />);

    expect(screen.getByText("Record").parentElement).toHaveTextContent("128");
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    act(() => vi.advanceTimersByTime(MOVE_ANIMATION_MS));
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.getByText("Record").parentElement).toHaveTextContent("128");
    expect(localStorage.getItem(GAME_2048_BEST_SCORE_KEY)).toBe("128");
  });
});
