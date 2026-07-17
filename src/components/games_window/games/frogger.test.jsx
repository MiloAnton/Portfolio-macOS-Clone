import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Frogger, {
  advanceFroggerMover,
  canAcceptFroggerInput,
  moveFrogByCell,
  vehicleHitsFrog,
} from "./frogger";

const createCanvasContext = () => ({
  arc: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  ellipse: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  scale: vi.fn(),
  setLineDash: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
});

describe("Frogger", () => {
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(createCanvasContext());
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = vi.fn(() => 1);
    window.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  test("normalizes vehicle movement across refresh rates", () => {
    const car = { x: 100, width: 55, speed: 120 };
    const fullStep = advanceFroggerMover(car, 1 / 60, 1);
    const firstHalf = advanceFroggerMover(car, 1 / 120, 1);
    const twoHalfSteps = advanceFroggerMover(firstHalf, 1 / 120, 1);
    expect(fullStep.x).toBeCloseTo(twoHalfSteps.x);
  });

  test("moves by exactly one row or column and snaps off a moving log", () => {
    const player = { row: 8, column: 6, offsetX: 19, hopTime: 0 };

    expect(moveFrogByCell(player, "up")).toMatchObject({
      row: 7,
      column: 6,
      offsetX: 0,
    });
    expect(moveFrogByCell(player, "right")).toMatchObject({
      row: 8,
      column: 7,
      offsetX: 0,
    });
  });

  test("rejects keyboard auto-repeat and excessively fast inputs", () => {
    expect(canAcceptFroggerInput(true, 1000, 0)).toBe(false);
    expect(canAcceptFroggerInput(false, 1050, 1000)).toBe(false);
    expect(canAcceptFroggerInput(false, 1090, 1000)).toBe(true);
  });

  test("uses swept collision without treating a wrapped car as crossing the screen", () => {
    const frog = { row: 6, column: 3, offsetX: 0, hopTime: 0 };
    const fastCar = {
      row: 6,
      previousX: 20,
      x: 210,
      width: 45,
      wrapped: false,
    };

    expect(vehicleHitsFrog(fastCar, frog)).toBe(true);
    expect(
      vehicleHitsFrog({ ...fastCar, x: -60, wrapped: true }, frog)
    ).toBe(false);
  });

  test("starts a complete game with lives, timer and case-by-case touch controls", () => {
    render(<Frogger isActive />);

    expect(screen.getByText(/0 traversée · ♥♥♥ · 30s/)).toBeInTheDocument();
    expect(screen.getByText("Niveau 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Avancer d’une case" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));
    expect(
      screen.getByRole("button", { name: "Recommencer" })
    ).toBeInTheDocument();
  });
});
