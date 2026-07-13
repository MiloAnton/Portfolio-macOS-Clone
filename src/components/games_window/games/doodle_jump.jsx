import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const createPlatforms = () =>
  Array.from({ length: 8 }, (_, index) => ({
    x: 70 + Math.random() * 470,
    y: 330 - index * 48,
  }));

const drawFrame = (context, player, platforms) => {
  context.fillStyle = "#eaf7ff";
  context.fillRect(0, 0, 640, 360);

  context.strokeStyle = "#c8e5f3";
  for (let y = 0; y < 360; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(640, y);
    context.stroke();
  }

  context.fillStyle = "#30a84a";
  platforms.forEach((platform) => {
    context.fillRect(platform.x, platform.y, 72, 9);
  });

  context.fillStyle = "#ff9f0a";
  context.fillRect(player.x, player.y, 27, 34);
  context.fillStyle = "#111";
  context.fillRect(player.x + 5, player.y + 8, 4, 4);
  context.fillRect(player.x + 18, player.y + 8, 4, 4);
};

export default function DoodleJump({ isActive }) {
  const canvasRef = useRef(null);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const platforms = createPlatforms();
    const player = { x: 300, y: 260, velocityY: -8 };
    let points = 0;
    let animationFrame;

    const loop = () => {
      if (keys.current.ArrowLeft) player.x -= 5;
      if (keys.current.ArrowRight) player.x += 5;
      if (player.x < -20) player.x = 640;
      if (player.x > 640) player.x = -20;

      player.velocityY += 0.32;
      player.y += player.velocityY;

      platforms.forEach((platform) => {
        const landsOnPlatform =
          player.velocityY > 0 &&
          player.y + 34 > platform.y &&
          player.y + 34 < platform.y + 12 &&
          player.x + 26 > platform.x &&
          player.x < platform.x + 72;

        if (landsOnPlatform) player.velocityY = -8.6;
      });

      if (player.y < 130) {
        const verticalShift = 130 - player.y;
        player.y = 130;

        platforms.forEach((platform) => {
          platform.y += verticalShift;
          if (platform.y > 360) {
            platform.y = 0;
            platform.x = 40 + Math.random() * 520;
            points += 1;
            setScore(points);
          }
        });
      }

      if (player.y > 380) {
        setLost(true);
        setRunning(false);
        return;
      }

      drawFrame(context, player, platforms);
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
      title={`${score} plateforme${score > 1 ? "s" : ""}`}
      status={lost ? "Chute libre !" : "Monte !"}
      running={running}
      onRestart={restart}
      help="Flèches ← →"
      canvasRef={canvasRef}
    />
  );
}
