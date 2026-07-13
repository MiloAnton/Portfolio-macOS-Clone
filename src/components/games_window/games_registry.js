import DoodleJump from "./games/doodle_jump";
import FlappyBird from "./games/flappy_bird";
import Frogger from "./games/frogger";
import Game2048 from "./games/game_2048";
import Minesweeper from "./games/minesweeper";
import Pong from "./games/pong";
import Racer from "./games/racer";
import Simon from "./games/simon";
import Snake from "./games/snake";
import SpaceInvaders from "./games/space_invaders";

export const GAMES = Object.freeze([
  { id: "mines", name: "Démineur", icon: "💣", component: Minesweeper },
  { id: "pong", name: "Pong", icon: "🏓", component: Pong },
  { id: "snake", name: "Snake", icon: "🐍", component: Snake },
  { id: "racer", name: "Course", icon: "🏎️", component: Racer },
  { id: "flappy", name: "Flappy Bird", icon: "🐦", component: FlappyBird },
  { id: "2048", name: "2048", icon: "🔢", component: Game2048 },
  {
    id: "invaders",
    name: "Space Invaders",
    icon: "👾",
    component: SpaceInvaders,
  },
  { id: "doodle", name: "Doodle Jump", icon: "🦘", component: DoodleJump },
  { id: "frogger", name: "Frogger", icon: "🐸", component: Frogger },
  { id: "simon", name: "Simon", icon: "🟢", component: Simon },
]);

export const DEFAULT_GAME_ID = GAMES[0].id;
