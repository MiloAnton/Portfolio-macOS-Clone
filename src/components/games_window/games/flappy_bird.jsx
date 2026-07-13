import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const createPipes = () => [
  { x: 520, gap: 160 },
  { x: 820, gap: 230 },
];

const drawBackground = (context, distance) => {
  const sky = context.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, "#66c9ff");
  sky.addColorStop(1, "#d9f3ff");
  context.fillStyle = sky;
  context.fillRect(0, 0, 640, 360);

  context.fillStyle = "rgba(255,255,255,.7)";
  for (let x = 40; x < 640; x += 170) {
    context.beginPath();
    context.arc(x - ((distance * 0.2) % 170), 65, 25, 0, Math.PI * 2);
    context.fill();
  }
};

const drawPipes = (context, pipes) => {
  context.fillStyle = "#30a84a";
  pipes.forEach((pipe) => {
    context.fillRect(pipe.x, 0, 58, pipe.gap - 70);
    context.fillRect(pipe.x, pipe.gap + 70, 58, 360);
  });
};

const drawBird = (context, birdY) => {
  context.fillStyle = "#ffd60a";
  context.beginPath();
  context.arc(126, birdY + 14, 15, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ff9f0a";
  context.fillRect(137, birdY + 11, 16, 7);
};

export default function FlappyBird({ isActive }) {
  const canvasRef = useRef(null);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const pipes = createPipes();
    let birdY = 180;
    let velocity = 0;
    let wasJumpPressed = false;
    let distance = 0;
    let animationFrame;

    const loop = () => {
      const jumpPressed = keys.current[" "] || keys.current.ArrowUp;
      if (jumpPressed && !wasJumpPressed) {
        velocity = -6.7;
      }
      wasJumpPressed = jumpPressed;

      velocity += 0.34;
      birdY += velocity;
      distance += 1;

      pipes.forEach((pipe) => {
        pipe.x -= 2.8;
        if (pipe.x < -60) {
          pipe.x += 600;
          pipe.gap = 105 + Math.random() * 145;
          setScore((currentScore) => currentScore + 1);
        }
      });

      const hitsBoundary = birdY < 0 || birdY > 338;
      const hitsPipe = pipes.some(
        (pipe) =>
          pipe.x < 152 &&
          pipe.x + 58 > 112 &&
          (birdY < pipe.gap - 70 || birdY + 28 > pipe.gap + 70)
      );
      if (hitsBoundary || hitsPipe) {
        setLost(true);
        setRunning(false);
        return;
      }

      drawBackground(context, distance);
      drawPipes(context, pipes);
      drawBird(context, birdY);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [running, keys]);

  const restart = () => {
    setScore(0);
    setLost(false);
    setRunning(true);
  };

  return (
    <CanvasGame
      title={`${score} tuyau${score > 1 ? "x" : ""}`}
      status={lost ? "Perdu !" : "Vole !"}
      running={running}
      onRestart={restart}
      help="Espace ou ↑"
      canvasRef={canvasRef}
    />
  );
}
