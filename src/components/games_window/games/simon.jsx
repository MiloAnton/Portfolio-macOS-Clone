import { useCallback, useEffect, useRef, useState } from "react";

export const SIMON_COLORS = ["green", "red", "yellow", "blue"];
export const SIMON_FREQUENCIES = [329.63, 261.63, 220, 164.81];

const createRandomColor = () =>
  Math.floor(Math.random() * SIMON_COLORS.length);

export const getSimonTimings = (sequenceLength) => ({
  leadIn: 340,
  stepDuration: Math.max(285, 520 - (sequenceLength - 1) * 22),
  flashDuration: Math.max(175, 310 - (sequenceLength - 1) * 10),
  userFlashDuration: 170,
  roundPause: 600,
  errorPause: 850,
});

export const createTimeoutManager = (
  setTimer = setTimeout,
  clearTimer = clearTimeout
) => {
  const timers = new Set();

  return {
    schedule(callback, delay) {
      const timer = setTimer(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    },
    clearAll() {
      timers.forEach((timer) => clearTimer(timer));
      timers.clear();
    },
    get size() {
      return timers.size;
    },
  };
};

export const createSimonAudioEngine = (AudioContextConstructor) => {
  let audioContext = null;

  const getAudioContext = () => {
    if (!AudioContextConstructor) return null;
    if (!audioContext) audioContext = new AudioContextConstructor();
    if (audioContext.state === "suspended") audioContext.resume?.();
    return audioContext;
  };

  return {
    unlock() {
      return Boolean(getAudioContext());
    },
    play(colorIndex, duration = 0.2) {
      const context = getAudioContext();
      if (!context) return false;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        SIMON_FREQUENCIES[colorIndex],
        startTime
      );
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
      return true;
    },
    destroy() {
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close?.();
      }
      audioContext = null;
    },
  };
};

const getStatus = (phase, strictMode) => {
  if (phase === "demo") return "Observe…";
  if (phase === "player") return "À toi";
  if (phase === "error") {
    return strictMode ? "Raté — retour au début" : "Raté — réessaie";
  }
  return "Prêt ?";
};

export default function Simon() {
  const timeoutManagerRef = useRef(null);
  if (timeoutManagerRef.current === null) {
    timeoutManagerRef.current = createTimeoutManager();
  }

  const audioEngineRef = useRef(null);
  if (audioEngineRef.current === null) {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    audioEngineRef.current = createSimonAudioEngine(AudioContextConstructor);
  }

  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [activeColor, setActiveColor] = useState(null);
  const [pressedColor, setPressedColor] = useState(null);
  const [userIndex, setUserIndex] = useState(0);
  const [strictMode, setStrictMode] = useState(false);

  const playSequence = useCallback((nextSequence) => {
    const timers = timeoutManagerRef.current;
    const timings = getSimonTimings(nextSequence.length);
    timers.clearAll();
    setPhase("demo");
    setUserIndex(0);
    setActiveColor(null);
    setPressedColor(null);

    nextSequence.forEach((color, index) => {
      const startAt = timings.leadIn + index * timings.stepDuration;
      timers.schedule(() => {
        setActiveColor(color);
        audioEngineRef.current.play(
          color,
          timings.flashDuration / 1000
        );
      }, startAt);
      timers.schedule(() => {
        setActiveColor((currentColor) =>
          currentColor === color ? null : currentColor
        );
      }, startAt + timings.flashDuration);
    });

    timers.schedule(() => {
      setActiveColor(null);
      setUserIndex(0);
      setPhase("player");
    }, timings.leadIn + nextSequence.length * timings.stepDuration);
  }, []);

  useEffect(
    () => () => {
      timeoutManagerRef.current.clearAll();
      audioEngineRef.current.destroy();
    },
    []
  );

  const start = () => {
    timeoutManagerRef.current.clearAll();
    audioEngineRef.current.unlock();
    const firstSequence = [createRandomColor()];
    setSequence(firstSequence);
    playSequence(firstSequence);
  };

  const toggleStrictMode = () => {
    timeoutManagerRef.current.clearAll();
    setStrictMode((currentMode) => !currentMode);
    setSequence([]);
    setPhase("idle");
    setActiveColor(null);
    setPressedColor(null);
    setUserIndex(0);
  };

  const showUserPress = (color) => {
    const timings = getSimonTimings(sequence.length);
    setActiveColor(color);
    setPressedColor(color);
    audioEngineRef.current.play(color, timings.userFlashDuration / 1000);
    timeoutManagerRef.current.schedule(() => {
      setActiveColor((currentColor) =>
        currentColor === color ? null : currentColor
      );
      setPressedColor((currentColor) =>
        currentColor === color ? null : currentColor
      );
    }, timings.userFlashDuration);
  };

  const press = (color) => {
    if (phase !== "player") return;
    showUserPress(color);

    if (sequence[userIndex] !== color) {
      setPhase("error");
      const sequenceToReplay = strictMode
        ? [createRandomColor()]
        : sequence;
      if (strictMode) setSequence(sequenceToReplay);

      timeoutManagerRef.current.schedule(() => {
        playSequence(sequenceToReplay);
      }, getSimonTimings(sequence.length).errorPause);
      return;
    }

    const completedSequence = userIndex === sequence.length - 1;
    if (!completedSequence) {
      setUserIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setPhase("demo");
    const nextSequence = [...sequence, createRandomColor()];
    setSequence(nextSequence);
    timeoutManagerRef.current.schedule(() => {
      playSequence(nextSequence);
    }, getSimonTimings(sequence.length).roundPause);
  };

  const buttonsLocked = phase !== "player";
  const speed = getSimonTimings(Math.max(1, sequence.length));

  return (
    <div className="simon game-stage">
      <div className="simon-toolbar">
        <span>
          Score <strong>{Math.max(0, sequence.length - 1)}</strong>
        </span>
        <strong>{getStatus(phase, strictMode)}</strong>
        <div>
          <button
            type="button"
            className={strictMode ? "selected" : ""}
            aria-pressed={strictMode}
            onClick={toggleStrictMode}
          >
            Strict
          </button>
          <button type="button" onClick={start}>
            {phase === "idle" ? "Jouer" : "Rejouer"}
          </button>
        </div>
      </div>

      <div
        className={`simon-board${phase === "demo" ? " is-demonstrating" : ""}`}
        aria-label="Plateau Simon"
      >
        {SIMON_COLORS.map((color, index) => (
          <button
            type="button"
            aria-label={color}
            className={`${color}${activeColor === index ? " active" : ""}${
              pressedColor === index ? " user-pressed" : ""
            }`}
            disabled={buttonsLocked}
            onClick={() => press(index)}
            key={color}
          />
        ))}
        <div className="simon-center" aria-hidden="true">
          <strong>SIMON</strong>
          <span>{sequence.length || "–"}</span>
        </div>
      </div>
      <p className="game-help">
        Reproduis les sons et les couleurs · rythme {speed.stepDuration} ms
      </p>
    </div>
  );
}
