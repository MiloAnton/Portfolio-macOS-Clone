import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const WINNING_SCORE = 5;

const createGameState = () => ({
  playerY: 145,
  computerY: 145,
  ballX: 320,
  ballY: 180,
  velocityX: 5,
  velocityY: 3.2,
});

const drawFrame = (context, state) => {
  context.fillStyle = "#111";
  context.fillRect(0, 0, 640, 360);

  context.setLineDash([10, 10]);
  context.strokeStyle = "#555";
  context.beginPath();
  context.moveTo(320, 0);
  context.lineTo(320, 360);
  context.stroke();

  context.fillStyle = "white";
  context.fillRect(20, state.playerY, 12, 70);
  context.fillRect(608, state.computerY, 12, 70);
  context.beginPath();
  context.arc(state.ballX, state.ballY, 8, 0, Math.PI * 2);
  context.fill();
};

export default function Pong({ isActive }) {
  const canvasRef = useRef(null);
  const scoreRef = useRef([0, 0]);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState([0, 0]);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = createGameState();
    let animationFrame;

    const loop = () => {
      if (keys.current.ArrowUp || keys.current.w) game.playerY -= 6;
      if (keys.current.ArrowDown || keys.current.s) game.playerY += 6;
      game.playerY = Math.max(0, Math.min(290, game.playerY));

      game.computerY += Math.sign(game.ballY - (game.computerY + 35)) * 3.8;
      game.computerY = Math.max(0, Math.min(290, game.computerY));

      game.ballX += game.velocityX;
      game.ballY += game.velocityY;

      if (game.ballY < 8 || game.ballY > 352) {
        game.velocityY *= -1;
      }

      const hitsPlayer =
        game.ballX < 34 &&
        game.ballX > 20 &&
        game.ballY > game.playerY &&
        game.ballY < game.playerY + 70;
      if (hitsPlayer) {
        game.velocityX = Math.abs(game.velocityX) * 1.04;
      }

      const hitsComputer =
        game.ballX > 606 &&
        game.ballX < 620 &&
        game.ballY > game.computerY &&
        game.ballY < game.computerY + 70;
      if (hitsComputer) {
        game.velocityX = -Math.abs(game.velocityX) * 1.04;
      }

      const ballLeftTheField = game.ballX < 0 || game.ballX > 640;
      if (ballLeftTheField) {
        const nextScore = [...scoreRef.current];
        nextScore[game.ballX < 0 ? 1 : 0] += 1;
        scoreRef.current = nextScore;
        setScore(nextScore);

        if (Math.max(...nextScore) >= WINNING_SCORE) {
          setRunning(false);
          return;
        }

        game.ballX = 320;
        game.ballY = 180;
        game.velocityX = nextScore[0] > nextScore[1] ? -5 : 5;
      }

      drawFrame(context, game);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [running, keys]);

  const restart = () => {
    scoreRef.current = [0, 0];
    setScore([0, 0]);
    setRunning(true);
  };

  const gameOver = Math.max(...score) >= WINNING_SCORE;
  const status = gameOver
    ? score[0] > score[1]
      ? "Victoire !"
      : "Perdu !"
    : "Premier à 5";

  return (
    <CanvasGame
      title={`Toi ${score[0]} — ${score[1]} Mac`}
      status={status}
      running={running}
      onRestart={restart}
      help="Flèches ↑ ↓ ou W/S"
      canvasRef={canvasRef}
    />
  );
}
