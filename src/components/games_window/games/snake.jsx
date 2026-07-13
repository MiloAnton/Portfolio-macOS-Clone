import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const GRID_WIDTH = 32;
const GRID_HEIGHT = 18;
const CELL_SIZE = 20;

const createSnake = () => [
  { x: 16, y: 9 },
  { x: 15, y: 9 },
  { x: 14, y: 9 },
];

const createFood = () => ({
  x: Math.floor(Math.random() * GRID_WIDTH),
  y: Math.floor(Math.random() * GRID_HEIGHT),
});

const isCollision = (head, snake) =>
  head.x < 0 ||
  head.x >= GRID_WIDTH ||
  head.y < 0 ||
  head.y >= GRID_HEIGHT ||
  snake.some((part) => part.x === head.x && part.y === head.y);

const drawFrame = (context, snake, food) => {
  context.fillStyle = "#101613";
  context.fillRect(0, 0, 640, 360);

  context.fillStyle = "#30d158";
  snake.forEach((part) => {
    context.fillRect(
      part.x * CELL_SIZE + 1,
      part.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  });

  context.fillStyle = "#ff453a";
  context.beginPath();
  context.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    8,
    0,
    Math.PI * 2
  );
  context.fill();
};

export default function Snake({ isActive }) {
  const canvasRef = useRef(null);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const snake = createSnake();
    let direction = { x: 1, y: 0 };
    let food = { x: 23, y: 9 };
    let lastMoveTime = 0;
    let animationFrame;

    const loop = (time) => {
      if (time - lastMoveTime > 95) {
        if (keys.current.ArrowUp && direction.y !== 1) {
          direction = { x: 0, y: -1 };
        }
        if (keys.current.ArrowDown && direction.y !== -1) {
          direction = { x: 0, y: 1 };
        }
        if (keys.current.ArrowLeft && direction.x !== 1) {
          direction = { x: -1, y: 0 };
        }
        if (keys.current.ArrowRight && direction.x !== -1) {
          direction = { x: 1, y: 0 };
        }

        const head = {
          x: snake[0].x + direction.x,
          y: snake[0].y + direction.y,
        };

        if (isCollision(head, snake)) {
          setLost(true);
          setRunning(false);
          return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          setScore((currentScore) => currentScore + 1);
          food = createFood();
        } else {
          snake.pop();
        }

        lastMoveTime = time;
      }

      drawFrame(context, snake, food);
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
      title={`Score ${score}`}
      status={lost ? "Perdu !" : "Mange les pommes"}
      running={running}
      onRestart={restart}
      help="Flèches directionnelles"
      canvasRef={canvasRef}
    />
  );
}
