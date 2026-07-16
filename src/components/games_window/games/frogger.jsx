import { useCallback, useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import { getDeltaSeconds } from "./game_utils";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const ROW_HEIGHT = 40;
const GRID_MARGIN = 8;
const COLUMN_WIDTH = 48;
const COLUMN_COUNT = 13;
const FROG_WIDTH = 30;
const FROG_HEIGHT = 30;
const START_POSITION = { row: 8, column: 6, offsetX: 0, hopTime: 0 };
const ARRIVAL_COLUMNS = [1, 3, 6, 9, 11];
const ROUND_TIME = 30;
const INPUT_COOLDOWN_MS = 90;

const DIRECTIONS_BY_KEY = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const getFrogBaseX = (column) =>
  GRID_MARGIN + column * COLUMN_WIDTH + (COLUMN_WIDTH - FROG_WIDTH) / 2;

export const getFrogRectangle = (player) => ({
  x: getFrogBaseX(player.column) + player.offsetX,
  y: player.row * ROW_HEIGHT + 5,
  width: FROG_WIDTH,
  height: FROG_HEIGHT,
});

export const moveFrogByCell = (player, direction) => {
  const currentX = getFrogRectangle(player).x;
  const normalizedColumn = Math.max(
    0,
    Math.min(
      COLUMN_COUNT - 1,
      Math.round(
        (currentX - GRID_MARGIN - (COLUMN_WIDTH - FROG_WIDTH) / 2) /
          COLUMN_WIDTH
      )
    )
  );
  const nextPlayer = {
    ...player,
    column: normalizedColumn,
    offsetX: 0,
    hopTime: 0.16,
  };

  if (direction === "up") nextPlayer.row -= 1;
  if (direction === "down") nextPlayer.row += 1;
  if (direction === "left") nextPlayer.column -= 1;
  if (direction === "right") nextPlayer.column += 1;

  nextPlayer.row = Math.max(0, Math.min(8, nextPlayer.row));
  nextPlayer.column = Math.max(
    0,
    Math.min(COLUMN_COUNT - 1, nextPlayer.column)
  );
  return nextPlayer;
};

export const canAcceptFroggerInput = (
  isRepeat,
  currentTime,
  previousInputTime
) => !isRepeat && currentTime - previousInputTime >= INPUT_COOLDOWN_MS;

const createCars = () => {
  const lanes = [
    { row: 5, speed: -112, width: 58, color: "#ff453a", offset: 40 },
    { row: 6, speed: 148, width: 48, color: "#0a84ff", offset: -70 },
    { row: 7, speed: -92, width: 68, color: "#ff9f0a", offset: 90 },
  ];

  return lanes.flatMap((lane, laneIndex) =>
    Array.from({ length: 4 }, (_, index) => ({
      id: `car-${lane.row}-${index}`,
      ...lane,
      x: lane.offset + index * (175 + laneIndex * 8),
      previousX: lane.offset + index * (175 + laneIndex * 8),
      wrapped: false,
    }))
  );
};

const createLogs = () => {
  const lanes = [
    { row: 1, speed: 52, width: 142, offset: -35 },
    { row: 2, speed: -68, width: 116, offset: 55 },
    { row: 3, speed: 43, width: 166, offset: -90 },
  ];

  return lanes.flatMap((lane, laneIndex) =>
    Array.from({ length: 3 }, (_, index) => ({
      id: `log-${lane.row}-${index}`,
      ...lane,
      x: lane.offset + index * (230 + laneIndex * 12),
      previousX: lane.offset + index * (230 + laneIndex * 12),
      wrapped: false,
    }))
  );
};

export const advanceFroggerMover = (
  mover,
  deltaSeconds,
  level = 1
) => {
  const speedMultiplier = 1 + (level - 1) * 0.12;
  const previousX = mover.x;
  let x = mover.x + mover.speed * speedMultiplier * deltaSeconds;
  let wrapped = false;

  if (mover.speed > 0 && x > CANVAS_WIDTH + 24) {
    x = -mover.width - 24;
    wrapped = true;
  } else if (mover.speed < 0 && x + mover.width < -24) {
    x = CANVAS_WIDTH + 24;
    wrapped = true;
  }

  return { ...mover, x, previousX, wrapped };
};

export const vehicleHitsFrog = (vehicle, player) => {
  if (vehicle.row !== player.row) return false;
  const frog = getFrogRectangle(player);
  const frogHitbox = {
    x: frog.x + 4,
    width: frog.width - 8,
  };
  const sweptLeft = vehicle.wrapped
    ? vehicle.x
    : Math.min(vehicle.previousX, vehicle.x);
  const sweptRight = vehicle.wrapped
    ? vehicle.x + vehicle.width
    : Math.max(vehicle.previousX, vehicle.x) + vehicle.width;

  return frogHitbox.x < sweptRight && frogHitbox.x + frogHitbox.width > sweptLeft;
};

const findSupportingLog = (logs, player) => {
  if (player.row < 1 || player.row > 3) return null;
  const frog = getFrogRectangle(player);
  const frogCenter = frog.x + frog.width / 2;
  return (
    logs.find(
      (log) =>
        log.row === player.row &&
        frogCenter >= log.x + 4 &&
        frogCenter <= log.x + log.width - 4
    ) || null
  );
};

const drawFrog = (context, player, color = "#30d158", scale = 1) => {
  const rectangle = getFrogRectangle(player);
  const hopStretch = player.hopTime > 0 ? 3 : 0;
  const centerX = rectangle.x + FROG_WIDTH / 2;
  const centerY = rectangle.y + FROG_HEIGHT / 2;

  context.save();
  context.translate(centerX, centerY);
  context.scale(scale, scale);
  context.fillStyle = color;

  context.beginPath();
  context.ellipse(0, 3, 11, 10 + hopStretch, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(-10, 9, 7, 4, -0.45, 0, Math.PI * 2);
  context.ellipse(10, 9, 7, 4, 0.45, 0, Math.PI * 2);
  context.ellipse(-8, -8, 6, 6, 0, 0, Math.PI * 2);
  context.ellipse(8, -8, 6, 6, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "white";
  context.beginPath();
  context.arc(-8, -9, 3, 0, Math.PI * 2);
  context.arc(8, -9, 3, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#171717";
  context.beginPath();
  context.arc(-8, -9, 1.4, 0, Math.PI * 2);
  context.arc(8, -9, 1.4, 0, Math.PI * 2);
  context.fill();
  context.restore();
};

const drawCar = (context, car) => {
  const y = car.row * ROW_HEIGHT + 8;
  context.fillStyle = "#151518";
  context.fillRect(car.x + 5, y - 3, 12, 4);
  context.fillRect(car.x + car.width - 17, y - 3, 12, 4);
  context.fillRect(car.x + 5, y + 25, 12, 4);
  context.fillRect(car.x + car.width - 17, y + 25, 12, 4);

  context.fillStyle = car.color;
  context.fillRect(car.x, y, car.width, 26);
  context.fillStyle = "rgba(215, 240, 255, 0.78)";
  context.fillRect(car.x + car.width * 0.24, y + 4, car.width * 0.45, 8);
  context.fillStyle = "rgba(15, 25, 36, 0.65)";
  context.fillRect(car.x + car.width * 0.28, y + 15, car.width * 0.4, 7);
  context.fillStyle = "#fff3a4";
  const frontX = car.speed > 0 ? car.x + car.width - 4 : car.x;
  context.fillRect(frontX, y + 4, 4, 6);
  context.fillRect(frontX, y + 17, 4, 6);
};

const drawLog = (context, log) => {
  const y = log.row * ROW_HEIGHT + 8;
  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  context.fillRect(log.x + 4, y + 22, log.width, 5);
  context.fillStyle = "#8b512d";
  context.fillRect(log.x, y, log.width, 24);
  context.fillStyle = "#b87542";
  context.fillRect(log.x + 5, y + 3, log.width - 10, 5);
  context.fillStyle = "#60361f";
  for (let x = log.x + 25; x < log.x + log.width - 10; x += 42) {
    context.fillRect(x, y + 10, 5, 5);
  }
  context.fillStyle = "#d09058";
  context.fillRect(log.x, y + 3, 5, 18);
  context.fillRect(log.x + log.width - 5, y + 3, 5, 18);
};

const drawArrivalZones = (context, homes) => {
  ARRIVAL_COLUMNS.forEach((column) => {
    const x = GRID_MARGIN + column * COLUMN_WIDTH + 3;
    const filled = homes.has(column);
    context.fillStyle = filled ? "#1c7c3e" : "#184d31";
    context.beginPath();
    context.arc(x + 21, 20, 18, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = filled ? "#4ee36c" : "#2b7650";
    context.beginPath();
    context.moveTo(x + 21, 20);
    context.arc(x + 21, 20, 15, 0.18, Math.PI * 1.82);
    context.closePath();
    context.fill();

    if (filled) {
      drawFrog(
        context,
        { row: 0, column, offsetX: 0, hopTime: 0 },
        "#8ef29a",
        0.58
      );
    }
  });
};

const drawWorld = (context, game, currentTime) => {
  context.fillStyle = "#2d713d";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "#1269a0";
  context.fillRect(0, ROW_HEIGHT, CANVAS_WIDTH, ROW_HEIGHT * 3);
  const waterOffset = (currentTime / 30) % 34;
  context.fillStyle = "rgba(137, 218, 255, 0.28)";
  for (let x = -34 + waterOffset; x < CANVAS_WIDTH; x += 34) {
    context.fillRect(x, 54, 18, 2);
    context.fillRect(x + 12, 103, 22, 2);
    context.fillRect(x - 5, 145, 16, 2);
  }

  context.fillStyle = "#343438";
  context.fillRect(0, ROW_HEIGHT * 5, CANVAS_WIDTH, ROW_HEIGHT * 3);
  context.strokeStyle = "rgba(255, 255, 255, 0.45)";
  context.setLineDash([20, 18]);
  [ROW_HEIGHT * 6, ROW_HEIGHT * 7].forEach((y) => {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(CANVAS_WIDTH, y);
    context.stroke();
  });
  context.setLineDash([]);

  context.fillStyle = "rgba(196, 255, 174, 0.15)";
  context.fillRect(0, ROW_HEIGHT * 4, CANVAS_WIDTH, ROW_HEIGHT);
  context.fillRect(0, ROW_HEIGHT * 8, CANVAS_WIDTH, ROW_HEIGHT);

  drawArrivalZones(context, game.homes);
  game.logs.forEach((log) => drawLog(context, log));
  game.cars.forEach((car) => drawCar(context, car));
  drawFrog(context, game.player);

  const timeRatio = Math.max(0, game.timeLeft / ROUND_TIME);
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.fillRect(10, 348, 150, 5);
  context.fillStyle = timeRatio < 0.25 ? "#ff453a" : "#ffd60a";
  context.fillRect(10, 348, 150 * timeRatio, 5);

  if (game.hitFlash > 0) {
    context.fillStyle = `rgba(255, 69, 58, ${game.hitFlash * 0.22})`;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
};

const createGameState = () => ({
  player: { ...START_POSITION },
  cars: createCars(),
  logs: createLogs(),
  homes: new Set(),
  lives: 3,
  crossings: 0,
  level: 1,
  timeLeft: ROUND_TIME,
  hitFlash: 0,
  hudElapsed: 0,
});

const drawIdleFrame = (context, lost) => {
  const preview = createGameState();
  drawWorld(context, preview, 0);
  context.fillStyle = "rgba(15, 45, 27, 0.82)";
  context.fillRect(0, 130, CANVAS_WIDTH, 90);
  context.fillStyle = "white";
  context.textAlign = "center";
  context.font = "800 25px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(lost ? "PARTIE TERMINÉE" : "FROGGER", 320, 168);
  context.font = "600 11px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(
    lost ? "Encore une traversée ?" : "REMPLIS LES CINQ ARRIVÉES",
    320,
    192
  );
};

export default function Frogger({ isActive }) {
  const canvasRef = useRef(null);
  const playerRef = useRef({ ...START_POSITION });
  const lastInputTimeRef = useRef(-Infinity);
  const [running, setRunning] = useState(false);
  const [crossings, setCrossings] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [lost, setLost] = useState(false);
  const [gameSession, setGameSession] = useState(0);

  useEffect(() => {
    if (running) return;
    const context = canvasRef.current?.getContext("2d");
    if (context) drawIdleFrame(context, lost);
  }, [lost, running]);

  const tryMove = useCallback((direction, currentTime = performance.now()) => {
    if (!running || !isActive) return;
    if (
      !canAcceptFroggerInput(
        false,
        currentTime,
        lastInputTimeRef.current
      )
    ) {
      return;
    }

    lastInputTimeRef.current = currentTime;
    playerRef.current = moveFrogByCell(playerRef.current, direction);
  }, [isActive, running]);

  useEffect(() => {
    if (!running || !isActive) return undefined;

    const handleKeyDown = (event) => {
      const direction = DIRECTIONS_BY_KEY[event.key];
      if (!direction) return;
      event.preventDefault();
      if (
        !canAcceptFroggerInput(
          event.repeat,
          event.timeStamp,
          lastInputTimeRef.current
        )
      ) {
        return;
      }

      lastInputTimeRef.current = event.timeStamp;
      playerRef.current = moveFrogByCell(playerRef.current, direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, running]);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = createGameState();
    playerRef.current = game.player;
    let previousTime = null;
    let animationFrame;

    const resetFrog = () => {
      game.player = { ...START_POSITION };
      playerRef.current = game.player;
      game.timeLeft = ROUND_TIME;
      setTimeLeft(ROUND_TIME);
      lastInputTimeRef.current = -Infinity;
    };

    const loseLife = () => {
      game.lives -= 1;
      game.hitFlash = 1;
      setLives(game.lives);
      if (game.lives <= 0) {
        setLost(true);
        setRunning(false);
        return true;
      }
      resetFrog();
      return false;
    };

    const reachArrival = () => {
      const arrivalColumn = ARRIVAL_COLUMNS.find(
        (column) => Math.abs(column - game.player.column) === 0
      );
      if (arrivalColumn === undefined || game.homes.has(arrivalColumn)) {
        return loseLife();
      }

      game.homes.add(arrivalColumn);
      game.crossings += 1;
      setCrossings(game.crossings);
      if (game.homes.size === ARRIVAL_COLUMNS.length) {
        game.level += 1;
        game.homes = new Set();
        setLevel(game.level);
      }
      resetFrog();
      return false;
    };

    const updateHud = (deltaSeconds) => {
      game.hudElapsed += deltaSeconds;
      if (game.hudElapsed < 0.1) return;
      game.hudElapsed = 0;
      setTimeLeft(Math.max(0, game.timeLeft));
    };

    const loop = (currentTime) => {
      const deltaSeconds = getDeltaSeconds(currentTime, previousTime);
      previousTime = currentTime;
      game.player = playerRef.current;
      game.player.hopTime = Math.max(0, game.player.hopTime - deltaSeconds);
      game.hitFlash = Math.max(0, game.hitFlash - deltaSeconds * 2.8);
      game.timeLeft -= deltaSeconds;

      game.cars = game.cars.map((car) =>
        advanceFroggerMover(car, deltaSeconds, game.level)
      );
      game.logs = game.logs.map((log) =>
        advanceFroggerMover(log, deltaSeconds, game.level)
      );

      if (game.cars.some((car) => vehicleHitsFrog(car, game.player))) {
        if (loseLife()) return;
      } else if (game.player.row >= 1 && game.player.row <= 3) {
        const supportingLog = findSupportingLog(game.logs, game.player);
        if (!supportingLog) {
          if (loseLife()) return;
        } else {
          game.player.offsetX +=
            supportingLog.speed *
            (1 + (game.level - 1) * 0.12) *
            deltaSeconds;
          const frogRectangle = getFrogRectangle(game.player);
          if (
            frogRectangle.x + frogRectangle.width < 0 ||
            frogRectangle.x > CANVAS_WIDTH
          ) {
            if (loseLife()) return;
          }
        }
      }

      if (game.player.row === 0 && reachArrival()) return;
      if (game.timeLeft <= 0 && loseLife()) return;

      playerRef.current = game.player;
      updateHud(deltaSeconds);
      drawWorld(context, game, currentTime);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameSession, running]);

  const restart = () => {
    // « Rejouer » démarre volontairement une nouvelle partie complète.
    playerRef.current = { ...START_POSITION };
    lastInputTimeRef.current = -Infinity;
    setCrossings(0);
    setLives(3);
    setLevel(1);
    setTimeLeft(ROUND_TIME);
    setLost(false);
    setGameSession((currentSession) => currentSession + 1);
    setRunning(true);
  };

  const controls = (
    <div className="frogger-controls" aria-label="Commandes de Frogger">
      <button type="button" className="up" aria-label="Avancer d’une case" onClick={() => tryMove("up")}>
        ▲
      </button>
      <button type="button" className="left" aria-label="Aller d’une case à gauche" onClick={() => tryMove("left")}>
        ◀
      </button>
      <button type="button" className="down" aria-label="Reculer d’une case" onClick={() => tryMove("down")}>
        ▼
      </button>
      <button type="button" className="right" aria-label="Aller d’une case à droite" onClick={() => tryMove("right")}>
        ▶
      </button>
    </div>
  );

  return (
    <CanvasGame
      title={`${crossings} traversée${crossings > 1 ? "s" : ""} · ${"♥".repeat(lives)}${"♡".repeat(3 - lives)} · ${Math.ceil(timeLeft)}s`}
      status={lost ? "Partie terminée" : `Niveau ${level}`}
      running={running}
      onRestart={restart}
      actionLabel={lost ? "Rejouer" : undefined}
      controls={controls}
      help="Une pression = une case · remplis les cinq arrivées"
      canvasRef={canvasRef}
    />
  );
}
