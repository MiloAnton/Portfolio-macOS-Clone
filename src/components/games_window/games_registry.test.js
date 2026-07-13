import { DEFAULT_GAME_ID, GAMES } from "./games_registry";

describe("games registry", () => {
  test("contains every game exactly once", () => {
    const ids = GAMES.map((game) => game.id);

    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DEFAULT_GAME_ID).toBe(ids[0]);
  });

  test("provides readable metadata and one component per game", () => {
    GAMES.forEach((game) => {
      expect(game.id).toEqual(expect.any(String));
      expect(game.name).toEqual(expect.any(String));
      expect(game.icon).toEqual(expect.any(String));
      expect(game.component).toEqual(expect.any(Function));
    });
  });
});
