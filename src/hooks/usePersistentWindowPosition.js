import { useState } from "react";

const STORAGE_PREFIX = "portfolio-window-position:";
const EDGE_GAP = 12;

const getMargins = () => {
  if (window.innerWidth <= 500) return { x: 15, y: 15 };
  if (window.innerWidth <= 900) return { x: 50, y: 50 };
  return { x: 200, y: 40 };
};

const randomBetween = (min, max) => {
  if (max <= min) return min;
  return Math.round(min + Math.random() * (max - min));
};

const createRandomPosition = (width, height, centered) => {
  if (typeof window === "undefined") return { x: 0, y: 0 };

  if (centered) {
    return {
      x: randomBetween(
        -window.innerWidth / 2 + EDGE_GAP,
        window.innerWidth / 2 - width - EDGE_GAP
      ),
      y: randomBetween(
        -window.innerHeight / 2 + 32,
        window.innerHeight / 2 - height - EDGE_GAP
      ),
    };
  }

  const margin = getMargins();
  return {
    x: randomBetween(
      -margin.x + EDGE_GAP,
      window.innerWidth - margin.x - width - EDGE_GAP
    ),
    y: randomBetween(
      0,
      window.innerHeight - margin.y - height - EDGE_GAP
    ),
  };
};

const isValidPosition = (value) =>
  value && Number.isFinite(value.x) && Number.isFinite(value.y);

export default function usePersistentWindowPosition(
  windowId,
  width,
  height,
  { centered = false } = {}
) {
  const storageKey = `${STORAGE_PREFIX}${windowId}`;
  const [position, setPosition] = useState(() => {
    try {
      const savedPosition = JSON.parse(localStorage.getItem(storageKey));
      if (isValidPosition(savedPosition)) return savedPosition;
    } catch (error) {
      // Le stockage peut être désactivé ou contenir une ancienne valeur invalide.
    }

    const randomPosition = createRandomPosition(width, height, centered);
    try {
      localStorage.setItem(storageKey, JSON.stringify(randomPosition));
    } catch (error) {
      // La position reste valable pour la session courante.
    }
    return randomPosition;
  });

  const handleDragStop = (_event, data) => {
    const nextPosition = { x: data.x, y: data.y };
    setPosition(nextPosition);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextPosition));
    } catch (error) {
      // La fenêtre reste déplaçable même si localStorage est indisponible.
    }
  };

  return { position, handleDragStop };
}
