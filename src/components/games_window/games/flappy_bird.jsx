import { useCallback, useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import { getDeltaSeconds, loadBestScore, saveBestScore } from "./game_utils";
import useGameKeys from "./use_game_keys";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const GROUND_Y = 326;
const BIRD_X = 126;
const BIRD_COLLISION_RADIUS = 10;
const PIPE_WIDTH = 62;
const PIPE_CAP_HEIGHT = 18;
const PIPE_SPACING = 300;
const GRAVITY = 1224;
const FLAP_VELOCITY = -402;

export const FLAPPY_BEST_SCORE_KEY = "portfolio-flappy-best-score";

const PHASES = {
  ready: "ready",
  running: "running",
  lost: "lost",
};

export const getFlappyDifficulty = (score) => ({
  level: 1 + Math.floor(score / 5),
  pipeSpeed: Math.min(252, 168 + score * 4),
  gapSize: Math.max(112, 150 - score * 2),
});

export const shouldScorePipe = (pipe, birdX = BIRD_X) =>
  !pipe.scored && pipe.x + PIPE_WIDTH < birdX;

export const circleIntersectsRect = (circle, rectangle) => {
  const closestX = Math.max(
    rectangle.x,
    Math.min(circle.x, rectangle.x + rectangle.width)
  );
  const closestY = Math.max(
    rectangle.y,
    Math.min(circle.y, rectangle.y + rectangle.height)
  );
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  return distanceX ** 2 + distanceY ** 2 <= circle.radius ** 2;
};

const createPipe = (x, difficulty, random = Math.random) => {
  const halfGap = difficulty.gapSize / 2;
  const minimumCenter = 45 + halfGap;
  const maximumCenter = GROUND_Y - 38 - halfGap;

  return {
    x,
    gapY: minimumCenter + random() * (maximumCenter - minimumCenter),
    gapSize: difficulty.gapSize,
    scored: false,
  };
};

const createGameState = () => {
  const difficulty = getFlappyDifficulty(0);
  return {
    birdY: 168,
    velocityY: 0,
    wingTime: 0,
    worldDistance: 0,
    score: 0,
    keyboardFlapHeld: false,
    pipes: [
      createPipe(520, difficulty),
      createPipe(520 + PIPE_SPACING, difficulty),
    ],
  };
};

const drawCloud = (context, x, y, scale, opacity) => {
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = "white";
  context.beginPath();
  context.ellipse(x, y, 30 * scale, 15 * scale, 0, 0, Math.PI * 2);
  context.ellipse(
    x - 22 * scale,
    y + 4 * scale,
    20 * scale,
    11 * scale,
    0,
    0,
    Math.PI * 2
  );
  context.ellipse(
    x + 24 * scale,
    y + 5 * scale,
    22 * scale,
    12 * scale,
    0,
    0,
    Math.PI * 2
  );
  context.fill();
  context.restore();
};

const drawBackground = (context, worldDistance) => {
  const sky = context.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, "#55bff4");
  sky.addColorStop(0.62, "#9be0f5");
  sky.addColorStop(1, "#e7f7e9");
  context.fillStyle = sky;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let index = 0; index < 5; index += 1) {
    const farX =
      ((index * 190 - worldDistance * 0.12) % 920 + 920) % 920 - 120;
    drawCloud(context, farX, 62 + (index % 2) * 34, 0.72, 0.46);

    const nearX =
      ((index * 240 - worldDistance * 0.27) % 1080 + 1080) % 1080 - 160;
    drawCloud(context, nearX, 118 + (index % 3) * 25, 1, 0.68);
  }
};

const drawPipe = (context, pipe) => {
  const gapTop = pipe.gapY - pipe.gapSize / 2;
  const gapBottom = pipe.gapY + pipe.gapSize / 2;
  const pipeGradient = context.createLinearGradient(
    pipe.x,
    0,
    pipe.x + PIPE_WIDTH,
    0
  );
  pipeGradient.addColorStop(0, "#187d34");
  pipeGradient.addColorStop(0.2, "#4fd168");
  pipeGradient.addColorStop(0.72, "#28a84b");
  pipeGradient.addColorStop(1, "#12682a");

  context.fillStyle = "#0d5722";
  context.fillRect(pipe.x - 2, 0, PIPE_WIDTH + 4, gapTop);
  context.fillRect(
    pipe.x - 2,
    gapBottom,
    PIPE_WIDTH + 4,
    GROUND_Y - gapBottom
  );
  context.fillStyle = pipeGradient;
  context.fillRect(pipe.x + 2, 0, PIPE_WIDTH - 4, gapTop);
  context.fillRect(
    pipe.x + 2,
    gapBottom,
    PIPE_WIDTH - 4,
    GROUND_Y - gapBottom
  );

  const capX = pipe.x - 6;
  const capWidth = PIPE_WIDTH + 12;
  context.fillStyle = "#0b5d25";
  context.fillRect(
    capX - 2,
    gapTop - PIPE_CAP_HEIGHT - 2,
    capWidth + 4,
    PIPE_CAP_HEIGHT + 4
  );
  context.fillRect(capX - 2, gapBottom - 2, capWidth + 4, PIPE_CAP_HEIGHT + 4);
  context.fillStyle = pipeGradient;
  context.fillRect(capX, gapTop - PIPE_CAP_HEIGHT, capWidth, PIPE_CAP_HEIGHT);
  context.fillRect(capX, gapBottom, capWidth, PIPE_CAP_HEIGHT);

  context.fillStyle = "rgba(255, 255, 255, 0.22)";
  context.fillRect(pipe.x + 10, 0, 5, Math.max(0, gapTop - PIPE_CAP_HEIGHT));
  context.fillRect(
    pipe.x + 10,
    gapBottom + PIPE_CAP_HEIGHT,
    5,
    Math.max(0, GROUND_Y - gapBottom - PIPE_CAP_HEIGHT)
  );
};

const drawPipes = (context, pipes) => {
  pipes.forEach((pipe) => drawPipe(context, pipe));
};

const drawGround = (context, worldDistance) => {
  context.fillStyle = "#6bd05b";
  context.fillRect(0, GROUND_Y, CANVAS_WIDTH, 8);
  context.fillStyle = "#e7d48c";
  context.fillRect(0, GROUND_Y + 8, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  const tileOffset = (worldDistance * 1.1) % 34;
  for (let x = -34 - tileOffset; x < CANVAS_WIDTH + 34; x += 34) {
    context.fillStyle = "rgba(135, 105, 52, 0.24)";
    context.beginPath();
    context.moveTo(x, GROUND_Y + 8);
    context.lineTo(x + 17, CANVAS_HEIGHT);
    context.lineTo(x + 31, CANVAS_HEIGHT);
    context.lineTo(x + 14, GROUND_Y + 8);
    context.closePath();
    context.fill();
  }
};

const drawBird = (context, game) => {
  const rotation = Math.max(-0.38, Math.min(0.7, game.velocityY / 620));
  const wingLift = Math.sin(game.wingTime) * 5;

  context.save();
  context.translate(BIRD_X, game.birdY);
  context.rotate(rotation);

  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  context.beginPath();
  context.ellipse(2, 15, 17, 5, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#f2b90b";
  context.beginPath();
  context.ellipse(-5, 4 + wingLift, 12, 8, -0.25, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffd60a";
  context.beginPath();
  context.ellipse(0, 0, 17, 13, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "white";
  context.beginPath();
  context.arc(8, -5, 5, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#151515";
  context.beginPath();
  context.arc(10, -5, 2, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ff8c0a";
  context.beginPath();
  context.moveTo(14, -1);
  context.lineTo(28, 3);
  context.lineTo(14, 7);
  context.closePath();
  context.fill();
  context.restore();
};

const drawFrame = (context, game) => {
  drawBackground(context, game.worldDistance);
  drawPipes(context, game.pipes);
  drawGround(context, game.worldDistance);
  drawBird(context, game);
};

const drawOverlay = (context, title, subtitle) => {
  context.fillStyle = "rgba(34, 91, 116, 0.28)";
  context.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
  context.fillStyle = "white";
  context.textAlign = "center";
  context.font = "700 34px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(title, CANVAS_WIDTH / 2, 145);
  context.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(subtitle, CANVAS_WIDTH / 2, 176);
};

const getPipeCollisionRectangles = (pipe) => {
  const gapTop = pipe.gapY - pipe.gapSize / 2;
  const gapBottom = pipe.gapY + pipe.gapSize / 2;
  return [
    { x: pipe.x, y: 0, width: PIPE_WIDTH, height: gapTop },
    {
      x: pipe.x - 6,
      y: gapTop - PIPE_CAP_HEIGHT,
      width: PIPE_WIDTH + 12,
      height: PIPE_CAP_HEIGHT,
    },
    {
      x: pipe.x,
      y: gapBottom,
      width: PIPE_WIDTH,
      height: GROUND_Y - gapBottom,
    },
    {
      x: pipe.x - 6,
      y: gapBottom,
      width: PIPE_WIDTH + 12,
      height: PIPE_CAP_HEIGHT,
    },
  ];
};

export const hasBirdPipeCollision = (bird, pipes) =>
  pipes.some((pipe) =>
    getPipeCollisionRectangles(pipe).some((rectangle) =>
      circleIntersectsRect(bird, rectangle)
    )
  );

export default function FlappyBird({ isActive }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  if (gameRef.current === null) gameRef.current = createGameState();
  const keys = useGameKeys(isActive);
  const [phase, setPhase] = useState(PHASES.ready);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    loadBestScore(FLAPPY_BEST_SCORE_KEY)
  );

  const flap = useCallback(() => {
    gameRef.current.velocityY = FLAP_VELOCITY;
  }, []);

  const startGame = useCallback(() => {
    gameRef.current = createGameState();
    gameRef.current.velocityY = FLAP_VELOCITY;
    setScore(0);
    setPhase(PHASES.running);
  }, []);

  useEffect(() => {
    if (phase === PHASES.running) return;

    const context = canvasRef.current.getContext("2d");
    drawFrame(context, gameRef.current);
    if (phase === PHASES.ready) {
      drawOverlay(context, "PRÊT ?", "Clique, touche ou appuie sur Espace");
    } else {
      drawOverlay(context, "PERDU !", "Clique pour reprendre ton envol");
    }
  }, [phase]);

  useEffect(() => {
    if (!isActive || phase === PHASES.running) return undefined;

    const handleStartKey = (event) => {
      if (event.key !== " " && event.key !== "ArrowUp") return;
      event.preventDefault();
      startGame();
    };

    window.addEventListener("keydown", handleStartKey);
    return () => window.removeEventListener("keydown", handleStartKey);
  }, [isActive, phase, startGame]);

  useEffect(() => {
    if (phase !== PHASES.running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = gameRef.current;
    let previousTime = null;
    let animationFrame;

    const registerPoint = () => {
      game.score += 1;
      setScore(game.score);
      setBestScore((currentBestScore) => {
        if (game.score <= currentBestScore) return currentBestScore;
        saveBestScore(FLAPPY_BEST_SCORE_KEY, game.score);
        return game.score;
      });
    };

    const recyclePipe = (pipe) => {
      const farthestPipeX = Math.max(...game.pipes.map((item) => item.x));
      const difficulty = getFlappyDifficulty(game.score);
      Object.assign(
        pipe,
        createPipe(farthestPipeX + PIPE_SPACING, difficulty)
      );
    };

    const loop = (currentTime) => {
      const deltaSeconds = getDeltaSeconds(currentTime, previousTime);
      previousTime = currentTime;
      const difficulty = getFlappyDifficulty(game.score);

      const keyboardFlap =
        Boolean(keys.current[" "]) || Boolean(keys.current.ArrowUp);
      if (keyboardFlap && !game.keyboardFlapHeld) flap();
      game.keyboardFlapHeld = keyboardFlap;

      game.velocityY += GRAVITY * deltaSeconds;
      game.birdY += game.velocityY * deltaSeconds;
      game.wingTime += deltaSeconds * 15;
      game.worldDistance += difficulty.pipeSpeed * deltaSeconds;

      game.pipes.forEach((pipe) => {
        pipe.x -= difficulty.pipeSpeed * deltaSeconds;
        if (shouldScorePipe(pipe)) {
          pipe.scored = true;
          registerPoint();
        }
      });
      game.pipes.forEach((pipe) => {
        if (pipe.x + PIPE_WIDTH < -10) recyclePipe(pipe);
      });

      const bird = {
        x: BIRD_X,
        y: game.birdY,
        radius: BIRD_COLLISION_RADIUS,
      };
      const hitsBoundary =
        bird.y - bird.radius <= 0 || bird.y + bird.radius >= GROUND_Y;
      if (hitsBoundary || hasBirdPipeCollision(bird, game.pipes)) {
        setPhase(PHASES.lost);
        return;
      }

      drawFrame(context, game);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [phase, keys, flap]);

  const handlePointerDown = (event) => {
    event.preventDefault();
    canvasRef.current?.focus();
    if (phase === PHASES.running) flap();
    else startGame();
  };

  const difficulty = getFlappyDifficulty(score);
  return (
    <CanvasGame
      title={`${score} · Record ${bestScore}`}
      status={
        phase === PHASES.ready
          ? "Prêt ?"
          : phase === PHASES.lost
            ? "Perdu !"
            : `Niveau ${difficulty.level}`
      }
      running={phase === PHASES.running}
      actionLabel={phase === PHASES.lost ? "Rejouer" : undefined}
      onRestart={startGame}
      help="Espace, ↑, clic ou toucher pour voler"
      canvasRef={canvasRef}
      canvasProps={{
        className: "flappy-canvas",
        tabIndex: 0,
        role: "button",
        "aria-label": "Zone de jeu Flappy Bird — cliquer pour voler",
        onPointerDown: handlePointerDown,
      }}
    />
  );
}
