import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import { loadBestScore, saveBestScore } from "./game_utils";
import useGameKeys from "./use_game_keys";

const GRID_WIDTH = 32;
const GRID_HEIGHT = 18;
const CELL_SIZE = 20;
const COUNTDOWN_SECONDS = 3;
const INITIAL_MOVE_INTERVAL = 115;
const MINIMUM_MOVE_INTERVAL = 55;
const SPEED_GAIN_PER_APPLE = 2;

export const SNAKE_BEST_SCORE_KEY = "portfolio-snake-best-score";

const PHASES = {
  idle: "idle",
  countdown: "countdown",
  running: "running",
  paused: "paused",
  lost: "lost",
  won: "won",
};

const createSnake = () => [
  { x: 16, y: 9 },
  { x: 15, y: 9 },
  { x: 14, y: 9 },
];

export const createFood = (snake, random = Math.random) => {
  const occupiedCells = new Set(
    snake.map((part) => `${part.x}:${part.y}`)
  );
  const availableCells = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (!occupiedCells.has(`${x}:${y}`)) {
        availableCells.push({ x, y });
      }
    }
  }

  if (availableCells.length === 0) return null;
  return availableCells[Math.floor(random() * availableCells.length)];
};

export const getMoveInterval = (score) =>
  Math.max(
    MINIMUM_MOVE_INTERVAL,
    INITIAL_MOVE_INTERVAL - score * SPEED_GAIN_PER_APPLE
  );

const createGameState = () => {
  const snake = createSnake();
  return {
    snake,
    direction: { x: 1, y: 0 },
    food: createFood(snake),
    applesEaten: 0,
    appleEffect: null,
  };
};

const drawGrid = (context) => {
  context.strokeStyle = "rgba(255, 255, 255, 0.045)";
  context.lineWidth = 1;

  for (let x = CELL_SIZE; x < 640; x += CELL_SIZE) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 360);
    context.stroke();
  }
  for (let y = CELL_SIZE; y < 360; y += CELL_SIZE) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(640, y);
    context.stroke();
  }
};

const drawApple = (context, food) => {
  if (!food) return;

  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
  context.fillStyle = "#ff453a";
  context.beginPath();
  context.arc(centerX, centerY + 1, 8, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#63d17a";
  context.fillRect(centerX + 2, centerY - 10, 5, 4);
};

const drawAppleEffect = (context, effect) => {
  if (!effect || effect.life <= 0) return;

  const centerX = effect.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = effect.y * CELL_SIZE + CELL_SIZE / 2;
  const radius = 9 + (1 - effect.life) * 25;
  context.strokeStyle = `rgba(255, 105, 97, ${effect.life})`;
  context.lineWidth = 3 * effect.life;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.stroke();
};

const drawEyes = (context, head, direction) => {
  const centerX = head.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = head.y * CELL_SIZE + CELL_SIZE / 2;
  const perpendicular = { x: -direction.y, y: direction.x };

  [-1, 1].forEach((side) => {
    const eyeX =
      centerX + direction.x * 5 + perpendicular.x * side * 4;
    const eyeY =
      centerY + direction.y * 5 + perpendicular.y * side * 4;

    context.fillStyle = "white";
    context.beginPath();
    context.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#102315";
    context.beginPath();
    context.arc(
      eyeX + direction.x * 1.2,
      eyeY + direction.y * 1.2,
      1.3,
      0,
      Math.PI * 2
    );
    context.fill();
  });
};

const drawSnake = (context, snake, direction) => {
  context.fillStyle = "#30d158";
  snake.slice(1).forEach((part, index) => {
    const inset = Math.min(3, 1 + index * 0.04);
    context.fillRect(
      part.x * CELL_SIZE + inset,
      part.y * CELL_SIZE + inset,
      CELL_SIZE - inset * 2,
      CELL_SIZE - inset * 2
    );
  });

  const head = snake[0];
  context.fillStyle = "#65e87f";
  context.fillRect(
    head.x * CELL_SIZE + 1,
    head.y * CELL_SIZE + 1,
    CELL_SIZE - 2,
    CELL_SIZE - 2
  );
  drawEyes(context, head, direction);
};

const drawFrame = (context, game) => {
  context.fillStyle = "#101613";
  context.fillRect(0, 0, 640, 360);
  drawGrid(context);
  drawAppleEffect(context, game.appleEffect);
  drawApple(context, game.food);
  drawSnake(context, game.snake, game.direction);
};

const drawOverlay = (context, title, subtitle) => {
  context.fillStyle = "rgba(4, 12, 7, 0.58)";
  context.fillRect(0, 0, 640, 360);
  context.fillStyle = "white";
  context.textAlign = "center";
  context.font = "700 76px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(title, 320, 205);

  if (subtitle) {
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
    context.fillText(subtitle, 320, 240);
  }
};

const getNextDirection = (keys, currentDirection) => {
  if (keys.ArrowUp && currentDirection.y !== 1) return { x: 0, y: -1 };
  if (keys.ArrowDown && currentDirection.y !== -1) return { x: 0, y: 1 };
  if (keys.ArrowLeft && currentDirection.x !== 1) return { x: -1, y: 0 };
  if (keys.ArrowRight && currentDirection.x !== -1) return { x: 1, y: 0 };
  return currentDirection;
};

const wrapPosition = (position, maximum) =>
  (position + maximum) % maximum;

export default function Snake({ isActive }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  if (gameRef.current === null) gameRef.current = createGameState();
  const wrapWallsRef = useRef(false);
  const keys = useGameKeys(isActive);
  const [phase, setPhase] = useState(PHASES.idle);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [sessionId, setSessionId] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    loadBestScore(SNAKE_BEST_SCORE_KEY)
  );
  const [wrapWalls, setWrapWalls] = useState(false);

  useEffect(() => {
    if (phase !== PHASES.countdown) return undefined;

    const timers = [
      setTimeout(() => setCountdown(2), 1000),
      setTimeout(() => setCountdown(1), 2000),
      setTimeout(() => setPhase(PHASES.running), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase, sessionId]);

  useEffect(() => {
    if (phase === PHASES.running) return;

    const context = canvasRef.current.getContext("2d");
    drawFrame(context, gameRef.current);
    if (phase === PHASES.countdown) {
      drawOverlay(context, String(countdown), "PRÊT ?");
    } else if (phase === PHASES.paused) {
      drawOverlay(context, "Ⅱ", "EN PAUSE");
    } else if (phase === PHASES.lost) {
      drawOverlay(context, "PERDU", "Clique sur Rejouer");
    } else if (phase === PHASES.won) {
      drawOverlay(context, "GAGNÉ", "Plateau complété");
    }
  }, [phase, countdown, sessionId]);

  useEffect(() => {
    if (phase !== PHASES.running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = gameRef.current;
    let animationFrame;
    let previousAnimationTime = null;
    let lastMoveTime = null;

    const loop = (time) => {
      const elapsedSinceFrame =
        previousAnimationTime === null
          ? 1000 / 60
          : Math.min(50, Math.max(0, time - previousAnimationTime));
      previousAnimationTime = time;

      game.direction = getNextDirection(keys.current, game.direction);
      if (lastMoveTime === null) lastMoveTime = time;

      const moveInterval = getMoveInterval(game.applesEaten);
      if (time - lastMoveTime >= moveInterval) {
        let nextHead = {
          x: game.snake[0].x + game.direction.x,
          y: game.snake[0].y + game.direction.y,
        };

        const outsideBoard =
          nextHead.x < 0 ||
          nextHead.x >= GRID_WIDTH ||
          nextHead.y < 0 ||
          nextHead.y >= GRID_HEIGHT;
        if (outsideBoard && !wrapWallsRef.current) {
          setPhase(PHASES.lost);
          return;
        }
        if (wrapWallsRef.current) {
          nextHead = {
            x: wrapPosition(nextHead.x, GRID_WIDTH),
            y: wrapPosition(nextHead.y, GRID_HEIGHT),
          };
        }

        const hitsSnake = game.snake.some(
          (part) => part.x === nextHead.x && part.y === nextHead.y
        );
        if (hitsSnake) {
          setPhase(PHASES.lost);
          return;
        }

        game.snake.unshift(nextHead);
        const eatsApple =
          game.food &&
          nextHead.x === game.food.x &&
          nextHead.y === game.food.y;
        if (eatsApple) {
          game.appleEffect = { ...game.food, life: 1 };
          game.applesEaten += 1;
          setScore(game.applesEaten);
          setBestScore((currentBestScore) => {
            if (game.applesEaten <= currentBestScore) return currentBestScore;
            saveBestScore(SNAKE_BEST_SCORE_KEY, game.applesEaten);
            return game.applesEaten;
          });
          game.food = createFood(game.snake);

          if (!game.food) {
            setPhase(PHASES.won);
            return;
          }
        } else {
          game.snake.pop();
        }

        lastMoveTime = time;
      }

      if (game.appleEffect) {
        game.appleEffect.life = Math.max(
          0,
          game.appleEffect.life - elapsedSinceFrame / 360
        );
      }

      drawFrame(context, game);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [phase, keys]);

  useEffect(() => {
    if (!isActive) return undefined;

    const handlePauseKey = (event) => {
      if (event.key.toLowerCase() !== "p") return;
      event.preventDefault();
      setPhase((currentPhase) => {
        if (currentPhase === PHASES.running) return PHASES.paused;
        if (currentPhase === PHASES.paused) return PHASES.running;
        return currentPhase;
      });
    };

    window.addEventListener("keydown", handlePauseKey);
    return () => window.removeEventListener("keydown", handlePauseKey);
  }, [isActive]);

  const restart = () => {
    gameRef.current = createGameState();
    setScore(0);
    setCountdown(COUNTDOWN_SECONDS);
    setSessionId((currentId) => currentId + 1);
    setPhase(PHASES.countdown);
  };

  const togglePause = () => {
    setPhase((currentPhase) =>
      currentPhase === PHASES.paused ? PHASES.running : PHASES.paused
    );
  };

  const toggleWallMode = () => {
    setWrapWalls((currentValue) => {
      const nextValue = !currentValue;
      wrapWallsRef.current = nextValue;
      return nextValue;
    });
  };

  const isPlaying =
    phase === PHASES.countdown ||
    phase === PHASES.running ||
    phase === PHASES.paused;
  const canPause = phase === PHASES.running || phase === PHASES.paused;
  const status =
    phase === PHASES.countdown
      ? `Départ dans ${countdown}`
      : phase === PHASES.paused
        ? "En pause"
        : phase === PHASES.lost
          ? "Perdu !"
          : phase === PHASES.won
            ? "Gagné !"
            : phase === PHASES.running
              ? `Niveau ${1 + Math.floor(score / 3)}`
              : "Mange les pommes";
  const actionLabel =
    phase === PHASES.lost || phase === PHASES.won
      ? "Rejouer"
      : isPlaying
        ? "Recommencer"
        : "Jouer";

  return (
    <CanvasGame
      title={`Score ${score} · Record ${bestScore}`}
      status={status}
      running={isPlaying}
      actionLabel={actionLabel}
      onRestart={restart}
      controls={
        <div className="snake-controls">
          <button type="button" onClick={togglePause} disabled={!canPause}>
            {phase === PHASES.paused ? "▶ Reprendre" : "Ⅱ Pause"}
          </button>
          <button
            type="button"
            className={wrapWalls ? "selected" : ""}
            aria-pressed={wrapWalls}
            onClick={toggleWallMode}
          >
            ↔ Traversée des murs
          </button>
        </div>
      }
      help="Flèches directionnelles · P pour mettre en pause"
      canvasRef={canvasRef}
    />
  );
}
