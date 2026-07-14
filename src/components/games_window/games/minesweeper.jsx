import { useEffect, useState } from "react";

const BOARD_SIZE = 9;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const MINE_COUNT = 10;

const createMinefield = () => {
  const cells = Array.from({ length: CELL_COUNT }, (_, index) => ({
    index,
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));
  const mineIndexes = new Set();

  while (mineIndexes.size < MINE_COUNT) {
    mineIndexes.add(Math.floor(Math.random() * CELL_COUNT));
  }

  mineIndexes.forEach((index) => {
    cells[index].mine = true;
  });

  cells.forEach((cell) => {
    const row = Math.floor(cell.index / BOARD_SIZE);
    const column = cell.index % BOARD_SIZE;

    cell.adjacent = cells.filter((candidate) => {
      const candidateRow = Math.floor(candidate.index / BOARD_SIZE);
      const candidateColumn = candidate.index % BOARD_SIZE;
      const isNeighbour =
        Math.abs(row - candidateRow) <= 1 &&
        Math.abs(column - candidateColumn) <= 1;

      return candidate.mine && isNeighbour;
    }).length;
  });

  return cells;
};

const getCellContent = (cell) => {
  if (cell.flagged) return "🚩";
  if (!cell.revealed) return "";
  if (cell.mine) return "💣";
  return cell.adjacent || "";
};

const STATUS_DISPLAY = {
  playing: { face: "🙂", label: "Partie en cours" },
  lost: { face: "😵", label: "Partie perdue" },
  won: { face: "😎", label: "Partie gagnée" },
};

const formatDigitalCounter = (value) => {
  const limitedValue = Math.max(-99, Math.min(value, 999));
  if (limitedValue < 0) {
    return `-${String(Math.abs(limitedValue)).padStart(2, "0")}`;
  }
  return String(limitedValue).padStart(3, "0");
};

export default function Minesweeper() {
  const [board, setBoard] = useState(createMinefield);
  const [status, setStatus] = useState("playing");
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!hasStarted || status !== "playing") return undefined;

    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => Math.min(seconds + 1, 999));
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, status]);

  const restart = () => {
    setBoard(createMinefield());
    setStatus("playing");
    setHasStarted(false);
    setElapsedSeconds(0);
  };

  const reveal = (index) => {
    const selectedCell = board[index];
    if (
      status !== "playing" ||
      selectedCell.flagged ||
      selectedCell.revealed
    ) {
      return;
    }

    setHasStarted(true);
    const nextBoard = board.map((cell) => ({ ...cell }));
    if (nextBoard[index].mine) {
      nextBoard.forEach((cell) => {
        if (cell.mine) cell.revealed = true;
      });
      setBoard(nextBoard);
      setStatus("lost");
      return;
    }

    const queue = [index];
    const visited = new Set();

    while (queue.length > 0) {
      const currentIndex = queue.shift();
      if (visited.has(currentIndex)) continue;
      visited.add(currentIndex);

      const cell = nextBoard[currentIndex];
      if (!cell || cell.flagged || cell.mine) continue;
      cell.revealed = true;

      if (cell.adjacent !== 0) continue;
      const row = Math.floor(currentIndex / BOARD_SIZE);
      const column = currentIndex % BOARD_SIZE;

      for (let neighbourRow = row - 1; neighbourRow <= row + 1; neighbourRow += 1) {
        for (
          let neighbourColumn = column - 1;
          neighbourColumn <= column + 1;
          neighbourColumn += 1
        ) {
          const isInsideBoard =
            neighbourRow >= 0 &&
            neighbourRow < BOARD_SIZE &&
            neighbourColumn >= 0 &&
            neighbourColumn < BOARD_SIZE;

          if (isInsideBoard) {
            queue.push(neighbourRow * BOARD_SIZE + neighbourColumn);
          }
        }
      }
    }

    const hasWon = nextBoard
      .filter((cell) => !cell.mine)
      .every((cell) => cell.revealed);

    setBoard(nextBoard);
    if (hasWon) setStatus("won");
  };

  const toggleFlag = (event, index) => {
    event.preventDefault();
    if (status !== "playing" || board[index].revealed) return;

    const flaggedCells = board.filter((cell) => cell.flagged).length;
    const isAddingFlag = !board[index].flagged;
    if (isAddingFlag && flaggedCells >= MINE_COUNT) return;

    setHasStarted(true);
    setBoard((currentBoard) =>
      currentBoard.map((cell) =>
        cell.index === index ? { ...cell, flagged: !cell.flagged } : cell
      )
    );
  };

  const remainingMines =
    board.filter((cell) => cell.mine).length -
    board.filter((cell) => cell.flagged).length;
  const statusDisplay = STATUS_DISPLAY[status];

  return (
    <div className="minesweeper game-stage">
      <div className="minesweeper-scoreboard">
        <div
          className="digital-counter"
          aria-label={`${remainingMines} mines restantes`}
        >
          <strong aria-hidden="true">
            {formatDigitalCounter(remainingMines)}
          </strong>
          <span>MINES</span>
        </div>

        <button
          type="button"
          className={`minesweeper-status status-${status}`}
          aria-label={`${statusDisplay.label}. Nouvelle partie`}
          title={`${statusDisplay.label} — recommencer`}
          onClick={restart}
        >
          <span aria-hidden="true">{statusDisplay.face}</span>
        </button>

        <div
          className="digital-counter timer-counter"
          role="timer"
          aria-label={`${elapsedSeconds} secondes écoulées`}
        >
          <strong aria-hidden="true">
            {formatDigitalCounter(elapsedSeconds)}
          </strong>
          <span>TEMPS</span>
        </div>
      </div>

      <div className={`mine-grid status-${status}`}>
        {board.map((cell) => (
          <button
            type="button"
            key={cell.index}
            className={`${cell.revealed ? "revealed" : ""} n${cell.adjacent}`}
            onClick={() => reveal(cell.index)}
            onContextMenu={(event) => toggleFlag(event, cell.index)}
          >
            {getCellContent(cell)}
          </button>
        ))}
      </div>

      <p className="game-help">
        Clic pour révéler · clic droit pour poser un drapeau
      </p>
    </div>
  );
}
