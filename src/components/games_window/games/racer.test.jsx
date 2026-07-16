import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Racer, {
  getDifficulty,
  getSafeSpawnLanes,
  getSpawnInterval,
  removeOffscreenObstacles,
} from "./racer";

describe("Racer", () => {
  test("increases difficulty and spawn frequency with distance", () => {
    expect(getDifficulty(0)).toBe(1);
    expect(getDifficulty(1.2)).toBe(2);
    expect(getDifficulty(50)).toBe(10);
    expect(getSpawnInterval(8)).toBeLessThan(getSpawnInterval(1));
  });

  test("never fills all three lanes in the same obstacle wave", () => {
    expect(getSafeSpawnLanes([])).toEqual([0, 1, 2]);
    expect(getSafeSpawnLanes([{ lane: 0, y: 50 }])).toEqual([1, 2]);
    expect(
      getSafeSpawnLanes([
        { lane: 0, y: 50 },
        { lane: 1, y: 80 },
      ])
    ).toEqual([]);
  });

  test("removes cars after they leave the visible play area", () => {
    const visible = { lane: 0, y: 431 };
    const offscreen = { lane: 1, y: 432 };

    expect(removeOffscreenObstacles([visible, offscreen])).toEqual([visible]);
  });

  test("starts with a readable speed and an empty damage gauge", () => {
    render(<Racer isActive />);

    expect(screen.getByText("0.0 km · 130 km/h")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Dégâts de la voiture" })
    ).toHaveAttribute("aria-valuenow", "0");
  });
});
