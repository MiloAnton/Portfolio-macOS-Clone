import { useCallback, useEffect, useState } from "react";

const DIRECTIONS_BY_KEY = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

const addTile = (board) => {
  const emptyIndexes = board
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index >= 0);

  if (emptyIndexes.length === 0) return board;

  const nextBoard = [...board];
  const randomIndex =
    emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  nextBoard[randomIndex] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
};

const createBoard = () => addTile(addTile(Array(16).fill(0)));

const slideRow = (row) => {
  const values = row.filter(Boolean);
  const result = [];
  let gained = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const mergedValue = values[index] * 2;
      result.push(mergedValue);
      gained += mergedValue;
      index += 1;
    } else {
      result.push(values[index]);
    }
  }

  return {
    row: [...result, ...Array(4 - result.length).fill(0)],
    gained,
  };
};

const transpose = (board) =>
  board.map(
    (_, index) => board[(index % 4) * 4 + Math.floor(index / 4)]
  );

const reverseRows = (board) =>
  Array.from({ length: 4 }, (_, row) =>
    board.slice(row * 4, row * 4 + 4).reverse()
  ).flat();

const moveBoard = (board, direction) => {
  let workingBoard = [...board];
  const isVertical = direction === "up" || direction === "down";
  const isReversed = direction === "right" || direction === "down";

  if (isVertical) workingBoard = transpose(workingBoard);
  if (isReversed) workingBoard = reverseRows(workingBoard);

  const movedBoard = [];
  let gained = 0;
  for (let row = 0; row < 4; row += 1) {
    const result = slideRow(workingBoard.slice(row * 4, row * 4 + 4));
    movedBoard.push(...result.row);
    gained += result.gained;
  }

  workingBoard = movedBoard;
  if (isReversed) workingBoard = reverseRows(workingBoard);
  if (isVertical) workingBoard = transpose(workingBoard);

  const hasMoved = workingBoard.some(
    (value, index) => value !== board[index]
  );
  return { board: workingBoard, gained, hasMoved };
};

export default function Game2048({ isActive }) {
  const [board, setBoard] = useState(createBoard);
  const [score, setScore] = useState(0);

  const move = useCallback(
    (direction) => {
      const result = moveBoard(board, direction);
      if (!result.hasMoved) return;

      setBoard(addTile(result.board));
      setScore((currentScore) => currentScore + result.gained);
    },
    [board]
  );

  useEffect(() => {
    if (!isActive) return undefined;

    const handleKeyDown = (event) => {
      const direction = DIRECTIONS_BY_KEY[event.key];
      if (!direction) return;
      event.preventDefault();

      move(direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, move]);

  const restart = () => {
    setBoard(createBoard());
    setScore(0);
  };

  return (
    <div className="game-2048 game-stage">
      <div className="game-info">
        <span>Score {score}</span>
        <strong>Objectif 2048</strong>
        <button type="button" onClick={restart}>
          Rejouer
        </button>
      </div>

      <div className="grid-2048">
        {board.map((value, index) => (
          <div className={`tile t${value}`} key={index}>
            {value || ""}
          </div>
        ))}
      </div>
      <p className="game-help">Flèches directionnelles</p>
    </div>
  );
}
