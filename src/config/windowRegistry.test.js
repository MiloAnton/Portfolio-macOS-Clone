import { DOCK_WINDOWS, WINDOW_REGISTRY, WINDOWS_BY_ID } from "./windowRegistry";

describe("window registry", () => {
  test("contains complete and unique window definitions", () => {
    const ids = WINDOW_REGISTRY.map(({ id }) => id);
    const dockOrders = WINDOW_REGISTRY.map(({ dockOrder }) => dockOrder);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(dockOrders).size).toBe(dockOrders.length);
    expect(Object.keys(WINDOWS_BY_ID)).toEqual(ids);
    WINDOW_REGISTRY.forEach((config) => {
      expect(config.id).toEqual(expect.any(String));
      expect(config.id.length).toBeGreaterThan(0);
      expect(config.component).toBeTruthy();
      expect(config.defaultSize).toHaveLength(2);
      expect(config.minSize).toHaveLength(2);
      expect(config.maxSize).toHaveLength(2);
      expect(WINDOWS_BY_ID[config.id]).toBe(config);
    });
  });

  test("exposes Dock applications in their configured order", () => {
    expect(DOCK_WINDOWS.map(({ dockOrder }) => dockOrder)).toEqual(
      [...DOCK_WINDOWS].map(({ dockOrder }) => dockOrder).sort((a, b) => a - b)
    );
  });
});
