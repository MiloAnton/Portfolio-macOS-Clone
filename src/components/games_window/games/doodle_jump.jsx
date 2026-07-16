import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import { createPressHandlers, getDeltaSeconds } from "./game_utils";
import useGameKeys from "./use_game_keys";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 38;
const PLAYER_START_X = 305;
const PLAYER_START_Y = 275;
const GRAVITY = 1080;
const JUMP_VELOCITY = -510;
const SPRING_VELOCITY = -690;
const HORIZONTAL_SPEED = 245;
const CAMERA_LINE = 128;

const TILT_LABELS = {
  idle: "Activer l’inclinaison",
  enabled: "Inclinaison active",
  denied: "Accès refusé",
  unsupported: "Non disponible",
};

const clampPlatformX = (x, width) =>
  Math.max(18, Math.min(CANVAS_WIDTH - width - 18, x));

const createPlatformVariant = (index, x, y, random = Math.random) => {
  const typeRoll = random();
  const type = typeRoll < 0.18 ? "moving" : typeRoll < 0.34 ? "breakable" : "normal";
  const width = type === "normal" ? 78 : 72;

  return {
    id: `platform-${index}`,
    x: clampPlatformX(x, width),
    y,
    width,
    type,
    direction: random() < 0.5 ? -1 : 1,
    broken: false,
    breakTime: 0,
    spring: type !== "breakable" && random() < 0.16,
    springTime: 0,
    bonus: random() < 0.13,
    bonusCollected: false,
  };
};

export const createPlatforms = (random = Math.random) => {
  const safePlatform = {
    id: "starting-platform",
    x: 260,
    y: 315,
    width: 120,
    type: "normal",
    direction: 1,
    broken: false,
    breakTime: 0,
    spring: false,
    springTime: 0,
    bonus: false,
    bonusCollected: false,
    safe: true,
  };
  const platforms = [safePlatform];
  let previousX = safePlatform.x;
  let previousY = safePlatform.y;

  for (let index = 1; index < 9; index += 1) {
    const verticalGap = 43 + random() * 16;
    const horizontalShift = (random() - 0.5) * 260;
    const platform = createPlatformVariant(
      index,
      previousX + horizontalShift,
      previousY - verticalGap,
      random
    );
    platforms.push(platform);
    previousX = platform.x;
    previousY = platform.y;
  }

  return platforms;
};

export const getLandingPlatform = (player, previousBottom, platforms) => {
  if (player.velocityY <= 0) return null;
  const currentBottom = player.y + PLAYER_HEIGHT;

  return (
    platforms
      .filter((platform) => {
        if (platform.broken) return false;
        const horizontalOverlap =
          player.x + PLAYER_WIDTH - 4 > platform.x &&
          player.x + 4 < platform.x + platform.width;
        const crossedPlatform =
          previousBottom <= platform.y && currentBottom >= platform.y;
        return horizontalOverlap && crossedPlatform;
      })
      .sort((first, second) => first.y - second.y)[0] || null
  );
};

export const updateMovingPlatform = (platform, deltaSeconds) => {
  if (platform.type !== "moving" || platform.broken) return platform;

  const speed = 68;
  let x = platform.x + platform.direction * speed * deltaSeconds;
  let direction = platform.direction;
  if (x < 18 || x + platform.width > CANVAS_WIDTH - 18) {
    x = clampPlatformX(x, platform.width);
    direction *= -1;
  }
  return { ...platform, x, direction };
};

const recyclePlatform = (platform, platforms, score, random = Math.random) => {
  const highestPlatform = platforms
    .filter((candidate) => candidate !== platform)
    .reduce(
      (highest, candidate) =>
        candidate.y < highest.y ? candidate : highest,
      { x: 280, y: 0 }
    );
  const verticalGap = 44 + random() * Math.min(22, 14 + score * 0.15);
  const horizontalShift = (random() - 0.5) * 280;
  const recycled = createPlatformVariant(
    platform.id,
    highestPlatform.x + horizontalShift,
    highestPlatform.y - verticalGap,
    random
  );
  recycled.id = platform.id;
  return recycled;
};

const drawBackground = (context, distance) => {
  context.fillStyle = "#eaf7ff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.strokeStyle = "rgba(131, 190, 220, 0.32)";
  context.lineWidth = 1;
  const lineOffset = distance % 24;
  for (let y = -24 + lineOffset; y < CANVAS_HEIGHT; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(CANVAS_WIDTH, y);
    context.stroke();
  }

  context.strokeStyle = "rgba(255, 99, 71, 0.18)";
  context.beginPath();
  context.moveTo(48, 0);
  context.lineTo(48, CANVAS_HEIGHT);
  context.stroke();
};

const drawSpring = (context, platform) => {
  const springX = platform.x + platform.width / 2 - 7;
  const compression = platform.springTime > 0 ? 3 : 0;
  context.strokeStyle = "#56565b";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(springX, platform.y);
  context.lineTo(springX + 4, platform.y - 9 + compression);
  context.lineTo(springX + 9, platform.y - 2);
  context.lineTo(springX + 14, platform.y - 11 + compression);
  context.stroke();
  context.fillStyle = "#ff453a";
  context.fillRect(springX - 1, platform.y - 14 + compression, 17, 4);
};

const drawBonus = (context, platform, elapsedTime) => {
  if (!platform.bonus || platform.bonusCollected || platform.broken) return;
  const centerX = platform.x + platform.width / 2;
  const centerY = platform.y - 22 + Math.sin(elapsedTime * 5) * 2;
  context.fillStyle = "rgba(255, 214, 10, 0.22)";
  context.beginPath();
  context.arc(centerX, centerY, 12, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffd60a";
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? 8 : 3.5;
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
};

const drawPlatform = (context, platform, elapsedTime) => {
  if (platform.broken) {
    context.save();
    context.globalAlpha = Math.max(0, platform.breakTime * 2.5);
    context.fillStyle = "#b2784c";
    context.fillRect(platform.x, platform.y, platform.width / 2 - 3, 8);
    context.fillRect(
      platform.x + platform.width / 2 + 3,
      platform.y + 5,
      platform.width / 2 - 3,
      8
    );
    context.restore();
    return;
  }

  if (platform.type === "moving") {
    context.fillStyle = "#1689c9";
    context.fillRect(platform.x, platform.y, platform.width, 10);
    context.fillStyle = "#7dd9ff";
    context.fillRect(platform.x + 5, platform.y + 2, platform.width - 10, 3);
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    const arrowX = platform.x + platform.width / 2;
    context.fillRect(arrowX - 7, platform.y + 4, 14, 2);
    context.fillRect(
      arrowX + (platform.direction > 0 ? 5 : -7),
      platform.y + 2,
      2,
      6
    );
  } else if (platform.type === "breakable") {
    context.fillStyle = "#a8683e";
    context.fillRect(platform.x, platform.y, platform.width, 11);
    context.strokeStyle = "#663c26";
    context.beginPath();
    context.moveTo(platform.x + platform.width * 0.45, platform.y);
    context.lineTo(platform.x + platform.width * 0.52, platform.y + 6);
    context.lineTo(platform.x + platform.width * 0.46, platform.y + 11);
    context.stroke();
  } else {
    context.fillStyle = "#2d9147";
    context.fillRect(platform.x, platform.y, platform.width, 11);
    context.fillStyle = "#67cd62";
    context.fillRect(platform.x + 2, platform.y, platform.width - 4, 4);
  }

  if (platform.spring) drawSpring(context, platform);
  drawBonus(context, platform, elapsedTime);
};

const drawCharacter = (context, player, elapsedTime) => {
  const airborneMotion = Math.sin(elapsedTime * 11) * 2;
  const lookingLeft = player.direction < 0;

  context.save();
  context.translate(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2);
  context.scale(lookingLeft ? -1 : 1, 1);

  context.strokeStyle = "#593b2a";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(-7, 8);
  context.lineTo(-11 - airborneMotion, 16);
  context.moveTo(7, 8);
  context.lineTo(11 + airborneMotion, 16);
  context.stroke();

  context.fillStyle = "#8bd34f";
  context.beginPath();
  context.ellipse(0, 3, 13, 16, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#b8ec72";
  context.beginPath();
  context.ellipse(1, 4, 7, 11, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "white";
  context.beginPath();
  context.arc(5, -7, 5, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#1a1a1a";
  context.beginPath();
  context.arc(7, -7, 2, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ff9f0a";
  context.beginPath();
  context.moveTo(10, -4);
  context.lineTo(18, 0);
  context.lineTo(10, 3);
  context.closePath();
  context.fill();
  context.restore();
};

const drawFrame = (context, game, currentTime) => {
  const elapsedTime = currentTime / 1000;
  drawBackground(context, game.distance);
  game.platforms.forEach((platform) =>
    drawPlatform(context, platform, elapsedTime)
  );
  drawCharacter(context, game.player, elapsedTime);

  if (game.bonusFlash > 0) {
    context.globalAlpha = Math.min(1, game.bonusFlash * 3);
    context.fillStyle = "#ff9f0a";
    context.font = "800 15px -apple-system, BlinkMacSystemFont, sans-serif";
    context.textAlign = "center";
    context.fillText("BONUS +5", game.player.x + 15, game.player.y - 12);
    context.globalAlpha = 1;
  }
};

const drawIdleFrame = (context, lost) => {
  const game = {
    distance: 0,
    platforms: createPlatforms(() => 0.5),
    player: {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      velocityY: 0,
      direction: 1,
    },
    bonusFlash: 0,
  };
  drawFrame(context, game, 0);
  context.fillStyle = "rgba(234, 247, 255, 0.83)";
  context.fillRect(0, 126, CANVAS_WIDTH, 82);
  context.fillStyle = "#28536a";
  context.textAlign = "center";
  context.font = "800 25px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(lost ? "OUPS !" : "DOODLE JUMP", 320, 163);
  context.font = "600 11px -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(
    lost ? "La prochaine plateforme n’est pas loin" : "PRÊT À MONTER ?",
    320,
    185
  );
};

const createGameState = () => ({
  player: {
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    velocityY: 0,
    direction: 1,
  },
  platforms: createPlatforms(),
  score: 0,
  distance: 0,
  bonusFlash: 0,
});

export default function DoodleJump({ isActive }) {
  const canvasRef = useRef(null);
  const touchDirectionRef = useRef(0);
  const tiltRef = useRef(0);
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltStatus, setTiltStatus] = useState("idle");
  const [gameSession, setGameSession] = useState(0);

  useEffect(() => {
    if (running) return;
    const context = canvasRef.current?.getContext("2d");
    if (context) drawIdleFrame(context, lost);
  }, [lost, running]);

  useEffect(() => {
    if (!tiltEnabled) return undefined;

    const handleOrientation = (event) => {
      const gamma = Number(event.gamma) || 0;
      tiltRef.current = Math.abs(gamma) < 3 ? 0 : Math.max(-1, Math.min(1, gamma / 22));
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [tiltEnabled]);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    const game = createGameState();
    let previousTime = null;
    let animationFrame;

    const updatePlatforms = (deltaSeconds) => {
      game.platforms = game.platforms.map((platform) => {
        let updatedPlatform = updateMovingPlatform(platform, deltaSeconds);
        if (updatedPlatform.broken) {
          updatedPlatform = {
            ...updatedPlatform,
            breakTime: updatedPlatform.breakTime - deltaSeconds,
            y: updatedPlatform.y + 150 * deltaSeconds,
          };
        }
        if (updatedPlatform.springTime > 0) {
          updatedPlatform = {
            ...updatedPlatform,
            springTime: Math.max(0, updatedPlatform.springTime - deltaSeconds),
          };
        }
        return updatedPlatform;
      });
    };

    const collectBonuses = () => {
      game.platforms.forEach((platform) => {
        if (!platform.bonus || platform.bonusCollected || platform.broken) return;
        const bonusRectangle = {
          x: platform.x + platform.width / 2 - 11,
          y: platform.y - 34,
          width: 22,
          height: 25,
        };
        const overlapsBonus =
          game.player.x < bonusRectangle.x + bonusRectangle.width &&
          game.player.x + PLAYER_WIDTH > bonusRectangle.x &&
          game.player.y < bonusRectangle.y + bonusRectangle.height &&
          game.player.y + PLAYER_HEIGHT > bonusRectangle.y;
        if (!overlapsBonus) return;

        platform.bonusCollected = true;
        game.score += 5;
        game.player.velocityY = Math.min(game.player.velocityY, -590);
        game.bonusFlash = 0.65;
        setScore(game.score);
      });
    };

    const recyclePlatforms = () => {
      game.platforms = game.platforms.map((platform) => {
        if (platform.y <= CANVAS_HEIGHT + 22) return platform;
        game.score += 1;
        setScore(game.score);
        return recyclePlatform(platform, game.platforms, game.score);
      });
    };

    const loop = (currentTime) => {
      const deltaSeconds = getDeltaSeconds(currentTime, previousTime);
      previousTime = currentTime;
      game.bonusFlash = Math.max(0, game.bonusFlash - deltaSeconds);

      const keyboardDirection =
        (keys.current.ArrowRight ? 1 : 0) - (keys.current.ArrowLeft ? 1 : 0);
      const direction = keyboardDirection || touchDirectionRef.current || tiltRef.current;
      if (Math.abs(direction) > 0.05) game.player.direction = Math.sign(direction);
      game.player.x += direction * HORIZONTAL_SPEED * deltaSeconds;
      if (game.player.x < -PLAYER_WIDTH) game.player.x = CANVAS_WIDTH;
      if (game.player.x > CANVAS_WIDTH) game.player.x = -PLAYER_WIDTH;

      updatePlatforms(deltaSeconds);
      const previousBottom = game.player.y + PLAYER_HEIGHT;
      game.player.velocityY += GRAVITY * deltaSeconds;
      game.player.y += game.player.velocityY * deltaSeconds;

      const landingPlatform = getLandingPlatform(
        game.player,
        previousBottom,
        game.platforms
      );
      if (landingPlatform) {
        game.player.y = landingPlatform.y - PLAYER_HEIGHT;
        if (landingPlatform.type === "breakable") {
          landingPlatform.broken = true;
          landingPlatform.breakTime = 0.45;
        } else {
          game.player.velocityY = landingPlatform.spring
            ? SPRING_VELOCITY
            : JUMP_VELOCITY;
          if (landingPlatform.spring) landingPlatform.springTime = 0.16;
        }
      }

      collectBonuses();
      if (game.player.y < CAMERA_LINE) {
        const verticalShift = CAMERA_LINE - game.player.y;
        game.player.y = CAMERA_LINE;
        game.distance += verticalShift;
        game.platforms.forEach((platform) => {
          platform.y += verticalShift;
        });
      }
      recyclePlatforms();

      if (game.player.y > CANVAS_HEIGHT + 30) {
        setLost(true);
        setRunning(false);
        return;
      }

      drawFrame(context, game, currentTime);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameSession, keys, running]);

  const restart = () => {
    touchDirectionRef.current = 0;
    tiltRef.current = 0;
    setScore(0);
    setLost(false);
    setGameSession((currentSession) => currentSession + 1);
    setRunning(true);
  };

  const requestTiltControl = async () => {
    const OrientationEvent = window.DeviceOrientationEvent;
    if (!OrientationEvent) {
      setTiltStatus("unsupported");
      return;
    }

    try {
      if (typeof OrientationEvent.requestPermission === "function") {
        const permission = await OrientationEvent.requestPermission();
        if (permission !== "granted") {
          setTiltStatus("denied");
          return;
        }
      }
      setTiltEnabled(true);
      setTiltStatus("enabled");
    } catch (error) {
      setTiltStatus("denied");
    }
  };

  const touchHandlers = (direction) =>
    createPressHandlers(
      () => {
        touchDirectionRef.current = direction;
      },
      () => {
        if (touchDirectionRef.current === direction) touchDirectionRef.current = 0;
      }
    );

  const controls = (
    <div className="doodle-controls" aria-label="Commandes de Doodle Jump">
      <button type="button" aria-label="Aller à gauche" {...touchHandlers(-1)}>
        ◀
      </button>
      <button
        type="button"
        className={tiltEnabled ? "tilt-enabled" : ""}
        onClick={requestTiltControl}
        aria-pressed={tiltEnabled}
      >
        {TILT_LABELS[tiltStatus]}
      </button>
      <button type="button" aria-label="Aller à droite" {...touchHandlers(1)}>
        ▶
      </button>
    </div>
  );

  return (
    <CanvasGame
      title={`${score} point${score > 1 ? "s" : ""}`}
      status={lost ? "Chute libre !" : "Monte !"}
      running={running}
      onRestart={restart}
      actionLabel={lost ? "Rejouer" : undefined}
      controls={controls}
      help="Flèches ← → · commandes tactiles · inclinaison optionnelle"
      canvasRef={canvasRef}
    />
  );
}
