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

const defineWindow = (config) =>
  Object.freeze({
    minSize: [300, 200],
    maxSize: [2560, 1440],
    resizable: true,
    ...config,
  });

// Registre unique des applications. Pour en ajouter une : importer son icône,
// ajouter son composant lazy et déclarer cette application dans la liste.
export const WINDOW_REGISTRY = Object.freeze([
  defineWindow({
    id: "main", label: "Curriculum", title: "À propos de Milo",
    component: lazy(() => import("../components/main_window/main_window")),
    dockIcon: finder, dockOrder: 1, defaultSize: [1100, 700],
    openOnDesktop: true, initialZIndex: 1,
    legacyPositionStorageSuffix: "showcase-layout",
    initialPosition: ({ viewportWidth, viewportHeight }) => ({
      x: Math.round(viewportWidth * 0.02), y: Math.round(viewportHeight * 0.055),
    }),
  }),
  defineWindow({
    id: "projects", label: "Projets",
    component: lazy(() => import("../components/projects_window/projects_window")),
    dockIcon: projects, dockOrder: 2, defaultSize: [800, 600],
  }),
  defineWindow({
    id: "notes", label: "Notes",
    component: lazy(() => import("../components/notes_window/notes_window")),
    dockIcon: notes, dockOrder: 7, defaultSize: [750, 500], minSize: [500, 300],
  }),
  defineWindow({
    id: "facetime", label: "FaceTime",
    component: lazy(() => import("../components/facetime_window/facetime_window")),
    dockIcon: facetime, dockOrder: 5, defaultSize: [720, 520], minSize: [400, 300],
  }),
  defineWindow({
    id: "terminal", label: "Terminal",
    component: lazy(() => import("../components/terminal_window/terminal_window")),
    dockIcon: terminal, dockOrder: 8, defaultSize: [720, 480], minSize: [400, 250],
    openOnDesktop: true, initialZIndex: 2,
    legacyPositionStorageSuffix: "showcase-layout",
    initialPosition: ({ viewportWidth, viewportHeight, width, height }) => ({
      x: Math.round(Math.min(viewportWidth * 0.57, viewportWidth - width - 24)),
      y: Math.round(Math.min(viewportHeight * 0.505, viewportHeight - height - 90)),
    }),
  }),
  defineWindow({
    id: "safari", label: "Safari",
    component: lazy(() => import("../components/safari_window/safari_window")),
    dockIcon: safari, dockOrder: 3, defaultSize: [900, 620], minSize: [520, 360],
    windowClassName: "safari-window",
  }),
  defineWindow({
    id: "messages", label: "Messages",
    component: lazy(() => import("../components/messages_window/messages_window")),
    dockIcon: message, dockOrder: 4, defaultSize: [760, 560], minSize: [520, 380],
    windowClassName: "messages-window",
  }),
  defineWindow({
    id: "calculator", label: "Calculatrice",
    component: lazy(() => import("../components/calculator_window/calculator_window")),
    dockIcon: calculator, dockOrder: 9, dockIconClass: "ico-system-app",
    defaultSize: [320, 480], minSize: [320, 480], maxSize: [320, 480],
    resizable: false, windowClassName: "calculator-window",
  }),
  defineWindow({
    id: "console", label: "Console",
    component: lazy(() => import("../components/console_window/console_window")),
    dockIcon: consoleIcon, dockOrder: 10, dockIconClass: "ico-system-app",
    defaultSize: [780, 500], minSize: [520, 320], windowClassName: "console-window",
  }),
  defineWindow({
    id: "games", label: "Jeux",
    component: lazy(() => import("../components/games_window/games_window")),
    dockIcon: games, dockOrder: 11, dockIconClass: "ico-system-app",
    defaultSize: [760, 570], minSize: [560, 480], maxSize: [1200, 900],
    windowClassName: "games-window",
  }),
  defineWindow({
    id: "calendar", label: "Calendrier",
    component: lazy(() => import("../components/calendar_window/calendar_window")),
    dockIcon: null, dockOrder: 6, dockIconType: "calendar",
    defaultSize: [840, 590], minSize: [620, 450], maxSize: [1500, 1000],
    windowClassName: "calendar-window",
  }),
]);

export const WINDOWS_BY_ID = Object.freeze(
  Object.fromEntries(WINDOW_REGISTRY.map((windowConfig) => [windowConfig.id, windowConfig]))
);

export const DOCK_WINDOWS = Object.freeze(
  [...WINDOW_REGISTRY].sort((a, b) => a.dockOrder - b.dockOrder)
);
