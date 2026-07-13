import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const createEnemies = () =>
  Array.from({ length: 24 }, (_, index) => ({
    x: 105 + (index % 8) * 55,
    y: 45 + Math.floor(index / 8) * 42,
    alive: true,
  }));

const drawFrame = (context, playerX, bullets, enemies) => {
  context.fillStyle = "#080a16";
  context.fillRect(0, 0, 640, 360);

  context.fillStyle = "#fff";
  for (let index = 0; index < 35; index += 1) {
    context.fillRect((index * 97) % 640, (index * 43) % 330, 2, 2);
  }

  context.fillStyle = "#64d2ff";
  context.fillRect(playerX, 326, 40, 16);
  context.fillRect(playerX + 15, 316, 10, 10);

  context.fillStyle = "#ffd60a";
  bullets.forEach((bullet) => {
    context.fillRect(bullet.x, bullet.y, 3, 10);
  });

  context.fillStyle = "#30d158";
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    context.fillRect(enemy.x, enemy.y, 30, 20);
    context.fillRect(enemy.x + 5, enemy.y - 5, 5, 5);
    context.fillRect(enemy.x + 20, enemy.y - 5, 5, 5);
  });
};

export default function SpaceInvaders({ isActive }) {
  const canvasRef = useRef(null);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const bullets = [];
    const enemies = createEnemies();
    let playerX = 300;
    let shotLocked = false;
    let enemyDirection = 1;
    let animationFrame;

    const loop = () => {
      if (keys.current.ArrowLeft) playerX -= 5;
      if (keys.current.ArrowRight) playerX += 5;
      playerX = Math.max(10, Math.min(590, playerX));

      if (keys.current[" "] && !shotLocked) {
        bullets.push({ x: playerX + 19, y: 310 });
        shotLocked = true;
      }
      if (!keys.current[" "]) shotLocked = false;

      const livingEnemies = enemies.filter((enemy) => enemy.alive);
      const formationTouchesEdge = livingEnemies.some(
        (enemy) => enemy.x < 20 || enemy.x > 600
      );
      if (formationTouchesEdge) {
        enemyDirection *= -1;
        livingEnemies.forEach((enemy) => {
          enemy.y += 12;
        });
      }

      livingEnemies.forEach((enemy) => {
        enemy.x += enemyDirection * 0.7;
      });
      bullets.forEach((bullet) => {
        bullet.y -= 7;
      });

      bullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          const bulletHitsEnemy =
            enemy.alive &&
            bullet.x > enemy.x &&
            bullet.x < enemy.x + 30 &&
            bullet.y > enemy.y &&
            bullet.y < enemy.y + 22;

          if (bulletHitsEnemy) {
            enemy.alive = false;
            bullet.y = -20;
            setScore((currentScore) => currentScore + 10);
          }
        });
      });

      if (livingEnemies.some((enemy) => enemy.y > 285)) {
        setLost(true);
        setRunning(false);
        return;
      }
      if (!enemies.some((enemy) => enemy.alive)) {
        setRunning(false);
        return;
      }

      drawFrame(context, playerX, bullets, enemies);
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
      title={`${score} pts`}
      status={lost ? "Invasion réussie…" : "Protège la Terre"}
      running={running}
      onRestart={restart}
      help="← → pour bouger · Espace pour tirer"
      canvasRef={canvasRef}
    />
  );
}
