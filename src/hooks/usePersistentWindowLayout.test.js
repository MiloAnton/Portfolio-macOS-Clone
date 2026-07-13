import { clampWindowLayout, TOOLBAR_HEIGHT } from "./usePersistentWindowLayout";

describe("window layout", () => {
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
});
