import { act, fireEvent, renderHook } from "@testing-library/react";
import usePersistentWindowLayout, {
  clampWindowLayout,
  TOOLBAR_HEIGHT,
} from "./usePersistentWindowLayout";

const config = {
  id: "notes",
  defaultSize: [500, 300],
  initialPosition: () => ({ x: 100, y: 100 }),
};

const setViewport = (width, height) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
};

describe("window layout", () => {
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
    localStorage.clear();
    setViewport(1000, 700);
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
    window.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  test("keeps an oversized layout inside the available desktop area", () => {
    const layout = clampWindowLayout(
      {
        position: { x: -400, y: -200 },
        size: { width: 1200, height: 900 },
      },
      { width: 800, height: 600 }
    );

    expect(layout).toEqual({
      position: { x: 12, y: TOOLBAR_HEIGHT + 12 },
      size: { width: 776, height: 468 },
    });
  });

  test("clamps a saved position after moving to a smaller display", () => {
    const layout = clampWindowLayout(
      {
        position: { x: 1300, y: 800 },
        size: { width: 500, height: 300 },
      },
      { width: 1000, height: 700 }
    );

    expect(layout.position).toEqual({ x: 488, y: 308 });
    expect(layout.size).toEqual({ width: 500, height: 300 });
  });

  test("loads and clamps a persisted layout", () => {
    localStorage.setItem(
      "portfolio-window-layout:v2:notes",
      JSON.stringify({
        position: { x: 3000, y: -50 },
        size: { width: 500, height: 300 },
      })
    );

    const { result } = renderHook(() => usePersistentWindowLayout(config));

    expect(result.current.layout).toEqual({
      position: { x: 488, y: TOOLBAR_HEIGHT + 12 },
      size: { width: 500, height: 300 },
    });
  });

  test("persists clamped positions after a drag", () => {
    const { result } = renderHook(() => usePersistentWindowLayout(config));

    act(() => {
      result.current.handleDragStop(null, { x: 5000, y: 5000 });
    });

    const saved = JSON.parse(
      localStorage.getItem("portfolio-window-layout:v2:notes")
    );
    expect(result.current.layout.position).toEqual({ x: 488, y: 308 });
    expect(saved).toEqual(result.current.layout);
  });

  test("persists clamped dimensions after a resize", () => {
    const { result } = renderHook(() => usePersistentWindowLayout(config));

    act(() => {
      result.current.handleResizeStop(null, {
        size: { width: 1400, height: 900 },
      });
    });

    const saved = JSON.parse(
      localStorage.getItem("portfolio-window-layout:v2:notes")
    );
    expect(result.current.layout).toEqual({
      position: { x: 12, y: TOOLBAR_HEIGHT + 12 },
      size: { width: 976, height: 568 },
    });
    expect(saved).toEqual(result.current.layout);
  });

  test("reclamps the rendered layout when the viewport shrinks", () => {
    setViewport(1400, 900);
    localStorage.setItem(
      "portfolio-window-layout:v2:notes",
      JSON.stringify({
        position: { x: 888, y: 508 },
        size: { width: 500, height: 300 },
      })
    );
    const { result } = renderHook(() => usePersistentWindowLayout(config));

    act(() => {
      setViewport(800, 600);
      fireEvent(window, new Event("resize"));
    });

    expect(result.current.layout).toEqual({
      position: { x: 288, y: 208 },
      size: { width: 500, height: 300 },
    });
  });
});
