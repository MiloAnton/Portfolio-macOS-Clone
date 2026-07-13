import { useEffect, useRef, useState } from "react";

const useKeys = (enabled) => {
  const keys = useRef({});
  useEffect(() => {
    // N'écoute le clavier que si la fenêtre Jeux a le focus, sinon les
    // flèches/espace sont volées aux autres apps (scroll, terminal…).
    if (!enabled) return undefined;
    const down = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
      keys.current[event.key] = true;
    };
    const up = (event) => { keys.current[event.key] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.current = {};
    };
  }, [enabled]);
  return keys;
};

export function FlappyBird({ isActive }) {
  const canvasRef = useRef(null); const keys = useKeys(isActive);
  const [running, setRunning] = useState(false); const [score, setScore] = useState(0); const [lost, setLost] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const canvas = canvasRef.current; const ctx = canvas.getContext("2d");
    let birdY = 180; let velocity = 0; let lastSpace = false; let frame; let distance = 0;
    const pipes = [{ x: 520, gap: 160 }, { x: 820, gap: 230 }];
    const loop = () => {
      const pressed = keys.current[" "] || keys.current.ArrowUp;
      if (pressed && !lastSpace) velocity = -6.7; lastSpace = pressed;
      velocity += 0.34; birdY += velocity; distance += 1;
      pipes.forEach((pipe) => { pipe.x -= 2.8; if (pipe.x < -60) { pipe.x += 600; pipe.gap = 105 + Math.random() * 145; setScore((v) => v + 1); } });
      const collision = birdY < 0 || birdY > 338 || pipes.some((p) => p.x < 152 && p.x + 58 > 112 && (birdY < p.gap - 70 || birdY + 28 > p.gap + 70));
      if (collision) { setLost(true); setRunning(false); return; }
      const sky = ctx.createLinearGradient(0, 0, 0, 360); sky.addColorStop(0, "#66c9ff"); sky.addColorStop(1, "#d9f3ff"); ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = "rgba(255,255,255,.7)"; for (let x = 40; x < 640; x += 170) { ctx.beginPath(); ctx.arc(x - distance * .2 % 170, 65, 25, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#30a84a"; pipes.forEach((p) => { ctx.fillRect(p.x, 0, 58, p.gap - 70); ctx.fillRect(p.x, p.gap + 70, 58, 360); });
      ctx.fillStyle = "#ffd60a"; ctx.beginPath(); ctx.arc(126, birdY + 14, 15, 0, 7); ctx.fill(); ctx.fillStyle = "#ff9f0a"; ctx.fillRect(137, birdY + 11, 16, 7);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop); return () => cancelAnimationFrame(frame);
  }, [running, keys]);
  const restart = () => { setScore(0); setLost(false); setRunning(true); };
  return <CanvasShell title={`${score} tuyau${score > 1 ? "x" : ""}`} status={lost ? "Perdu !" : "Vole !"} running={running} restart={restart} help="Espace ou ↑" canvasRef={canvasRef}/>;
}

const addTile = (board) => {
  const empty = board.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0); if (!empty.length) return board;
  const next = [...board]; next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < .9 ? 2 : 4; return next;
};
const new2048 = () => addTile(addTile(Array(16).fill(0)));
const slideRow = (row) => {
  const values = row.filter(Boolean); const result = []; let gained = 0;
  for (let i = 0; i < values.length; i += 1) { if (values[i] === values[i + 1]) { const merged = values[i] * 2; result.push(merged); gained += merged; i += 1; } else result.push(values[i]); }
  return { row: [...result, ...Array(4 - result.length).fill(0)], gained };
};
const transpose = (b) => b.map((_, i) => b[(i % 4) * 4 + Math.floor(i / 4)]);
const reverseRows = (b) =>
  Array.from({ length: 4 }, (_, row) =>
    b.slice(row * 4, row * 4 + 4).reverse()
  ).flat();

export function Game2048({ isActive }) {
  const [board, setBoard] = useState(new2048); const [score, setScore] = useState(0);
  const move = (direction) => {
    let work = [...board]; if (direction === "up" || direction === "down") work = transpose(work); if (direction === "right" || direction === "down") work = reverseRows(work);
    let gained = 0; const moved = [];
    for (let r = 0; r < 4; r += 1) { const result = slideRow(work.slice(r * 4, r * 4 + 4)); moved.push(...result.row); gained += result.gained; }
    work = moved; if (direction === "right" || direction === "down") work = reverseRows(work); if (direction === "up" || direction === "down") work = transpose(work);
    if (work.some((v, i) => v !== board[i])) { setBoard(addTile(work)); setScore((s) => s + gained); }
  };
  useEffect(() => {
    if (!isActive) return undefined;
    const key = (event) => { const direction = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }[event.key]; if (direction) { event.preventDefault(); move(direction); } };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  const restart = () => { setBoard(new2048()); setScore(0); };
  return <div className="game-2048 game-stage"><div className="game-info"><span>Score {score}</span><strong>Objectif 2048</strong><button onClick={restart}>Rejouer</button></div><div className="grid-2048">{board.map((value, i) => <div className={`tile t${value}`} key={i}>{value || ""}</div>)}</div><p className="game-help">Flèches directionnelles</p></div>;
}

export function SpaceInvaders({ isActive }) {
  const canvasRef = useRef(null); const keys = useKeys(isActive);
  const [running, setRunning] = useState(false); const [score, setScore] = useState(0); const [lost, setLost] = useState(false);
  useEffect(() => {
    if (!running) return undefined; const ctx = canvasRef.current.getContext("2d"); let player = 300; let shotLock = false; let direction = 1; let frame;
    const bullets = []; const enemies = Array.from({ length: 24 }, (_, i) => ({ x: 105 + (i % 8) * 55, y: 45 + Math.floor(i / 8) * 42, alive: true }));
    const loop = () => {
      if (keys.current.ArrowLeft) player -= 5; if (keys.current.ArrowRight) player += 5; player = Math.max(10, Math.min(590, player));
      if (keys.current[" "] && !shotLock) { bullets.push({ x: player + 19, y: 310 }); shotLock = true; } if (!keys.current[" "]) shotLock = false;
      const alive = enemies.filter((e) => e.alive); const edge = alive.some((e) => e.x < 20 || e.x > 600); if (edge) { direction *= -1; alive.forEach((e) => { e.y += 12; }); }
      alive.forEach((e) => { e.x += direction * 0.7; }); bullets.forEach((b) => { b.y -= 7; });
      bullets.forEach((b) => enemies.forEach((e) => { if (e.alive && b.x > e.x && b.x < e.x + 30 && b.y > e.y && b.y < e.y + 22) { e.alive = false; b.y = -20; setScore((s) => s + 10); } }));
      if (alive.some((e) => e.y > 285)) { setLost(true); setRunning(false); return; } if (!enemies.some((e) => e.alive)) { setRunning(false); return; }
      ctx.fillStyle = "#080a16"; ctx.fillRect(0, 0, 640, 360); ctx.fillStyle = "#fff"; for (let i = 0; i < 35; i += 1) ctx.fillRect((i * 97) % 640, (i * 43) % 330, 2, 2);
      ctx.fillStyle = "#64d2ff"; ctx.fillRect(player, 326, 40, 16); ctx.fillRect(player + 15, 316, 10, 10); ctx.fillStyle = "#ffd60a"; bullets.forEach((b) => ctx.fillRect(b.x, b.y, 3, 10));
      ctx.fillStyle = "#30d158"; enemies.forEach((e) => { if (e.alive) { ctx.fillRect(e.x, e.y, 30, 20); ctx.fillRect(e.x + 5, e.y - 5, 5, 5); ctx.fillRect(e.x + 20, e.y - 5, 5, 5); } });
      frame = requestAnimationFrame(loop);
    }; frame = requestAnimationFrame(loop); return () => cancelAnimationFrame(frame);
  }, [running, keys]);
  const restart = () => { setScore(0); setLost(false); setRunning(true); };
  return <CanvasShell title={`${score} pts`} status={lost ? "Invasion réussie…" : "Protège la Terre"} running={running} restart={restart} help="← → pour bouger · Espace pour tirer" canvasRef={canvasRef}/>;
}

export function DoodleJump({ isActive }) {
  const canvasRef = useRef(null); const keys = useKeys(isActive);
  const [running, setRunning] = useState(false); const [score, setScore] = useState(0); const [lost, setLost] = useState(false);
  useEffect(() => {
    if (!running) return undefined; const ctx = canvasRef.current.getContext("2d"); let x = 300; let y = 260; let vy = -8; let points = 0; let frame;
    const platforms = Array.from({ length: 8 }, (_, i) => ({ x: 70 + Math.random() * 470, y: 330 - i * 48 }));
    const loop = () => {
      if (keys.current.ArrowLeft) x -= 5; if (keys.current.ArrowRight) x += 5; if (x < -20) x = 640; if (x > 640) x = -20;
      vy += .32; y += vy;
      platforms.forEach((p) => { if (vy > 0 && y + 34 > p.y && y + 34 < p.y + 12 && x + 26 > p.x && x < p.x + 72) vy = -8.6; });
      if (y < 130) { const shift = 130 - y; y = 130; platforms.forEach((p) => { p.y += shift; if (p.y > 360) { p.y = 0; p.x = 40 + Math.random() * 520; points += 1; setScore(points); } }); }
      if (y > 380) { setLost(true); setRunning(false); return; }
      ctx.fillStyle = "#eaf7ff"; ctx.fillRect(0, 0, 640, 360); ctx.strokeStyle = "#c8e5f3"; for (let gy = 0; gy < 360; gy += 24) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(640, gy); ctx.stroke(); }
      ctx.fillStyle = "#30a84a"; platforms.forEach((p) => ctx.fillRect(p.x, p.y, 72, 9)); ctx.fillStyle = "#ff9f0a"; ctx.fillRect(x, y, 27, 34); ctx.fillStyle = "#111"; ctx.fillRect(x + 5, y + 8, 4, 4); ctx.fillRect(x + 18, y + 8, 4, 4);
      frame = requestAnimationFrame(loop);
    }; frame = requestAnimationFrame(loop); return () => cancelAnimationFrame(frame);
  }, [running, keys]);
  const restart = () => { setScore(0); setLost(false); setRunning(true); };
  return <CanvasShell title={`${score} plateforme${score > 1 ? "s" : ""}`} status={lost ? "Chute libre !" : "Monte !"} running={running} restart={restart} help="Flèches ← →" canvasRef={canvasRef}/>;
}

export function Frogger({ isActive }) {
  const canvasRef = useRef(null); const [running, setRunning] = useState(false); const [wins, setWins] = useState(0); const [lost, setLost] = useState(false); const playerRef = useRef({ x: 300, y: 320 });
  useEffect(() => {
    // Listener clavier séparé de la boucle de jeu : perdre le focus coupe les
    // touches sans réinitialiser la partie en cours.
    if (!running || !isActive) return undefined;
    const key = (event) => { const p = playerRef.current; if (event.key === "ArrowUp") p.y -= 55; if (event.key === "ArrowDown") p.y += 55; if (event.key === "ArrowLeft") p.x -= 50; if (event.key === "ArrowRight") p.x += 50; p.x = Math.max(5, Math.min(605, p.x)); p.y = Math.max(5, Math.min(320, p.y)); event.preventDefault(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [running, isActive]);
  useEffect(() => {
    if (!running) return undefined; const ctx = canvasRef.current.getContext("2d"); let frame; const cars = Array.from({ length: 12 }, (_, i) => ({ x: (i * 117) % 700 - 60, y: 260 - (i % 4) * 55, speed: (i % 2 ? 2.7 : -3.2) }));
    const loop = () => {
      cars.forEach((c) => { c.x += c.speed; if (c.x > 680) c.x = -60; if (c.x < -70) c.x = 680; }); const p = playerRef.current;
      if (cars.some((c) => p.y + 30 > c.y && p.y < c.y + 30 && p.x + 30 > c.x && p.x < c.x + 55)) { setLost(true); setRunning(false); return; }
      if (p.y < 30) { setWins((v) => v + 1); p.x = 300; p.y = 320; }
      ctx.fillStyle = "#285d35"; ctx.fillRect(0, 0, 640, 360); ctx.fillStyle = "#343438"; ctx.fillRect(0, 75, 640, 235); ctx.strokeStyle = "#777"; ctx.setLineDash([18, 20]); [130, 185, 240].forEach((line) => { ctx.beginPath(); ctx.moveTo(0, line); ctx.lineTo(640, line); ctx.stroke(); }); ctx.setLineDash([]);
      cars.forEach((c, i) => { ctx.fillStyle = i % 2 ? "#ff453a" : "#0a84ff"; ctx.fillRect(c.x, c.y, 55, 30); }); ctx.fillStyle = "#30d158"; ctx.beginPath(); ctx.arc(p.x + 15, p.y + 15, 15, 0, 7); ctx.fill();
      frame = requestAnimationFrame(loop);
    }; frame = requestAnimationFrame(loop); return () => cancelAnimationFrame(frame);
  }, [running]);
  const restart = () => { playerRef.current = { x: 300, y: 320 }; setLost(false); setRunning(true); };
  return <CanvasShell title={`${wins} traversée${wins > 1 ? "s" : ""}`} status={lost ? "Écrasé !" : "Traverse la route"} running={running} restart={restart} help="Flèches directionnelles" canvasRef={canvasRef}/>;
}

const SIMON_COLORS = ["green", "red", "yellow", "blue"];
export function Simon() {
  const [sequence, setSequence] = useState([]); const [turn, setTurn] = useState("idle"); const [active, setActive] = useState(null); const [userIndex, setUserIndex] = useState(0); const [lost, setLost] = useState(false);
  const start = () => { setLost(false); setUserIndex(0); setSequence([Math.floor(Math.random() * 4)]); setTurn("computer"); };
  useEffect(() => {
    if (turn !== "computer" || !sequence.length) return undefined; const timers = [];
    sequence.forEach((color, index) => { timers.push(setTimeout(() => setActive(color), 500 + index * 650)); timers.push(setTimeout(() => setActive(null), 900 + index * 650)); });
    timers.push(setTimeout(() => { setTurn("user"); setUserIndex(0); }, 500 + sequence.length * 650)); return () => timers.forEach(clearTimeout);
  }, [sequence, turn]);
  const press = (color) => {
    if (turn !== "user") return; setActive(color); setTimeout(() => setActive(null), 180);
    if (sequence[userIndex] !== color) { setLost(true); setTurn("idle"); return; }
    if (userIndex === sequence.length - 1) { setTurn("computer"); setSequence((s) => [...s, Math.floor(Math.random() * 4)]); } else setUserIndex((i) => i + 1);
  };
  return <div className="simon game-stage"><div className="game-info"><span>Score {Math.max(0, sequence.length - 1)}</span><strong>{lost ? "Raté !" : turn === "computer" ? "Observe…" : turn === "user" ? "À toi" : "Mémorise la suite"}</strong><button onClick={start}>Rejouer</button></div><div className="simon-board">{SIMON_COLORS.map((color, i) => <button type="button" aria-label={color} className={`${color} ${active === i ? "active" : ""}`} onClick={() => press(i)} key={color}/>)}</div><p className="game-help">Reproduis la séquence de couleurs</p></div>;
}

function CanvasShell({ title, status, running, restart, help, canvasRef }) {
  return <div className="canvas-game game-stage"><div className="game-info"><span>{title}</span><strong>{status}</strong><button onClick={restart}>{running ? "Recommencer" : "Jouer"}</button></div><canvas ref={canvasRef} width="640" height="360"/><p className="game-help">{help}</p></div>;
}
