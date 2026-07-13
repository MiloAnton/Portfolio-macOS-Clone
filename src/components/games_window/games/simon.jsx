import { useEffect, useState } from "react";

const COLORS = ["green", "red", "yellow", "blue"];

const getStatus = (turn, lost) => {
  if (lost) return "Raté !";
  if (turn === "computer") return "Observe…";
  if (turn === "user") return "À toi";
  return "Mémorise la suite";
};

const createRandomColor = () => Math.floor(Math.random() * COLORS.length);

export default function Simon() {
  const [sequence, setSequence] = useState([]);
  const [turn, setTurn] = useState("idle");
  const [activeColor, setActiveColor] = useState(null);
  const [userIndex, setUserIndex] = useState(0);
  const [lost, setLost] = useState(false);

  const start = () => {
    setLost(false);
    setUserIndex(0);
    setSequence([createRandomColor()]);
    setTurn("computer");
  };

  useEffect(() => {
    if (turn !== "computer" || sequence.length === 0) return undefined;

    const timers = [];
    sequence.forEach((color, index) => {
      timers.push(
        setTimeout(() => setActiveColor(color), 500 + index * 650)
      );
      timers.push(
        setTimeout(() => setActiveColor(null), 900 + index * 650)
      );
    });
    timers.push(
      setTimeout(() => {
        setTurn("user");
        setUserIndex(0);
      }, 500 + sequence.length * 650)
    );

    return () => timers.forEach(clearTimeout);
  }, [sequence, turn]);

  const press = (color) => {
    if (turn !== "user") return;

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 180);

    if (sequence[userIndex] !== color) {
      setLost(true);
      setTurn("idle");
      return;
    }

    const completedSequence = userIndex === sequence.length - 1;
    if (completedSequence) {
      setTurn("computer");
      setSequence((currentSequence) => [
        ...currentSequence,
        createRandomColor(),
      ]);
    } else {
      setUserIndex((currentIndex) => currentIndex + 1);
    }
  };

  return (
    <div className="simon game-stage">
      <div className="game-info">
        <span>Score {Math.max(0, sequence.length - 1)}</span>
        <strong>{getStatus(turn, lost)}</strong>
        <button type="button" onClick={start}>
          Rejouer
        </button>
      </div>

      <div className="simon-board">
        {COLORS.map((color, index) => (
          <button
            type="button"
            aria-label={color}
            className={`${color} ${activeColor === index ? "active" : ""}`}
            onClick={() => press(index)}
            key={color}
          />
        ))}
      </div>
      <p className="game-help">Reproduis la séquence de couleurs</p>
    </div>
  );
}
