import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const drawRoad = (context, distance) => {
  context.fillStyle = "#164f27";
  context.fillRect(0, 0, 640, 360);
  context.fillStyle = "#343438";
  context.fillRect(110, 0, 420, 360);

  context.strokeStyle = "#f5f5f5";
  context.lineWidth = 4;
  context.setLineDash([28, 24]);
  [250, 390].forEach((x) => {
    context.beginPath();
    context.moveTo(x, (-(distance * 20)) % 52);
    context.lineTo(x, 360);
    context.stroke();
  });
  context.setLineDash([]);
};

const drawCar = (
  context,
  car,
  color,
  windowColor,
  windowOffset,
  windowHeight
) => {
  context.fillStyle = color;
  context.fillRect(car.x, car.y, 34, 62);
  context.fillStyle = windowColor;
  context.fillRect(car.x + 5, car.y + windowOffset, 24, windowHeight);
};

export default function Racer({ isActive }) {
  const canvasRef = useRef(null);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [crashed, setCrashed] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const obstacles = [];
    let playerX = 300;
    let distance = 0;
    let lastScore = 0;
    let framesSinceSpawn = 0;
    let animationFrame;

    const loop = () => {
      if (keys.current.ArrowLeft || keys.current.a) playerX -= 6;
      if (keys.current.ArrowRight || keys.current.d) playerX += 6;
      playerX = Math.max(137, Math.min(463, playerX));

      distance += 0.18;
      framesSinceSpawn += 1;
      if (framesSinceSpawn > 48) {
        obstacles.push({
          x: 145 + Math.random() * 310,
          y: -70,
          speed: 4.5 + Math.random() * 2,
        });
        framesSinceSpawn = 0;
      }

      obstacles.forEach((car) => {
        car.y += car.speed + Math.min(distance / 120, 4);
      });

      const hasCrashed = obstacles.some(
        (car) =>
          car.y + 62 > 285 &&
          car.y < 347 &&
          car.x + 34 > playerX &&
          car.x < playerX + 34
      );
      if (hasCrashed) {
        setCrashed(true);
        setRunning(false);
        return;
      }

      const currentScore = Math.floor(distance);
      if (currentScore !== lastScore) {
        lastScore = currentScore;
        setScore(currentScore);
      }

      drawRoad(context, distance);
      drawCar(
        context,
        { x: playerX, y: 290 },
        "#0a84ff",
        "#b7dcff",
        10,
        14
      );
      obstacles.forEach((car) => {
        drawCar(context, car, "#ff453a", "#ffd0cc", 43, 13);
      });

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [running, keys]);

  const restart = () => {
    setScore(0);
    setCrashed(false);
    setRunning(true);
  };

  return (
    <CanvasGame
      title={`${score} km`}
      status={crashed ? "Accident !" : "Évite les voitures"}
      running={running}
      onRestart={restart}
      help="Flèches ← → ou A/D"
      canvasRef={canvasRef}
    />
  );
}
