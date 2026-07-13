import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";

const START_POSITION = { x: 300, y: 320 };
const ARROW_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

const createCars = () =>
  Array.from({ length: 12 }, (_, index) => ({
    x: (index * 117) % 700 - 60,
    y: 260 - (index % 4) * 55,
    speed: index % 2 ? 2.7 : -3.2,
  }));

const carHitsPlayer = (car, player) =>
  player.y + 30 > car.y &&
  player.y < car.y + 30 &&
  player.x + 30 > car.x &&
  player.x < car.x + 55;

const drawFrame = (context, cars, player) => {
  context.fillStyle = "#285d35";
  context.fillRect(0, 0, 640, 360);
  context.fillStyle = "#343438";
  context.fillRect(0, 75, 640, 235);

  context.strokeStyle = "#777";
  context.setLineDash([18, 20]);
  [130, 185, 240].forEach((y) => {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(640, y);
    context.stroke();
  });
  context.setLineDash([]);

  cars.forEach((car, index) => {
    context.fillStyle = index % 2 ? "#ff453a" : "#0a84ff";
    context.fillRect(car.x, car.y, 55, 30);
  });

  context.fillStyle = "#30d158";
  context.beginPath();
  context.arc(player.x + 15, player.y + 15, 15, 0, Math.PI * 2);
  context.fill();
};

export default function Frogger({ isActive }) {
  const canvasRef = useRef(null);
  const playerRef = useRef({ ...START_POSITION });
  const [running, setRunning] = useState(false);
  const [wins, setWins] = useState(0);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    // Perdre le focus coupe les commandes sans réinitialiser la partie.
    if (!running || !isActive) return undefined;

    const handleKeyDown = (event) => {
      if (!ARROW_KEYS.has(event.key)) return;
      event.preventDefault();

      const player = playerRef.current;
      if (event.key === "ArrowUp") player.y -= 55;
      if (event.key === "ArrowDown") player.y += 55;
      if (event.key === "ArrowLeft") player.x -= 50;
      if (event.key === "ArrowRight") player.x += 50;

      player.x = Math.max(5, Math.min(605, player.x));
      player.y = Math.max(5, Math.min(320, player.y));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [running, isActive]);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const cars = createCars();
    let animationFrame;

    const loop = () => {
      cars.forEach((car) => {
        car.x += car.speed;
        if (car.x > 680) car.x = -60;
        if (car.x < -70) car.x = 680;
      });

      const player = playerRef.current;
      if (cars.some((car) => carHitsPlayer(car, player))) {
        setLost(true);
        setRunning(false);
        return;
      }

      if (player.y < 30) {
        setWins((currentWins) => currentWins + 1);
        player.x = START_POSITION.x;
        player.y = START_POSITION.y;
      }

      drawFrame(context, cars, player);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [running]);

  const restart = () => {
    playerRef.current = { ...START_POSITION };
    setLost(false);
    setRunning(true);
  };

  return (
    <CanvasGame
      title={`${wins} traversée${wins > 1 ? "s" : ""}`}
      status={lost ? "Écrasé !" : "Traverse la route"}
      running={running}
      onRestart={restart}
      help="Flèches directionnelles"
      canvasRef={canvasRef}
    />
  );
}
