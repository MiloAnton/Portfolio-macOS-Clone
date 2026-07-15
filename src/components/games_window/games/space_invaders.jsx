import { useEffect, useRef, useState } from "react";
import CanvasGame from "./canvas_game";
import useGameKeys from "./use_game_keys";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const PLAYER_WIDTH = 39;
const PLAYER_HEIGHT = 21;
const PLAYER_Y = 326;
const PLAYER_SPEED = 270;
const ENEMY_WIDTH = 33;
const ENEMY_HEIGHT = 24;
const FORMATION_LEFT = 24;
const FORMATION_RIGHT = CANVAS_WIDTH - 24;
const DEFENSE_LINE = PLAYER_Y - 12;
const PLAYER_SHOT_COOLDOWN = 0.28;

const INVADER_SPRITES = [
  [
    [
      "00010101000",
      "00001110000",
      "00111111100",
      "01101110110",
      "11111111111",
      "10111111101",
      "10100000101",
      "00011011000",
    ],
    [
      "00010101000",
      "10001110001",
      "10111111101",
      "11101110111",
      "11111111111",
      "00111111100",
      "01000000010",
      "10000000001",
    ],
  ],
  [
    [
      "00001110000",
      "00111111100",
      "01111111110",
      "11001110011",
      "11111111111",
      "00110110100",
      "01101011010",
      "11000000011",
    ],
    [
      "00001110000",
      "00111111100",
      "01111111110",
      "11001110011",
      "11111111111",
      "00011011000",
      "00110110100",
      "01100000110",
    ],
  ],
  [
    [
      "00000100000",
      "00001110000",
      "00011111000",
      "00110101100",
      "01111111110",
      "11101110111",
      "10100000101",
      "00011011000",
    ],
    [
      "00000100000",
      "01001110010",
      "01111111110",
      "11110101111",
      "11111111111",
      "00101110100",
      "01010001010",
      "10100000101",
    ],
  ],
];

const PLAYER_SPRITE = [
  "0000001000000",
  "0000011100000",
  "0000011100000",
  "0011111111100",
  "0111111111110",
  "1111111111111",
  "1111111111111",
];

const ENEMY_COLORS = ["#ff9f0a", "#bf5af2", "#30d158"];

export const getInvadersDeltaSeconds = (currentTime, previousTime) => {
  if (previousTime === null) return 1 / 60;
  return Math.min(Math.max((currentTime - previousTime) / 1000, 0), 0.05);
};

export const getEnemyFireInterval = (wave) =>
  Math.max(0.38, 1.18 - (wave - 1) * 0.075);

export const createEnemyFormation = (wave = 1) => {
  const columns = 8;
  const rows = Math.min(4, 3 + Math.floor((wave - 1) / 3));

  return Array.from({ length: columns * rows }, (_, index) => ({
    id: `wave-${wave}-enemy-${index}`,
    column: index % columns,
    type: Math.floor(index / columns) % INVADER_SPRITES.length,
    x: 91 + (index % columns) * 57,
    y: 42 + Math.floor(index / columns) * 41,
    alive: true,
  }));
};

export const removeOffscreenProjectiles = (
  projectiles,
  canvasHeight = CANVAS_HEIGHT
) =>
  projectiles.filter(
    (projectile) =>
      projectile.alive !== false &&
      projectile.y + projectile.height >= 0 &&
      projectile.y <= canvasHeight
  );

export const stepEnemyFormation = (
  enemies,
  direction,
  horizontalDistance,
  dropDistance = 13
) => {
  const livingEnemies = enemies.filter((enemy) => enemy.alive);
  if (livingEnemies.length === 0) {
    return { enemies, direction, turned: false };
  }

  const minimumX = Math.min(...livingEnemies.map((enemy) => enemy.x));
  const maximumX = Math.max(
    ...livingEnemies.map((enemy) => enemy.x + ENEMY_WIDTH)
  );
  const requestedMovement = direction * horizontalDistance;
  const touchesEdge =
    minimumX + requestedMovement < FORMATION_LEFT ||
    maximumX + requestedMovement > FORMATION_RIGHT;

  if (!touchesEdge) {
    return {
      enemies: enemies.map((enemy) =>
        enemy.alive ? { ...enemy, x: enemy.x + requestedMovement } : enemy
      ),
      direction,
      turned: false,
    };
  }

  // La formation est replacée exactement dans les limites avant l’inversion.
  // Elle ne peut donc pas inverser à nouveau pendant la frame suivante.
  const correction =
    direction > 0
      ? FORMATION_RIGHT - maximumX
      : FORMATION_LEFT - minimumX;
  return {
    enemies: enemies.map((enemy) =>
      enemy.alive
        ? { ...enemy, x: enemy.x + correction, y: enemy.y + dropDistance }
        : enemy
    ),
    direction: direction * -1,
    turned: true,
  };
};

export const hasInvaderReachedDefense = (enemies) =>
  enemies.some(
    (enemy) => enemy.alive && enemy.y + ENEMY_HEIGHT >= DEFENSE_LINE
  );

const rectanglesOverlap = (first, second) =>
  first.x < second.x + second.width &&
  first.x + first.width > second.x &&
  first.y < second.y + second.height &&
  first.y + first.height > second.y;

const createExplosion = (x, y, color) => ({
  life: 0.42,
  particles: Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    const speed = 35 + (index % 4) * 13;
    return {
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      color,
    };
  }),
});

const updateExplosions = (explosions, deltaSeconds) =>
  explosions
    .map((explosion) => ({
      ...explosion,
      life: explosion.life - deltaSeconds,
      particles: explosion.particles.map((particle) => ({
        ...particle,
        x: particle.x + particle.velocityX * deltaSeconds,
        y: particle.y + particle.velocityY * deltaSeconds,
      })),
    }))
    .filter((explosion) => explosion.life > 0);

const drawPixelSprite = (context, sprite, x, y, pixelSize, color) => {
  context.fillStyle = color;
  sprite.forEach((row, rowIndex) => {
    [...row].forEach((pixel, columnIndex) => {
      if (pixel === "1") {
        context.fillRect(
          Math.round(x + columnIndex * pixelSize),
          Math.round(y + rowIndex * pixelSize),
          pixelSize,
          pixelSize
        );
      }
    });
  });
};

const drawBackground = (context, elapsedTime, wave) => {
  context.fillStyle = "#050712";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let index = 0; index < 45; index += 1) {
    const brightness = 0.32 + ((index + Math.floor(elapsedTime * 3)) % 4) * 0.14;
    context.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    context.fillRect((index * 97) % CANVAS_WIDTH, (index * 43) % 305, 2, 2);
  }

  context.fillStyle = "rgba(48, 209, 88, 0.18)";
  context.fillRect(0, DEFENSE_LINE, CANVAS_WIDTH, 1);
  context.fillStyle = "rgba(255, 255, 255, 0.28)";
  context.font = "600 8px SFMono-Regular, Consolas, monospace";
  context.textAlign = "right";
  context.fillText(`WAVE ${String(wave).padStart(2, "0")}`, 628, 18);
};

const drawProjectile = (context, projectile, color, downward = false) => {
  context.save();
  context.shadowColor = color;
  context.shadowBlur = 8;
  context.fillStyle = color;
  context.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
  context.globalAlpha = 0.45;
  context.fillRect(
    projectile.x,
    projectile.y + (downward ? -5 : projectile.height),
    projectile.width,
    5
  );
  context.restore();
};

const drawFrame = (context, game, currentTime) => {
  const elapsedTime = currentTime / 1000;
  const animationFrame = Math.floor(elapsedTime * 3.5) % 2;
  drawBackground(context, elapsedTime, game.wave);

  game.enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    drawPixelSprite(
      context,
      INVADER_SPRITES[enemy.type][animationFrame],
      enemy.x,
      enemy.y,
      3,
      ENEMY_COLORS[enemy.type]
    );
  });

  const playerOpacity =
    game.playerInvulnerability > 0 && Math.floor(currentTime / 80) % 2 === 0
      ? 0.3
      : 1;
  context.save();
  context.globalAlpha = playerOpacity;
  drawPixelSprite(
    context,
    PLAYER_SPRITE,
    game.playerX,
    PLAYER_Y,
    3,
    "#64d2ff"
  );
  if (game.playerMuzzleFlash > 0) {
    context.fillStyle = "#fff7a8";
    context.fillRect(game.playerX + 18, PLAYER_Y - 9, 3, 7);
    context.fillStyle = "rgba(255, 214, 10, 0.55)";
    context.fillRect(game.playerX + 15, PLAYER_Y - 5, 9, 3);
  }
  context.restore();

  game.playerBullets.forEach((bullet) =>
    drawProjectile(context, bullet, "#ffd60a")
  );
  game.enemyBullets.forEach((bullet) =>
    drawProjectile(context, bullet, "#ff453a", true)
  );

  game.explosions.forEach((explosion) => {
    const opacity = Math.min(1, explosion.life * 4);
    explosion.particles.forEach((particle) => {
      context.globalAlpha = opacity;
      context.fillStyle = particle.color;
      context.fillRect(Math.round(particle.x), Math.round(particle.y), 4, 4);
    });
  });
  context.globalAlpha = 1;

  if (game.waveBanner > 0) {
    context.fillStyle = `rgba(5, 7, 18, ${Math.min(0.7, game.waveBanner)})`;
    context.fillRect(0, 135, CANVAS_WIDTH, 70);
    context.fillStyle = "white";
    context.textAlign = "center";
    context.font = "800 25px SFMono-Regular, Consolas, monospace";
    context.fillText(`VAGUE ${game.wave}`, CANVAS_WIDTH / 2, 178);
  }
};

const drawIdleFrame = (context, lost) => {
  const preview = {
    enemies: createEnemyFormation(1),
    playerX: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
    playerBullets: [],
    enemyBullets: [],
    explosions: [],
    playerInvulnerability: 0,
    playerMuzzleFlash: 0,
    wave: 1,
    waveBanner: 0,
  };
  drawFrame(context, preview, 0);
  context.fillStyle = "rgba(5, 7, 18, 0.72)";
  context.fillRect(0, 125, CANVAS_WIDTH, 92);
  context.fillStyle = "white";
  context.textAlign = "center";
  context.font = "800 25px SFMono-Regular, Consolas, monospace";
  context.fillText(lost ? "GAME OVER" : "SPACE INVADERS", 320, 165);
  context.font = "600 11px SFMono-Regular, Consolas, monospace";
  context.fillText(
    lost ? "La Terre a besoin d’une nouvelle tentative" : "PRÊT À DÉFENDRE LA TERRE ?",
    320,
    189
  );
};

const createGameState = () => ({
  playerX: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
  playerBullets: [],
  enemyBullets: [],
  enemies: createEnemyFormation(1),
  explosions: [],
  enemyDirection: 1,
  playerShotCooldown: 0,
  enemyShotCooldown: 0.8,
  playerMuzzleFlash: 0,
  playerInvulnerability: 0,
  waveBanner: 1.2,
  score: 0,
  lives: 3,
  wave: 1,
});

export default function SpaceInvaders({ isActive }) {
  const canvasRef = useRef(null);
  const touchControls = useRef({
    left: false,
    right: false,
    fire: false,
    fireQueued: false,
  });
  const keys = useGameKeys(isActive);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [lost, setLost] = useState(false);
  const [gameSession, setGameSession] = useState(0);

  useEffect(() => {
    if (running) return;
    const context = canvasRef.current?.getContext("2d");
    if (context) drawIdleFrame(context, lost);
  }, [lost, running]);

  useEffect(() => {
    if (!running) return undefined;

    const context = canvasRef.current.getContext("2d");
    context.imageSmoothingEnabled = false;
    const game = createGameState();
    let previousTime = null;
    let animationFrame;

    const shootPlayerBullet = () => {
      game.playerBullets.push({
        x: game.playerX + 18,
        y: PLAYER_Y - 11,
        width: 3,
        height: 11,
        alive: true,
      });
      game.playerShotCooldown = PLAYER_SHOT_COOLDOWN;
      game.playerMuzzleFlash = 0.1;
      touchControls.current.fireQueued = false;
    };

    const shootEnemyBullet = () => {
      const shooters = game.enemies.filter(
        (enemy) =>
          enemy.alive &&
          !game.enemies.some(
            (candidate) =>
              candidate.alive &&
              candidate.column === enemy.column &&
              candidate.y > enemy.y
          )
      );
      if (shooters.length === 0) return;

      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      game.enemyBullets.push({
        x: shooter.x + ENEMY_WIDTH / 2 - 2,
        y: shooter.y + ENEMY_HEIGHT,
        width: 4,
        height: 10,
        alive: true,
      });
      game.enemyShotCooldown = getEnemyFireInterval(game.wave);
    };

    const updatePlayer = (deltaSeconds) => {
      const movingLeft = keys.current.ArrowLeft || touchControls.current.left;
      const movingRight = keys.current.ArrowRight || touchControls.current.right;
      if (movingLeft) game.playerX -= PLAYER_SPEED * deltaSeconds;
      if (movingRight) game.playerX += PLAYER_SPEED * deltaSeconds;
      game.playerX = Math.max(
        8,
        Math.min(CANVAS_WIDTH - PLAYER_WIDTH - 8, game.playerX)
      );

      const wantsToFire =
        keys.current[" "] ||
        touchControls.current.fire ||
        touchControls.current.fireQueued;
      if (wantsToFire && game.playerShotCooldown <= 0) shootPlayerBullet();
    };

    const updateProjectiles = (deltaSeconds) => {
      game.playerBullets.forEach((bullet) => {
        bullet.y -= 390 * deltaSeconds;
      });
      game.enemyBullets.forEach((bullet) => {
        bullet.y += (175 + game.wave * 8) * deltaSeconds;
      });
    };

    const resolvePlayerShots = () => {
      let gainedScore = 0;
      game.playerBullets.forEach((bullet) => {
        const hitEnemy = game.enemies.find(
          (enemy) =>
            enemy.alive &&
            rectanglesOverlap(bullet, {
              x: enemy.x,
              y: enemy.y,
              width: ENEMY_WIDTH,
              height: ENEMY_HEIGHT,
            })
        );
        if (!hitEnemy) return;

        hitEnemy.alive = false;
        bullet.alive = false;
        const points = (3 - hitEnemy.type) * 10;
        gainedScore += points;
        game.explosions.push(
          createExplosion(
            hitEnemy.x + ENEMY_WIDTH / 2,
            hitEnemy.y + ENEMY_HEIGHT / 2,
            ENEMY_COLORS[hitEnemy.type]
          )
        );
      });

      if (gainedScore > 0) {
        game.score += gainedScore;
        setScore(game.score);
      }
    };

    const resolveEnemyShots = () => {
      if (game.playerInvulnerability > 0) return false;
      const playerRectangle = {
        x: game.playerX + 3,
        y: PLAYER_Y + 2,
        width: PLAYER_WIDTH - 6,
        height: PLAYER_HEIGHT - 2,
      };
      const hitBullet = game.enemyBullets.find(
        (bullet) => bullet.alive && rectanglesOverlap(bullet, playerRectangle)
      );
      if (!hitBullet) return false;

      hitBullet.alive = false;
      game.lives -= 1;
      game.playerInvulnerability = 0.9;
      game.explosions.push(
        createExplosion(game.playerX + PLAYER_WIDTH / 2, PLAYER_Y + 9, "#64d2ff")
      );
      setLives(game.lives);
      return game.lives <= 0;
    };

    const startNextWave = () => {
      game.wave += 1;
      game.enemies = createEnemyFormation(game.wave);
      game.enemyDirection = game.wave % 2 === 0 ? -1 : 1;
      game.enemyBullets = [];
      game.enemyShotCooldown = 0.85;
      game.waveBanner = 1.15;
      setWave(game.wave);
    };

    const loop = (currentTime) => {
      const deltaSeconds = getInvadersDeltaSeconds(currentTime, previousTime);
      previousTime = currentTime;
      game.playerShotCooldown = Math.max(
        0,
        game.playerShotCooldown - deltaSeconds
      );
      game.enemyShotCooldown -= deltaSeconds;
      game.playerMuzzleFlash = Math.max(
        0,
        game.playerMuzzleFlash - deltaSeconds
      );
      game.playerInvulnerability = Math.max(
        0,
        game.playerInvulnerability - deltaSeconds
      );
      game.waveBanner = Math.max(0, game.waveBanner - deltaSeconds);

      updatePlayer(deltaSeconds);
      const livingCount = game.enemies.filter((enemy) => enemy.alive).length;
      const formationSpeed =
        25 + game.wave * 4 + (game.enemies.length - livingCount) * 1.8;
      const formationStep = stepEnemyFormation(
        game.enemies,
        game.enemyDirection,
        formationSpeed * deltaSeconds
      );
      game.enemies = formationStep.enemies;
      game.enemyDirection = formationStep.direction;

      if (game.enemyShotCooldown <= 0) shootEnemyBullet();
      updateProjectiles(deltaSeconds);
      resolvePlayerShots();
      game.playerBullets = removeOffscreenProjectiles(game.playerBullets);
      game.enemyBullets = removeOffscreenProjectiles(game.enemyBullets);
      game.explosions = updateExplosions(game.explosions, deltaSeconds);

      if (resolveEnemyShots() || hasInvaderReachedDefense(game.enemies)) {
        setLost(true);
        setRunning(false);
        return;
      }

      // Cette vérification intervient après les impacts : le dernier ennemi
      // détruit ne peut plus déclencher une défaite pendant la même frame.
      if (!game.enemies.some((enemy) => enemy.alive)) startNextWave();

      drawFrame(context, game, currentTime);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameSession, keys, running]);

  const restart = () => {
    touchControls.current = {
      left: false,
      right: false,
      fire: false,
      fireQueued: false,
    };
    setScore(0);
    setLives(3);
    setWave(1);
    setLost(false);
    setGameSession((currentSession) => currentSession + 1);
    setRunning(true);
  };

  const setTouchControl = (control, pressed) => {
    touchControls.current[control] = pressed;
    if (control === "fire" && pressed) {
      touchControls.current.fireQueued = true;
    }
  };

  const createTouchHandlers = (control) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setTouchControl(control, true);
    },
    onPointerUp: () => setTouchControl(control, false),
    onPointerCancel: () => setTouchControl(control, false),
    onPointerLeave: () => setTouchControl(control, false),
  });

  const touchButtons = (
    <div className="space-invaders-controls" aria-label="Commandes tactiles">
      <button type="button" aria-label="Déplacer le vaisseau à gauche" {...createTouchHandlers("left")}>
        ◀
      </button>
      <button type="button" className="fire" aria-label="Tirer" {...createTouchHandlers("fire")}>
        ●
      </button>
      <button type="button" aria-label="Déplacer le vaisseau à droite" {...createTouchHandlers("right")}>
        ▶
      </button>
    </div>
  );

  return (
    <CanvasGame
      title={`${score} pts · ${"♥".repeat(lives)}${"♡".repeat(3 - lives)}`}
      status={lost ? "Invasion réussie…" : `Vague ${wave}`}
      running={running}
      onRestart={restart}
      actionLabel={lost ? "Rejouer" : undefined}
      controls={touchButtons}
      help="← → pour bouger · Espace pour tirer · commandes tactiles"
      canvasRef={canvasRef}
    />
  );
}
