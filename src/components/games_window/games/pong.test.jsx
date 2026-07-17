import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Pong, {
  getFrameScale,
  getServeDirectionAfterPoint,
  getSweptPaddleCollision,
} from "./pong";

const createCanvasContext = () => ({
  arc: vi.fn(),
  beginPath: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  setLineDash: vi.fn(),
  stroke: vi.fn(),
});

describe("Pong service countdown", () => {
  let context;
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
    vi.useFakeTimers();
    context = createCanvasContext();
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(context);
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = vi.fn(() => 1);
    window.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    vi.useRealTimers();
  });

  test("counts down from three before starting the service", () => {
    render(<Pong isActive />);

    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));
    expect(screen.getByText("Service dans 3")).toBeInTheDocument();
    expect(context.fillText).toHaveBeenCalledWith("3", 320, 230);

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Service dans 2")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Service dans 1")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Premier à 5")).toBeInTheDocument();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  test("restarts the countdown when a game is relaunched", () => {
    render(<Pong isActive />);
    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("Service dans 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Recommencer" }));
    expect(screen.getByText("Service dans 3")).toBeInTheDocument();
  });

  test("normalizes movement speed across refresh rates", () => {
    expect(getFrameScale(1000, null)).toBe(1);
    expect(getFrameScale(1000 + 1000 / 60, 1000)).toBeCloseTo(1);
    expect(getFrameScale(1000 + 1000 / 120, 1000)).toBeCloseTo(0.5);
    expect(getFrameScale(1000 + 1000 / 30, 1000)).toBeCloseTo(2);
    expect(getFrameScale(5000, 1000)).toBe(3);
  });

  test("detects a paddle crossed between two high-speed frames", () => {
    expect(
      getSweptPaddleCollision({
        previousBall: { x: 90, y: 170 },
        currentBall: { x: 10, y: 170 },
        paddleY: 145,
        side: "player",
      })
    ).toEqual({ x: 40, y: 170 });

    expect(
      getSweptPaddleCollision({
        previousBall: { x: 550, y: 180 },
        currentBall: { x: 630, y: 200 },
        paddleY: 145,
        side: "computer",
      })
    ).toEqual({ x: 600, y: 192.5 });
  });

  test("does not report a swept collision outside the paddle", () => {
    expect(
      getSweptPaddleCollision({
        previousBall: { x: 90, y: 280 },
        currentBall: { x: 10, y: 280 },
        paddleY: 145,
        side: "player",
      })
    ).toBeNull();
  });

  test("serves toward the player who conceded the previous point", () => {
    expect(getServeDirectionAfterPoint(-1)).toBe(-1);
    expect(getServeDirectionAfterPoint(641)).toBe(1);
  });
});
