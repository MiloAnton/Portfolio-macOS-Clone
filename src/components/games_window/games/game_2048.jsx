import { useCallback, useEffect, useRef, useState } from "react";
import { loadBestScore, saveBestScore } from "./game_utils";

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE ** 2;
const SWIPE_THRESHOLD = 24;

export const MOVE_ANIMATION_MS = 150;
export const GAME_2048_BEST_SCORE_KEY = "portfolio-2048-best-score";

const DIRECTIONS_BY_KEY = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

const getDirectionLines = (direction) => {
  const lines = [];

  for (let line = 0; line < GRID_SIZE; line += 1) {
    const indexes = [];
    for (let position = 0; position < GRID_SIZE; position += 1) {
      const orderedPosition =
        direction === "right" || direction === "down"
          ? GRID_SIZE - 1 - position
          : position;

      indexes.push(
        direction === "left" || direction === "right"
          ? line * GRID_SIZE + orderedPosition
          : orderedPosition * GRID_SIZE + line
      );
    }
    lines.push(indexes);
  }

  return lines;
};

export const addRandomTile = (board, random = Math.random) => {
  const emptyIndexes = board
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index >= 0);

  if (emptyIndexes.length === 0) {
    return { board: [...board], index: null, value: null };
  }

  const index = emptyIndexes[Math.floor(random() * emptyIndexes.length)];
  const value = random() < 0.9 ? 2 : 4;
  const nextBoard = [...board];
  nextBoard[index] = value;

  return { board: nextBoard, index, value };
};

export const createBoard = (random = Math.random) => {
  const firstTile = addRandomTile(Array(CELL_COUNT).fill(0), random);
  return addRandomTile(firstTile.board, random).board;
};

export const moveBoard = (board, direction) => {
  const nextBoard = Array(CELL_COUNT).fill(0);
  const transitions = [];
  let gained = 0;

  getDirectionLines(direction).forEach((line) => {
    const occupiedCells = line
      .filter((sourceIndex) => board[sourceIndex] !== 0)
      .map((sourceIndex) => ({
        sourceIndex,
        value: board[sourceIndex],
      }));

    let destinationPosition = 0;
    for (let index = 0; index < occupiedCells.length; index += 1) {
      const currentCell = occupiedCells[index];
      const nextCell = occupiedCells[index + 1];
      const destinationIndex = line[destinationPosition];

      if (nextCell && currentCell.value === nextCell.value) {
        const mergedValue = currentCell.value * 2;
        nextBoard[destinationIndex] = mergedValue;
        gained += mergedValue;
        transitions.push(
          {
            sourceIndex: currentCell.sourceIndex,
            destinationIndex,
            merged: true,
          },
          {
            sourceIndex: nextCell.sourceIndex,
            destinationIndex,
            merged: true,
          }
        );
        index += 1;
      } else {
        nextBoard[destinationIndex] = currentCell.value;
        transitions.push({
          sourceIndex: currentCell.sourceIndex,
          destinationIndex,
          merged: false,
        });
      }

      destinationPosition += 1;
    }
  });

  const hasMoved = nextBoard.some((value, index) => value !== board[index]);
  return { board: nextBoard, gained, hasMoved, transitions };
};

export const hasAvailableMoves = (board) => {
  if (board.includes(0)) return true;

  return board.some((value, index) => {
    const column = index % GRID_SIZE;
    const row = Math.floor(index / GRID_SIZE);
    const matchesRight =
      column < GRID_SIZE - 1 && board[index + 1] === value;
    const matchesBelow =
      row < GRID_SIZE - 1 && board[index + GRID_SIZE] === value;
    return matchesRight || matchesBelow;
  });
};

export const getGameStatus = (board, victoryAcknowledged = false) => {
  if (!victoryAcknowledged && board.some((value) => value >= 2048)) {
    return "won";
  }
  return hasAvailableMoves(board) ? "playing" : "lost";
};

const boardToTiles = (board, createId, options = {}) =>
  board.flatMap((value, index) => {
    if (value === 0) return [];

    const sourceTransition = options.transitions?.filter(
      (transition) => transition.destinationIndex === index
    );
    const previousTile =
      sourceTransition?.length === 1
        ? options.previousTiles?.find(
            (tile) => tile.index === sourceTransition[0].sourceIndex
          )
        : null;

    return {
      id: previousTile?.id ?? createId(),
      index,
      value,
      isNew: index === options.newTileIndex,
      isMerged: Boolean(sourceTransition && sourceTransition.length > 1),
    };
  });

const getSwipeDirection = (start, end) => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD) {
    return null;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "right" : "left";
  }
  return deltaY > 0 ? "down" : "up";
};

export default function Game2048({ isActive }) {
  const initialBoardRef = useRef(null);
  if (initialBoardRef.current === null) initialBoardRef.current = createBoard();

  const nextTileIdRef = useRef(1);
  const animationTimerRef = useRef(null);
  const inputLockedRef = useRef(false);
  const swipeStartRef = useRef(null);
  const createTileId = useCallback(() => nextTileIdRef.current++, []);

  const [board, setBoard] = useState(initialBoardRef.current);
  const [tiles, setTiles] = useState(() =>
    boardToTiles(initialBoardRef.current, createTileId, {
      newTileIndex: -1,
    })
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    loadBestScore(GAME_2048_BEST_SCORE_KEY)
  );
  const [status, setStatus] = useState("playing");
  const [victoryAcknowledged, setVictoryAcknowledged] = useState(false);
  const [history, setHistory] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const updateBestScore = useCallback((nextScore) => {
    setBestScore((currentBestScore) => {
      if (nextScore <= currentBestScore) return currentBestScore;
      saveBestScore(GAME_2048_BEST_SCORE_KEY, nextScore);
      return nextScore;
    });
  }, []);

  const move = useCallback(
    (direction) => {
      if (!isActive || inputLockedRef.current || status !== "playing") return;

      const result = moveBoard(board, direction);
      if (!result.hasMoved) {
        if (!hasAvailableMoves(board)) setStatus("lost");
        return;
      }

      inputLockedRef.current = true;
      setIsAnimating(true);
      setHistory({ board, score, status, victoryAcknowledged });
      setTiles((currentTiles) =>
        currentTiles.map((tile) => {
          const transition = result.transitions.find(
            (item) => item.sourceIndex === tile.index
          );
          return transition
            ? {
                ...tile,
                index: transition.destinationIndex,
                isNew: false,
                isMerged: false,
              }
            : tile;
        })
      );

      animationTimerRef.current = window.setTimeout(() => {
        const spawnedTile = addRandomTile(result.board);
        const nextScore = score + result.gained;
        const nextTiles = boardToTiles(spawnedTile.board, createTileId, {
          transitions: result.transitions,
          previousTiles: tiles,
          newTileIndex: spawnedTile.index,
        });
        const nextStatus = getGameStatus(
          spawnedTile.board,
          victoryAcknowledged
        );

        setBoard(spawnedTile.board);
        setTiles(nextTiles);
        setScore(nextScore);
        updateBestScore(nextScore);
        setStatus(nextStatus);
        setIsAnimating(false);
        inputLockedRef.current = false;
        animationTimerRef.current = null;
      }, MOVE_ANIMATION_MS);
    }, [
      board,
      createTileId,
      isActive,
      score,
      status,
      tiles,
      updateBestScore,
      victoryAcknowledged,
    ]
  );

  const undo = useCallback(() => {
    if (!history || inputLockedRef.current) return;

    setBoard(history.board);
    setTiles(
      boardToTiles(history.board, createTileId, {
        newTileIndex: -1,
      })
    );
    setScore(history.score);
    setStatus(history.status);
    setVictoryAcknowledged(history.victoryAcknowledged);
    setHistory(null);
  }, [createTileId, history]);

  useEffect(() => {
    if (!isActive) return undefined;

    const handleKeyDown = (event) => {
      const direction = DIRECTIONS_BY_KEY[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, move, undo]);

  useEffect(
    () => () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    },
    []
  );

  const restart = () => {
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }

    const nextBoard = createBoard();
    setBoard(nextBoard);
    setTiles(boardToTiles(nextBoard, createTileId, { newTileIndex: -1 }));
    setScore(0);
    setStatus("playing");
    setVictoryAcknowledged(false);
    setHistory(null);
    setIsAnimating(false);
    inputLockedRef.current = false;
    animationTimerRef.current = null;
  };

  const continueAfterVictory = () => {
    setVictoryAcknowledged(true);
    setStatus(hasAvailableMoves(board) ? "playing" : "lost");
  };

  const handlePointerDown = (event) => {
    if (event.target.closest("button")) return;
    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;

    const direction = getSwipeDirection(start, {
      x: event.clientX,
      y: event.clientY,
    });
    if (direction) move(direction);
  };

  return (
    <div className="game-2048 game-stage">
      <div className="game-2048-toolbar">
        <div className="game-2048-scores">
          <span>
            Score <strong>{score}</strong>
          </span>
          <span>
            Record <strong>{bestScore}</strong>
          </span>
        </div>
        <strong className="game-2048-title">2048</strong>
        <div className="game-2048-actions">
          <button type="button" onClick={undo} disabled={!history || isAnimating}>
            Annuler
          </button>
          <button type="button" onClick={restart} disabled={isAnimating}>
            Rejouer
          </button>
        </div>
      </div>

      <div
        className={`grid-2048${isAnimating ? " is-animating" : ""}`}
        role="application"
        aria-label="Grille de jeu 2048"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
      >
        <div className="grid-2048-background" aria-hidden="true">
          {Array.from({ length: CELL_COUNT }, (_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className="grid-2048-tiles" aria-live="polite">
          {tiles.map((tile) => (
            <div
              className={`tile t${Math.min(tile.value, 2048)}${
                tile.isNew ? " tile-new" : ""
              }${tile.isMerged ? " tile-merged" : ""}`}
              style={{
                "--tile-x": `calc(${(tile.index % GRID_SIZE) * 100}% + ${
                  (tile.index % GRID_SIZE) * 9
                }px)`,
                "--tile-y": `calc(${Math.floor(tile.index / GRID_SIZE) * 100}% + ${
                  Math.floor(tile.index / GRID_SIZE) * 9
                }px)`,
              }}
              key={tile.id}
            >
              {tile.value}
            </div>
          ))}
        </div>

        {status !== "playing" && (
          <div className={`game-2048-overlay status-${status}`} role="status">
            <strong>{status === "won" ? "2048 atteint !" : "Partie terminée"}</strong>
            <p>
              {status === "won"
                ? "Bravo, tu as créé la tuile 2048."
                : "Aucun déplacement n’est possible."}
            </p>
            <div>
              {status === "won" && (
                <button type="button" onClick={continueAfterVictory}>
                  Continuer
                </button>
              )}
              {status === "lost" && history && (
                <button type="button" onClick={undo}>
                  Annuler le coup
                </button>
              )}
              <button type="button" onClick={restart}>
                Nouvelle partie
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="game-help">
        Flèches ou geste tactile · ⌘/Ctrl + Z pour annuler
      </p>
    </div>
  );
}
