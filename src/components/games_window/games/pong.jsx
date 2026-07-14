import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const WINNING_SCORE = 5;
const COUNTDOWN_SECONDS = 3;
const TRAIL_LENGTH = 9;
const REFERENCE_FRAME_DURATION = 1000 / 60;
const MAX_FRAME_SCALE = 3;
const BALL_RADIUS = 8;
const PADDLE_HEIGHT = 70;
const PLAYER_COLLISION_X = 40;
const COMPUTER_COLLISION_X = 600;
const SERVE_TOWARD_PLAYER = -1;
const SERVE_TOWARD_COMPUTER = 1;

const PHASES = {
  idle: "idle",
  countdown: "countdown",
  running: "running",
  finished: "finished",
};

export const getFrameScale = (currentTime, previousTime) => {
  if (previousTime === null) return 1;

  const elapsedTime = Math.max(0, currentTime - previousTime);
  return Math.min(elapsedTime / REFERENCE_FRAME_DURATION, MAX_FRAME_SCALE);
};

export const getSweptPaddleCollision = ({
  previousBall,
  currentBall,
  paddleY,
  side,
}) => {
  const collisionX =
    side === "player" ? PLAYER_COLLISION_X : COMPUTER_COLLISION_X;
  const travelsTowardPaddle =
    side === "player"
      ? currentBall.x < previousBall.x
      : currentBall.x > previousBall.x;
  const crossesPaddle =
    side === "player"
      ? previousBall.x >= collisionX && currentBall.x <= collisionX
      : previousBall.x <= collisionX && currentBall.x >= collisionX;

  if (!travelsTowardPaddle || !crossesPaddle) return null;

  const horizontalDistance = currentBall.x - previousBall.x;
  const collisionProgress =
    horizontalDistance === 0
      ? 0
      : (collisionX - previousBall.x) / horizontalDistance;
  const collisionY =
    previousBall.y +
    (currentBall.y - previousBall.y) * collisionProgress;
  const overlapsPaddle =
    collisionY + BALL_RADIUS >= paddleY &&
    collisionY - BALL_RADIUS <= paddleY + PADDLE_HEIGHT;

  return overlapsPaddle ? { x: collisionX, y: collisionY } : null;
};

export const getServeDirectionAfterPoint = (ballExitX) =>
  ballExitX < 0 ? SERVE_TOWARD_PLAYER : SERVE_TOWARD_COMPUTER;

const createGameState = (serveDirection = SERVE_TOWARD_COMPUTER) => ({
  playerY: 145,
  computerY: 145,
  ballX: 320,
  ballY: 180,
  velocityX: 5 * serveDirection,
  velocityY: 3.2,
});

const drawCourt = (context, state) => {
  context.fillStyle = "#111";
  context.fillRect(0, 0, 640, 360);

  context.setLineDash([10, 10]);
  context.strokeStyle = "#555";
  context.beginPath();
  context.moveTo(320, 0);
  context.lineTo(320, 360);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = "white";
  context.fillRect(20, state.playerY, 12, 70);
  context.fillRect(608, state.computerY, 12, 70);
};

const drawBallTrail = (context, trail) => {
  trail.forEach((point, index) => {
    const progress = (index + 1) / trail.length;
    context.fillStyle = `rgba(100, 210, 255, ${progress * 0.3})`;
    context.beginPath();
    context.arc(point.x, point.y, 2 + progress * 4, 0, Math.PI * 2);
    context.fill();
  });
};

const drawImpactFlash = (context, impact) => {
  if (impact.strength <= 0) return;

  context.fillStyle = `rgba(130, 220, 255, ${impact.strength * 0.55})`;
  context.beginPath();
  context.arc(
    impact.x,
    impact.y,
    18 + impact.strength * 28,
    0,
    Math.PI * 2
  );
  context.fill();

  context.fillStyle = `rgba(255, 255, 255, ${impact.strength * 0.08})`;
  context.fillRect(0, 0, 640, 360);
};

const drawFrame = (context, state, trail = [], impact = null) => {
  drawCourt(context, state);
  drawBallTrail(context, trail);
  if (impact) drawImpactFlash(context, impact);

  context.fillStyle = "white";
  context.beginPath();
  context.arc(state.ballX, state.ballY, 8, 0, Math.PI * 2);
  context.fill();
};

const drawCountdown = (context, state, countdown) => {
  drawFrame(context, state);
  context.fillStyle = "rgba(0, 0, 0, 0.38)";
  context.fillRect(0, 0, 640, 360);

  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  context.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif";
  context.textAlign = "center";
  context.fillText("SERVICE", 320, 135);

  context.fillStyle = "white";
  context.font = "700 86px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(String(countdown), 320, 230);
};

const triggerImpact = (impact, x, y) => {
  impact.x = x;
  impact.y = y;
  impact.strength = 0.8;
};

export default function Pong({ isActive }) {
  const canvasRef = useRef(null);
  const scoreRef = useRef([0, 0]);
  const serveDirectionRef = useRef(SERVE_TOWARD_COMPUTER);
  const keys = useGameKeys(isActive);
  const [phase, setPhase] = useState(PHASES.idle);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [sessionId, setSessionId] = useState(0);
  const [score, setScore] = useState([0, 0]);

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
    if (phase !== PHASES.countdown) return;
    const context = canvasRef.current.getContext("2d");
    drawCountdown(
      context,
      createGameState(serveDirectionRef.current),
      countdown
    );
  }, [phase, countdown, score]);

  useEffect(() => {
    if (phase !== PHASES.running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = createGameState(serveDirectionRef.current);
    const trail = [];
    const impact = { x: game.ballX, y: game.ballY, strength: 0 };
    let animationFrame;
    let previousFrameTime = null;

    const loop = (currentTime) => {
      const frameScale = getFrameScale(currentTime, previousFrameTime);
      previousFrameTime = currentTime;

      if (keys.current.ArrowUp || keys.current.w) {
        game.playerY -= 6 * frameScale;
      }
      if (keys.current.ArrowDown || keys.current.s) {
        game.playerY += 6 * frameScale;
      }
      game.playerY = Math.max(0, Math.min(290, game.playerY));

      game.computerY +=
        Math.sign(game.ballY - (game.computerY + 35)) * 3.8 * frameScale;
      game.computerY = Math.max(0, Math.min(290, game.computerY));

      trail.push({ x: game.ballX, y: game.ballY });
      if (trail.length > TRAIL_LENGTH) trail.shift();

      const previousBall = { x: game.ballX, y: game.ballY };
      game.ballX += game.velocityX * frameScale;
      game.ballY += game.velocityY * frameScale;

      if (game.ballY < 8 || game.ballY > 352) {
        game.ballY = Math.max(8, Math.min(352, game.ballY));
        game.velocityY *= -1;
        triggerImpact(impact, game.ballX, game.ballY);
      }

      const playerCollision = getSweptPaddleCollision({
        previousBall,
        currentBall: { x: game.ballX, y: game.ballY },
        paddleY: game.playerY,
        side: "player",
      });
      if (playerCollision) {
        game.ballX = playerCollision.x;
        game.ballY = playerCollision.y;
        game.velocityX = Math.abs(game.velocityX) * 1.04;
        triggerImpact(impact, playerCollision.x, playerCollision.y);
      }

      const computerCollision = getSweptPaddleCollision({
        previousBall,
        currentBall: { x: game.ballX, y: game.ballY },
        paddleY: game.computerY,
        side: "computer",
      });
      if (computerCollision) {
        game.ballX = computerCollision.x;
        game.ballY = computerCollision.y;
        game.velocityX = -Math.abs(game.velocityX) * 1.04;
        triggerImpact(impact, computerCollision.x, computerCollision.y);
      }

      const ballLeftTheField = game.ballX < 0 || game.ballX > 640;
      if (ballLeftTheField) {
        serveDirectionRef.current = getServeDirectionAfterPoint(game.ballX);
        const nextScore = [...scoreRef.current];
        nextScore[game.ballX < 0 ? 1 : 0] += 1;
        scoreRef.current = nextScore;
        setScore(nextScore);

        if (Math.max(...nextScore) >= WINNING_SCORE) {
          setPhase(PHASES.finished);
        } else {
          setCountdown(COUNTDOWN_SECONDS);
          setPhase(PHASES.countdown);
        }
        return;
      }

      drawFrame(context, game, trail, impact);
      impact.strength = Math.max(
        0,
        impact.strength - 0.075 * frameScale
      );
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [phase, keys]);

  const restart = () => {
    scoreRef.current = [0, 0];
    serveDirectionRef.current = SERVE_TOWARD_COMPUTER;
    setScore([0, 0]);
    setCountdown(COUNTDOWN_SECONDS);
    setSessionId((currentId) => currentId + 1);
    setPhase(PHASES.countdown);
  };

  const gameOver = phase === PHASES.finished;
  const status =
    phase === PHASES.countdown
      ? `Service dans ${countdown}`
      : gameOver
        ? score[0] > score[1]
          ? "Victoire !"
          : "Perdu !"
        : "Premier à 5";
  const gameInProgress =
    phase === PHASES.countdown || phase === PHASES.running;

  return (
    <CanvasGame
      title={`Toi ${score[0]} — ${score[1]} Mac`}
      status={status}
      running={gameInProgress}
      onRestart={restart}
      help="Flèches ↑ ↓ ou W/S"
      canvasRef={canvasRef}
    />
  );
}
