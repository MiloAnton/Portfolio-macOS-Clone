import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SpaceInvaders, {
  createEnemyFormation,
  getEnemyFireInterval,
  hasInvaderReachedDefense,
  removeOffscreenProjectiles,
  stepEnemyFormation,
} from "./space_invaders";

const createCanvasContext = () => ({
  fillRect: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  save: jest.fn(),
});

describe("Space Invaders", () => {
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
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

  test("removes both player and enemy projectiles outside the canvas", () => {
    const visible = { y: 120, height: 10, alive: true };
    const above = { y: -11, height: 10, alive: true };
    const below = { y: 361, height: 10, alive: true };
    const destroyed = { y: 200, height: 10, alive: false };

    expect(
      removeOffscreenProjectiles([visible, above, below, destroyed])
    ).toEqual([visible]);
  });

  test("turns an out-of-bounds formation only once before moving inward", () => {
    const enemy = {
      id: "edge-enemy",
      x: 610,
      y: 50,
      alive: true,
    };
    const firstStep = stepEnemyFormation([enemy], 1, 3);
    const secondStep = stepEnemyFormation(
      firstStep.enemies,
      firstStep.direction,
      3
    );

    expect(firstStep.turned).toBe(true);
    expect(firstStep.direction).toBe(-1);
    expect(firstStep.enemies[0].y).toBe(63);
    expect(secondStep.turned).toBe(false);
    expect(secondStep.direction).toBe(-1);
  });

  test("ignores a destroyed invader on the defense line", () => {
    const dangerousEnemy = { x: 100, y: 300, alive: true };

    expect(hasInvaderReachedDefense([dangerousEnemy])).toBe(true);
    expect(
      hasInvaderReachedDefense([{ ...dangerousEnemy, alive: false }])
    ).toBe(false);
  });

  test("adds denser waves, faster enemy fire and accessible touch controls", () => {
    expect(createEnemyFormation(1)).toHaveLength(24);
    expect(createEnemyFormation(4)).toHaveLength(32);
    expect(getEnemyFireInterval(6)).toBeLessThan(getEnemyFireInterval(1));

    render(<SpaceInvaders isActive />);
    expect(screen.getByText(/♥♥♥/)).toBeInTheDocument();
    expect(screen.getByText("Vague 1")).toBeInTheDocument();

    const fireButton = screen.getByRole("button", { name: "Tirer" });
    fireEvent.pointerDown(fireButton, { pointerId: 1 });
    fireEvent.pointerUp(fireButton, { pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));
    expect(screen.getByRole("button", { name: "Recommencer" })).toBeInTheDocument();
  });
});
