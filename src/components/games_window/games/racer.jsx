import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import { getDeltaSeconds } from "./game_utils";
import useGameKeys from "./use_game_keys";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const ROAD_LEFT = 100;
const ROAD_RIGHT = 540;
const LANE_CENTERS = [180, 320, 460];
const CAR_WIDTH = 42;
const CAR_HEIGHT = 72;
const PLAYER_Y = 276;
const MINIMUM_SPEED = 75;
const CRUISING_SPEED = 130;
const MAXIMUM_SPEED = 245;
const DAMAGE_PER_HIT = 34;
const OFFSCREEN_LIMIT = CANVAS_HEIGHT + CAR_HEIGHT;

const OBSTACLE_COLORS = ["#ff453a", "#ff9f0a", "#bf5af2", "#ffd60a"];

export const getDifficulty = (distance) =>
  Math.min(10, 1 + Math.floor(distance / 1.2));

export const getSpawnInterval = (difficulty) =>
  Math.max(0.62, 1.45 - (difficulty - 1) * 0.085);

export const removeOffscreenObstacles = (obstacles) =>
  obstacles.filter((obstacle) => obstacle.y < OFFSCREEN_LIMIT);

export const getSafeSpawnLanes = (obstacles) => {
  const nearbyObstacles = obstacles.filter(
    (obstacle) => obstacle.y > -CAR_HEIGHT && obstacle.y < 165
  );
  const occupiedLanes = new Set(
    nearbyObstacles.map((obstacle) => obstacle.lane)
  );

  // Deux voies occupées dans une même vague suffisent : la troisième reste
  // toujours libre pour garantir une trajectoire esquivable.
  if (occupiedLanes.size >= 2) return [];

  return LANE_CENTERS.map((_, lane) => lane).filter(
    (lane) => !occupiedLanes.has(lane)
  );
};

const carsCollide = (obstacle, playerX) => {
  const horizontalOverlap =
    Math.abs(obstacle.x - playerX) < CAR_WIDTH - 7;
  const verticalOverlap =
    obstacle.y + CAR_HEIGHT > PLAYER_Y + 5 &&
    obstacle.y < PLAYER_Y + CAR_HEIGHT - 5;
  return horizontalOverlap && verticalOverlap;
};

const drawRoadside = (context, roadOffset) => {
  const grass = context.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
  grass.addColorStop(0, "#164f27");
  grass.addColorStop(0.5, "#24723a");
  grass.addColorStop(1, "#164f27");
  context.fillStyle = grass;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const sceneryOffset = roadOffset % 70;
  for (let y = -70 + sceneryOffset; y < CANVAS_HEIGHT + 70; y += 70) {
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(54, y + 6, 16, 28);
    context.fillRect(570, y + 6, 16, 28);
    context.fillStyle = "#75b84e";
    context.beginPath();
    context.arc(58, y + 8, 14, 0, Math.PI * 2);
    context.arc(582, y + 8, 14, 0, Math.PI * 2);
    context.fill();
  }
};

const drawShoulders = (context, roadOffset) => {
  context.fillStyle = "#242427";
  context.fillRect(ROAD_LEFT - 12, 0, 12, CANVAS_HEIGHT);
  context.fillRect(ROAD_RIGHT, 0, 12, CANVAS_HEIGHT);

  const curbOffset = roadOffset % 40;
  for (let y = -40 + curbOffset; y < CANVAS_HEIGHT + 40; y += 40) {
    context.fillStyle = "#f2f2f2";
    context.fillRect(ROAD_LEFT - 12, y, 12, 20);
    context.fillRect(ROAD_RIGHT, y, 12, 20);
    context.fillStyle = "#ff453a";
    context.fillRect(ROAD_LEFT - 12, y + 20, 12, 20);
    context.fillRect(ROAD_RIGHT, y + 20, 12, 20);
  }
};

const drawRoad = (context, roadOffset) => {
  drawRoadside(context, roadOffset);

  const asphalt = context.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
  asphalt.addColorStop(0, "#29292d");
  asphalt.addColorStop(0.5, "#3b3b40");
  asphalt.addColorStop(1, "#29292d");
  context.fillStyle = asphalt;
  context.fillRect(
    ROAD_LEFT,
    0,
    ROAD_RIGHT - ROAD_LEFT,
    CANVAS_HEIGHT
  );
  drawShoulders(context, roadOffset);

  const laneOffset = roadOffset % 62;
  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  [250, 390].forEach((x) => {
    for (let y = -62 + laneOffset; y < CANVAS_HEIGHT + 62; y += 62) {
      context.fillRect(x - 2, y, 4, 32);
    }
  });
};

const drawCarSprite = (context, car, isPlayer = false, opacity = 1) => {
  context.save();
  context.globalAlpha = opacity;
  context.translate(car.x, car.y);

  context.fillStyle = "rgba(0, 0, 0, 0.34)";
  context.beginPath();
  context.ellipse(3, CAR_HEIGHT - 1, 25, 10, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#111";
  [-18, 14].forEach((x) => {
    context.fillRect(x, 14, 5, 17);
    context.fillRect(x, 45, 5, 17);
  });

  context.fillStyle = car.color;
  context.beginPath();
  context.moveTo(-17, 8);
  context.quadraticCurveTo(-15, 2, -8, 0);
  context.lineTo(8, 0);
  context.quadraticCurveTo(15, 2, 17, 8);
  context.lineTo(19, 62);
  context.quadraticCurveTo(17, 70, 10, 72);
  context.lineTo(-10, 72);
  context.quadraticCurveTo(-17, 70, -19, 62);
  context.closePath();
  context.fill();

  context.fillStyle = isPlayer ? "#b8deff" : "#ffd7d2";
  context.beginPath();
  context.moveTo(-11, 15);
  context.lineTo(11, 15);
  context.lineTo(14, 31);
  context.lineTo(-14, 31);
  context.closePath();
  context.fill();

  context.fillStyle = "rgba(20, 31, 45, 0.82)";
  context.fillRect(-13, 39, 26, 15);
  context.fillStyle = "rgba(255, 255, 255, 0.35)";
  context.fillRect(-9, 18, 4, 11);

  context.fillStyle = "#fff5b8";
  context.fillRect(-13, 4, 7, 4);
  context.fillRect(6, 4, 7, 4);
  context.fillStyle = "#ff6b63";
  context.fillRect(-13, 65, 7, 4);
  context.fillRect(6, 65, 7, 4);

  if (isPlayer) {
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.fillRect(-2, 0, 4, 72);
  }

  context.restore();
};

const createObstacle = (lane, difficulty, random = Math.random) => ({
  lane,
  x: LANE_CENTERS[lane],
  y: -CAR_HEIGHT - 10,
  speedBonus: random() * 32 + difficulty * 7,
  color:
    OBSTACLE_COLORS[
      Math.min(
        Math.floor(random() * OBSTACLE_COLORS.length),
        OBSTACLE_COLORS.length - 1
      )
    ],
});

export default function Racer({ isActive }) {
  const canvasRef = useRef(null);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(CRUISING_SPEED);
  const [difficulty, setDifficulty] = useState(1);
  const [damage, setDamage] = useState(0);
  const [crashed, setCrashed] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = {
      obstacles: [],
      playerLane: 1,
      playerX: LANE_CENTERS[1],
      leftHeld: false,
      rightHeld: false,
      speed: CRUISING_SPEED,
      distance: 0,
      difficulty: 1,
      damage: 0,
      roadOffset: 0,
      spawnElapsed: 0,
      invulnerability: 0,
      impactFlash: 0,
      hudElapsed: 0,
    };
    let previousTime = null;
    let animationFrame;

    const updateLaneInput = () => {
      const leftPressed =
        keys.current.ArrowLeft || keys.current.a || keys.current.A;
      const rightPressed =
        keys.current.ArrowRight || keys.current.d || keys.current.D;

      if (leftPressed && !game.leftHeld) {
        game.playerLane = Math.max(0, game.playerLane - 1);
      }
      if (rightPressed && !game.rightHeld) {
        game.playerLane = Math.min(
          LANE_CENTERS.length - 1,
          game.playerLane + 1
        );
      }
      game.leftHeld = Boolean(leftPressed);
      game.rightHeld = Boolean(rightPressed);
    };

    const updateSpeed = (deltaSeconds) => {
      const accelerating =
        keys.current.ArrowUp || keys.current.w || keys.current.W;
      const braking =
        keys.current.ArrowDown || keys.current.s || keys.current.S;

      if (accelerating) game.speed += 72 * deltaSeconds;
      if (braking) game.speed -= 115 * deltaSeconds;
      if (!accelerating && !braking) game.speed -= 4 * deltaSeconds;
      game.speed = Math.max(
        MINIMUM_SPEED,
        Math.min(MAXIMUM_SPEED, game.speed)
      );
    };

    const trySpawnObstacle = () => {
      const safeLanes = getSafeSpawnLanes(game.obstacles);
      if (safeLanes.length === 0) return false;

      const lane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
      game.obstacles.push(createObstacle(lane, game.difficulty));
      return true;
    };

    const updateObstacles = (deltaSeconds) => {
      const obstacleBaseSpeed = game.speed * 1.5 + game.difficulty * 10;
      game.obstacles.forEach((obstacle) => {
        obstacle.y +=
          (obstacleBaseSpeed + obstacle.speedBonus) * deltaSeconds;
      });
      game.obstacles = removeOffscreenObstacles(game.obstacles);
    };

    const handleCollision = () => {
      if (game.invulnerability > 0) return false;
      const collidedObstacle = game.obstacles.find((obstacle) =>
        carsCollide(obstacle, game.playerX)
      );
      if (!collidedObstacle) return false;

      game.obstacles = game.obstacles.filter(
        (obstacle) => obstacle !== collidedObstacle
      );
      game.damage = Math.min(100, game.damage + DAMAGE_PER_HIT);
      game.invulnerability = 1.2;
      game.impactFlash = 1;
      setDamage(game.damage);

      if (game.damage >= 100) {
        setCrashed(true);
        setRunning(false);
        return true;
      }
      return false;
    };

    const updateHud = (deltaSeconds) => {
      game.hudElapsed += deltaSeconds;
      if (game.hudElapsed < 0.1) return;

      game.hudElapsed = 0;
      setDistance(game.distance);
      setSpeed(game.speed);
      setDifficulty(game.difficulty);
    };

    const loop = (currentTime) => {
      const deltaSeconds = getDeltaSeconds(currentTime, previousTime);
      previousTime = currentTime;

      updateLaneInput();
      updateSpeed(deltaSeconds);
      const targetX = LANE_CENTERS[game.playerLane];
      game.playerX +=
        (targetX - game.playerX) * Math.min(1, deltaSeconds * 10);

      game.distance += (game.speed * deltaSeconds) / 3600;
      game.difficulty = getDifficulty(game.distance);
      game.roadOffset += game.speed * 1.8 * deltaSeconds;
      game.spawnElapsed += deltaSeconds;
      game.invulnerability = Math.max(
        0,
        game.invulnerability - deltaSeconds
      );
      game.impactFlash = Math.max(0, game.impactFlash - deltaSeconds * 2.8);

      const spawnInterval = getSpawnInterval(game.difficulty);
      if (game.spawnElapsed >= spawnInterval) {
        if (trySpawnObstacle()) game.spawnElapsed = 0;
        else game.spawnElapsed = spawnInterval;
      }

      updateObstacles(deltaSeconds);
      if (handleCollision()) return;
      updateHud(deltaSeconds);

      drawRoad(context, game.roadOffset);
      game.obstacles.forEach((obstacle) => {
        drawCarSprite(context, obstacle);
      });

      const playerOpacity =
        game.invulnerability > 0 && Math.floor(currentTime / 90) % 2 === 0
          ? 0.42
          : 1;
      drawCarSprite(
        context,
        { x: game.playerX, y: PLAYER_Y, color: "#0a84ff" },
        true,
        playerOpacity
      );

      if (game.impactFlash > 0) {
        context.fillStyle = `rgba(255, 69, 58, ${game.impactFlash * 0.2})`;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [running, keys]);

  const restart = () => {
    setDistance(0);
    setSpeed(CRUISING_SPEED);
    setDifficulty(1);
    setDamage(0);
    setCrashed(false);
    setRunning(true);
  };

  const status = crashed
    ? "Moteur hors service"
    : damage >= 68
      ? "Dégâts critiques !"
      : `Difficulté ${difficulty}`;

  return (
    <CanvasGame
      title={`${distance.toFixed(1)} km · ${Math.round(speed)} km/h`}
      status={status}
      running={running}
      actionLabel={crashed ? "Rejouer" : undefined}
      onRestart={restart}
      controls={
        <div className="racer-dashboard">
          <span>↑ accélérer · ↓ freiner · ← → changer de voie</span>
          <div className="damage-meter">
            <span>Dégâts</span>
            <div
              role="progressbar"
              aria-label="Dégâts de la voiture"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={damage}
            >
              <i style={{ width: `${damage}%` }} />
            </div>
            <strong>{damage}%</strong>
          </div>
        </div>
      }
      help="Flèches ou WASD · change de voie et garde une trajectoire libre"
      canvasRef={canvasRef}
    />
  );
}
