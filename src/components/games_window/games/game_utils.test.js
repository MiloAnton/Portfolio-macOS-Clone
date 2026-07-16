import {
  createPressHandlers,
  getDeltaSeconds,
  loadBestScore,
  saveBestScore,
} from "./game_utils";

describe("game utils", () => {
  beforeEach(() => localStorage.clear());

  test("normalizes frame time across refresh rates", () => {
    expect(getDeltaSeconds(1000, null)).toBeCloseTo(1 / 60);
    expect(getDeltaSeconds(1000 + 1000 / 60, 1000)).toBeCloseTo(1 / 60);
    expect(getDeltaSeconds(1000 + 1000 / 120, 1000)).toBeCloseTo(1 / 120);
    expect(getDeltaSeconds(900, 1000)).toBe(0);
    expect(getDeltaSeconds(5000, 1000)).toBe(0.05);
  });

  test("loads only valid persisted best scores", () => {
    expect(loadBestScore("score-key")).toBe(0);
    localStorage.setItem("score-key", "pas un nombre");
    expect(loadBestScore("score-key")).toBe(0);
    saveBestScore("score-key", 12);
    expect(loadBestScore("score-key")).toBe(12);
  });

  test("press handlers capture the pointer and release on every exit path", () => {
    const onPress = jest.fn();
    const onRelease = jest.fn();
    const handlers = createPressHandlers(onPress, onRelease);
    const event = {
      preventDefault: jest.fn(),
      pointerId: 1,
      currentTarget: { setPointerCapture: jest.fn() },
    };

    handlers.onPointerDown(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
    expect(onPress).toHaveBeenCalledTimes(1);

    handlers.onPointerUp();
    handlers.onPointerCancel();
    handlers.onPointerLeave();
    expect(onRelease).toHaveBeenCalledTimes(3);
  });
});
