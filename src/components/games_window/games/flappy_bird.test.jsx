import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FlappyBird, {
  circleIntersectsRect,
  FLAPPY_BEST_SCORE_KEY,
  getFlappyDifficulty,
  hasBirdPipeCollision,
  shouldScorePipe,
} from "./flappy_bird";

const createCanvasContext = () => ({
  arc: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  ellipse: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  lineTo: jest.fn(),
  moveTo: jest.fn(),
  restore: jest.fn(),
  rotate: jest.fn(),
  save: jest.fn(),
  translate: jest.fn(),
});

describe("Flappy Bird", () => {
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
    localStorage.clear();
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
  });

  test("progressively increases speed while reducing the pipe gap", () => {
    expect(getFlappyDifficulty(0)).toEqual({
      level: 1,
      pipeSpeed: 168,
      gapSize: 150,
    });
    expect(getFlappyDifficulty(10)).toEqual({
      level: 3,
      pipeSpeed: 208,
      gapSize: 130,
    });
    expect(getFlappyDifficulty(100).gapSize).toBe(112);
  });

  test("scores as soon as the bird has fully passed a pipe", () => {
    expect(shouldScorePipe({ x: 64, scored: false })).toBe(false);
    expect(shouldScorePipe({ x: 60, scored: false })).toBe(true);
    expect(shouldScorePipe({ x: 40, scored: true })).toBe(false);
  });

  test("uses a forgiving circular hitbox for detailed pipes", () => {
    const pipe = { x: 115, gapY: 180, gapSize: 140 };
    expect(
      hasBirdPipeCollision({ x: 126, y: 180, radius: 10 }, [pipe])
    ).toBe(false);
    expect(
      hasBirdPipeCollision({ x: 126, y: 95, radius: 10 }, [pipe])
    ).toBe(true);
    expect(
      circleIntersectsRect(
        { x: 20, y: 20, radius: 5 },
        { x: 30, y: 30, width: 10, height: 10 }
      )
    ).toBe(false);
  });

  test("shows the preparation screen, record and pointer controls", () => {
    localStorage.setItem(FLAPPY_BEST_SCORE_KEY, "7");
    render(<FlappyBird isActive />);

    expect(screen.getByText("0 · Record 7")).toBeInTheDocument();
    expect(screen.getByText("Prêt ?")).toBeInTheDocument();

    fireEvent.pointerDown(
      screen.getByRole("button", {
        name: "Zone de jeu Flappy Bird — cliquer pour voler",
      })
    );

    expect(screen.getByText("Niveau 1")).toBeInTheDocument();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});
