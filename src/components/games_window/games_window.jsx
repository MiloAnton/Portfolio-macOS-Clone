import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import MenuBar from "../menu_bar/menu_bar";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";
import "./games_window.scss";

const GAME_LIST = [
  { id: "mines", name: "Démineur", icon: "💣" },
  { id: "pong", name: "Pong", icon: "🏓" },
  { id: "snake", name: "Snake", icon: "🐍" },
  { id: "racer", name: "Course", icon: "🏎️" },
];

const useGameKeys = () => {
  const keys = useRef({});
  useEffect(() => {
    const down = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }
      keys.current[event.key] = true;
    };
    const up = (event) => { keys.current[event.key] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
};

const createMinefield = () => {
  const cells = Array.from({ length: 81 }, (_, index) => ({
    index,
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));
  const mines = new Set();
  while (mines.size < 10) mines.add(Math.floor(Math.random() * 81));
  mines.forEach((index) => { cells[index].mine = true; });
  cells.forEach((cell) => {
    const row = Math.floor(cell.index / 9);
    const col = cell.index % 9;
    cell.adjacent = cells.filter((candidate) => {
      const candidateRow = Math.floor(candidate.index / 9);
      const candidateCol = candidate.index % 9;
      return candidate.mine && Math.abs(row - candidateRow) <= 1 && Math.abs(col - candidateCol) <= 1;
    }).length;
  });
  return cells;
};

function Minesweeper() {
  const [board, setBoard] = useState(createMinefield);
  const [status, setStatus] = useState("playing");

  const restart = () => { setBoard(createMinefield()); setStatus("playing"); };
  const reveal = (index) => {
    if (status !== "playing" || board[index].flagged || board[index].revealed) return;
    const next = board.map((cell) => ({ ...cell }));
    if (next[index].mine) {
      next.forEach((cell) => { if (cell.mine) cell.revealed = true; });
      setBoard(next); setStatus("lost"); return;
    }
    const queue = [index];
    const visited = new Set();
    while (queue.length) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      const cell = next[current];
      if (!cell || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      if (cell.adjacent === 0) {
        const row = Math.floor(current / 9);
        const col = current % 9;
        for (let r = row - 1; r <= row + 1; r += 1) {
          for (let c = col - 1; c <= col + 1; c += 1) {
            if (r >= 0 && r < 9 && c >= 0 && c < 9) queue.push(r * 9 + c);
          }
        }
      }
    }
    const won = next.filter((cell) => !cell.mine).every((cell) => cell.revealed);
    setBoard(next); if (won) setStatus("won");
  };
  const flag = (event, index) => {
    event.preventDefault();
    if (status !== "playing" || board[index].revealed) return;
    setBoard(board.map((cell) => cell.index === index ? { ...cell, flagged: !cell.flagged } : cell));
  };

  return (
    <div className="minesweeper game-stage">
      <div className="game-info"><span>💣 {board.filter((c) => c.mine).length - board.filter((c) => c.flagged).length}</span><strong>{status === "lost" ? "Perdu !" : status === "won" ? "Gagné !" : "À toi de jouer"}</strong><button onClick={restart}>Rejouer</button></div>
      <div className="mine-grid">
        {board.map((cell) => (
          <button
            type="button"
            key={cell.index}
            className={`${cell.revealed ? "revealed" : ""} n${cell.adjacent}`}
            onClick={() => reveal(cell.index)}
            onContextMenu={(event) => flag(event, cell.index)}
          >
            {cell.flagged ? "🚩" : cell.revealed && cell.mine ? "💣" : cell.revealed && cell.adjacent ? cell.adjacent : ""}
          </button>
        ))}
      </div>
      <p className="game-help">Clic pour révéler · clic droit pour poser un drapeau</p>
    </div>
  );
}

function Pong() {
  const canvasRef = useRef(null);
  const keys = useGameKeys();
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState([0, 0]);
  const scoreRef = useRef([0, 0]);

  useEffect(() => {
    if (!running) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const state = { player: 145, ai: 145, ballX: 320, ballY: 180, vx: 5, vy: 3.2 };
    let frame;
    const loop = () => {
      if (keys.current.ArrowUp || keys.current.w) state.player -= 6;
      if (keys.current.ArrowDown || keys.current.s) state.player += 6;
      state.player = Math.max(0, Math.min(290, state.player));
      state.ai += Math.sign(state.ballY - (state.ai + 35)) * 3.8;
      state.ai = Math.max(0, Math.min(290, state.ai));
      state.ballX += state.vx; state.ballY += state.vy;
      if (state.ballY < 8 || state.ballY > 352) state.vy *= -1;
      if (state.ballX < 34 && state.ballX > 20 && state.ballY > state.player && state.ballY < state.player + 70) state.vx = Math.abs(state.vx) * 1.04;
      if (state.ballX > 606 && state.ballX < 620 && state.ballY > state.ai && state.ballY < state.ai + 70) state.vx = -Math.abs(state.vx) * 1.04;
      if (state.ballX < 0 || state.ballX > 640) {
        const next = [...scoreRef.current]; next[state.ballX < 0 ? 1 : 0] += 1;
        scoreRef.current = next; setScore(next);
        if (Math.max(...next) >= 5) { setRunning(false); return; }
        state.ballX = 320; state.ballY = 180; state.vx = state.ballX < 0 ? 5 : (next[0] > next[1] ? -5 : 5);
      }
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, 640, 360);
      ctx.setLineDash([10, 10]); ctx.strokeStyle = "#555"; ctx.beginPath(); ctx.moveTo(320, 0); ctx.lineTo(320, 360); ctx.stroke();
      ctx.fillStyle = "white"; ctx.fillRect(20, state.player, 12, 70); ctx.fillRect(608, state.ai, 12, 70);
      ctx.beginPath(); ctx.arc(state.ballX, state.ballY, 8, 0, Math.PI * 2); ctx.fill();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, keys]);

  const restart = () => { scoreRef.current = [0, 0]; setScore([0, 0]); setRunning(true); };
  return <div className="canvas-game game-stage"><div className="game-info"><span>Toi {score[0]} — {score[1]} Mac</span><strong>{Math.max(...score) >= 5 ? (score[0] > score[1] ? "Victoire !" : "Perdu !") : "Premier à 5"}</strong><button onClick={restart}>{running ? "Recommencer" : "Jouer"}</button></div><canvas ref={canvasRef} width="640" height="360"/><p className="game-help">Flèches ↑ ↓ ou W/S</p></div>;
}

function Snake() {
  const canvasRef = useRef(null);
  const keys = useGameKeys();
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const ctx = canvasRef.current.getContext("2d");
    let snake = [{ x: 16, y: 9 }, { x: 15, y: 9 }, { x: 14, y: 9 }];
    let direction = { x: 1, y: 0 }; let food = { x: 23, y: 9 }; let last = 0; let frame;
    const loop = (time) => {
      if (time - last > 95) {
        if (keys.current.ArrowUp && direction.y !== 1) direction = { x: 0, y: -1 };
        if (keys.current.ArrowDown && direction.y !== -1) direction = { x: 0, y: 1 };
        if (keys.current.ArrowLeft && direction.x !== 1) direction = { x: -1, y: 0 };
        if (keys.current.ArrowRight && direction.x !== -1) direction = { x: 1, y: 0 };
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        if (head.x < 0 || head.x >= 32 || head.y < 0 || head.y >= 18 || snake.some((part) => part.x === head.x && part.y === head.y)) { setLost(true); setRunning(false); return; }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) { setScore((value) => value + 1); food = { x: Math.floor(Math.random() * 32), y: Math.floor(Math.random() * 18) }; } else snake.pop();
        last = time;
      }
      ctx.fillStyle = "#101613"; ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = "#30d158"; snake.forEach((part, index) => ctx.fillRect(part.x * 20 + 1, part.y * 20 + 1, 18, 18));
      ctx.fillStyle = "#ff453a"; ctx.beginPath(); ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2); ctx.fill();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, keys]);
  const restart = () => { setScore(0); setLost(false); setRunning(true); };
  return <div className="canvas-game game-stage"><div className="game-info"><span>Score {score}</span><strong>{lost ? "Perdu !" : "Mange les pommes"}</strong><button onClick={restart}>{running ? "Recommencer" : "Jouer"}</button></div><canvas ref={canvasRef} width="640" height="360"/><p className="game-help">Flèches directionnelles</p></div>;
}

function Racer() {
  const canvasRef = useRef(null);
  const keys = useGameKeys();
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [crashed, setCrashed] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const ctx = canvasRef.current.getContext("2d");
    let playerX = 300; let distance = 0; let lastScore = 0; let spawn = 0; let frame;
    const obstacles = [];
    const loop = () => {
      if (keys.current.ArrowLeft || keys.current.a) playerX -= 6;
      if (keys.current.ArrowRight || keys.current.d) playerX += 6;
      playerX = Math.max(137, Math.min(463, playerX)); distance += 0.18; spawn += 1;
      if (spawn > 48) { obstacles.push({ x: 145 + Math.random() * 310, y: -70, speed: 4.5 + Math.random() * 2 }); spawn = 0; }
      obstacles.forEach((car) => { car.y += car.speed + Math.min(distance / 120, 4); });
      const hit = obstacles.some((car) => car.y + 62 > 285 && car.y < 347 && car.x + 34 > playerX && car.x < playerX + 34);
      if (hit) { setCrashed(true); setRunning(false); return; }
      const currentScore = Math.floor(distance); if (currentScore !== lastScore) { lastScore = currentScore; setScore(currentScore); }
      ctx.fillStyle = "#164f27"; ctx.fillRect(0, 0, 640, 360); ctx.fillStyle = "#343438"; ctx.fillRect(110, 0, 420, 360);
      ctx.strokeStyle = "#f5f5f5"; ctx.lineWidth = 4; ctx.setLineDash([28, 24]); [250, 390].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, -(distance * 20) % 52); ctx.lineTo(x, 360); ctx.stroke(); });
      ctx.setLineDash([]); ctx.fillStyle = "#0a84ff"; ctx.fillRect(playerX, 290, 34, 62); ctx.fillStyle = "#b7dcff"; ctx.fillRect(playerX + 5, 300, 24, 14);
      obstacles.forEach((car) => { ctx.fillStyle = "#ff453a"; ctx.fillRect(car.x, car.y, 34, 62); ctx.fillStyle = "#ffd0cc"; ctx.fillRect(car.x + 5, car.y + 43, 24, 13); });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, keys]);
  const restart = () => { setScore(0); setCrashed(false); setRunning(true); };
  return <div className="canvas-game game-stage"><div className="game-info"><span>{score} km</span><strong>{crashed ? "Accident !" : "Évite les voitures"}</strong><button onClick={restart}>{running ? "Recommencer" : "Jouer"}</button></div><canvas ref={canvasRef} width="640" height="360"/><p className="game-help">Flèches ← → ou A/D</p></div>;
}

export default function GamesWindow(props) {
  const { position, handleDragStop } = usePersistentWindowPosition("games", 760, 570);
  const [game, setGame] = useState("mines");
  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox className={`App games-window ${props.isActive ? "window-active" : "window-inactive"}`} style={{ zIndex: props.zIndex }} onMouseDownCapture={props.handleClickZIndex} width={760} height={570} minConstraints={[560, 480]} maxConstraints={[1200, 900]} resizeHandles={["se"]}>
        <MenuBar title="Jeux" handleFullscreen={props.fullScreen} handleQuit={props.handleClose}/>
        <div className="games-app">
          <nav>{GAME_LIST.map((item) => <button type="button" className={game === item.id ? "selected" : ""} onClick={() => setGame(item.id)} key={item.id}><span>{item.icon}</span>{item.name}</button>)}</nav>
          <main>
            {game === "mines" && <Minesweeper />}
            {game === "pong" && <Pong />}
            {game === "snake" && <Snake />}
            {game === "racer" && <Racer />}
          </main>
        </div>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
