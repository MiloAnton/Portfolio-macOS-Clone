import { useState } from "react";

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

const getStatusLabel = (status) => {
  if (status === "lost") return "Perdu !";
  if (status === "won") return "Gagné !";
  return "À toi de jouer";
};

export default function Minesweeper() {
  const [board, setBoard] = useState(createMinefield);
  const [status, setStatus] = useState("playing");

  const restart = () => {
    setBoard(createMinefield());
    setStatus("playing");
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

    setBoard((currentBoard) =>
      currentBoard.map((cell) =>
        cell.index === index ? { ...cell, flagged: !cell.flagged } : cell
      )
    );
  };

  const remainingMines =
    board.filter((cell) => cell.mine).length -
    board.filter((cell) => cell.flagged).length;

  return (
    <div className="minesweeper game-stage">
      <div className="game-info">
        <span>💣 {remainingMines}</span>
        <strong>{getStatusLabel(status)}</strong>
        <button type="button" onClick={restart}>
          Rejouer
        </button>
      </div>

      <div className="mine-grid">
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
