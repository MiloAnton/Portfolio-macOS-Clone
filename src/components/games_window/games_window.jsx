import { useState } from "react";
import { DEFAULT_GAME_ID, GAMES } from "./games_registry";
import "./games_window.scss";

export default function GamesWindow({ isActive }) {
  const [selectedGameId, setSelectedGameId] = useState(DEFAULT_GAME_ID);
  const selectedGame =
    GAMES.find((game) => game.id === selectedGameId) || GAMES[0];
  const SelectedGame = selectedGame.component;

  return (
    <div className="games-app">
      <nav aria-label="Jeux disponibles">
        {GAMES.map((game) => (
          <button
            type="button"
            className={selectedGameId === game.id ? "selected" : ""}
            aria-pressed={selectedGameId === game.id}
            onClick={() => setSelectedGameId(game.id)}
            key={game.id}
          >
            <span>{game.icon}</span>
            {game.name}
          </button>
        ))}
      </nav>

      <main>
        <SelectedGame isActive={isActive} />
      </main>
    </div>
  );
}
