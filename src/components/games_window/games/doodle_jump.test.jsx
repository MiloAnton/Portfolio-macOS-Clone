import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DoodleJump, {
  createPlatforms,
  getLandingPlatform,
  updateMovingPlatform,
} from "./doodle_jump";

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
  stroke: vi.fn(),
  translate: vi.fn(),
});

describe("Doodle Jump", () => {
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;
  let originalDeviceOrientationEvent;

  beforeEach(() => {
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(createCanvasContext());
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    originalDeviceOrientationEvent = window.DeviceOrientationEvent;
    window.requestAnimationFrame = vi.fn(() => 1);
    window.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: originalDeviceOrientationEvent,
    });
  });

  test("always creates a wide safe platform below the starting player", () => {
    const platforms = createPlatforms(() => 0);
    const safePlatform = platforms.find((platform) => platform.safe);

    expect(safePlatform).toMatchObject({
      x: 260,
      y: 315,
      width: 120,
      type: "normal",
      broken: false,
    });
    expect(safePlatform.x).toBeLessThanOrEqual(305);
    expect(safePlatform.x + safePlatform.width).toBeGreaterThanOrEqual(335);
  });

  test("detects a platform crossed during a high-speed fall", () => {
    const crossedPlatform = {
      x: 90,
      y: 250,
      width: 90,
      broken: false,
    };
    const player = { x: 110, y: 285, velocityY: 900 };

    expect(getLandingPlatform(player, 210, [crossedPlatform])).toBe(
      crossedPlatform
    );
    expect(
      getLandingPlatform({ ...player, velocityY: -500 }, 210, [crossedPlatform])
    ).toBeNull();
  });

  test("moves animated platforms according to elapsed time", () => {
    const platform = {
      x: 100,
      y: 180,
      width: 72,
      type: "moving",
      direction: 1,
      broken: false,
    };
    const fullStep = updateMovingPlatform(platform, 1 / 60);
    const firstHalf = updateMovingPlatform(platform, 1 / 120);
    const twoHalfSteps = updateMovingPlatform(firstHalf, 1 / 120);

    expect(fullStep.x).toBeCloseTo(twoHalfSteps.x);
  });

  test("offers touch buttons and enables tilt after mobile permission", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: { requestPermission },
    });

    render(<DoodleJump isActive />);
    const leftButton = screen.getByRole("button", { name: "Aller à gauche" });
    fireEvent.pointerDown(leftButton, { pointerId: 1 });
    fireEvent.pointerUp(leftButton, { pointerId: 1 });

    fireEvent.click(
      screen.getByRole("button", { name: "Activer l’inclinaison" })
    );
    await waitFor(() => {
      expect(requestPermission).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("button", { name: "Inclinaison active" })
      ).toHaveAttribute("aria-pressed", "true");
    });
  });
});
