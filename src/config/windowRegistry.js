import { lazy } from "react";
import finder from "../assets/iconesDock/finder.png";
import projects from "../assets/iconesDock/projects.png";
import notes from "../assets/iconesDock/notes.png";
import safari from "../assets/iconesDock/safari.png";
import message from "../assets/iconesDock/message.png";
import facetime from "../assets/iconesDock/facetime.png";
import terminal from "../assets/iconesDock/terminal.svg";
import calculator from "../assets/iconesDock/calculator.svg";
import consoleIcon from "../assets/iconesDock/console.svg";
import games from "../assets/iconesDock/games.svg";

const defineWindow = (
  id,
  label,
  component,
  dockIcon,
  defaultSize,
  dockOrder,
  options = {}
) =>
  Object.freeze({
    id,
    label,
    component,
    dockIcon,
    defaultSize,
    dockOrder,
    ...options,
  });

// Registre unique des applications. Pour en ajouter une : importer son icône,
// ajouter son composant lazy et déclarer cette application dans la liste.
export const WINDOW_REGISTRY = Object.freeze([
  defineWindow("main", "Curriculum", lazy(() => import("../components/main_window/main_window")), finder, [1100, 700], 1, { openOnDesktop: true, initialZIndex: 1 }),
  defineWindow("projects", "Projets", lazy(() => import("../components/projects_window/projects_window")), projects, [800, 600], 2),
  defineWindow("notes", "Notes", lazy(() => import("../components/notes_window/notes_window")), notes, [750, 500], 7),
  defineWindow("facetime", "FaceTime", lazy(() => import("../components/facetime_window/facetime_window")), facetime, [720, 520], 5),
  defineWindow("terminal", "Terminal", lazy(() => import("../components/terminal_window/terminal_window")), terminal, [720, 480], 8, { openOnDesktop: true, initialZIndex: 2 }),
  defineWindow("safari", "Safari", lazy(() => import("../components/safari_window/safari_window")), safari, [900, 620], 3),
  defineWindow("messages", "Messages", lazy(() => import("../components/messages_window/messages_window")), message, [760, 560], 4),
  defineWindow("calculator", "Calculatrice", lazy(() => import("../components/calculator_window/calculator_window")), calculator, [320, 480], 9, { dockIconClass: "ico-system-app" }),
  defineWindow("console", "Console", lazy(() => import("../components/console_window/console_window")), consoleIcon, [780, 500], 10, { dockIconClass: "ico-system-app" }),
  defineWindow("games", "Jeux", lazy(() => import("../components/games_window/games_window")), games, [760, 570], 11, { dockIconClass: "ico-system-app" }),
  defineWindow("calendar", "Calendrier", lazy(() => import("../components/calendar_window/calendar_window")), null, [840, 590], 6, { dockIconType: "calendar" }),
]);

export const WINDOWS_BY_ID = Object.freeze(
  Object.fromEntries(WINDOW_REGISTRY.map((windowConfig) => [windowConfig.id, windowConfig]))
);

export const DOCK_WINDOWS = Object.freeze(
  [...WINDOW_REGISTRY].sort((a, b) => a.dockOrder - b.dockOrder)
);
