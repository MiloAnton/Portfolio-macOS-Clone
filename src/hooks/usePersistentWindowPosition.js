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

// Bornes de translation Draggable pour que la fenêtre reste dans le viewport.
// Les coordonnées sont relatives à la position de base de .App (ses marges CSS),
// d'où les bornes négatives côté min.
const getViewportBounds = (width, height, centered) => {
  if (centered) {
    return {
      minX: -window.innerWidth / 2 + EDGE_GAP,
      maxX: window.innerWidth / 2 - width - EDGE_GAP,
      minY: -window.innerHeight / 2 + 32,
      maxY: window.innerHeight / 2 - height - EDGE_GAP,
    };
  }

  const margin = getMargins();
  return {
    minX: -margin.x + EDGE_GAP,
    maxX: window.innerWidth - margin.x - width - EDGE_GAP,
    minY: 0,
    maxY: window.innerHeight - margin.y - height - EDGE_GAP,
  };
};

const createRandomPosition = (width, height, centered) => {
  if (typeof window === "undefined") return { x: 0, y: 0 };

  const bounds = getViewportBounds(width, height, centered);
  return {
    x: randomBetween(bounds.minX, bounds.maxX),
    y: randomBetween(bounds.minY, bounds.maxY),
  };
};

// Ramène une position (ex : sauvegardée sur un écran plus grand) dans le
// viewport actuel. Si l'écran est plus petit que la fenêtre, on aligne sur le
// bord haut/gauche pour garder la barre de titre accessible.
const clampToViewport = (position, width, height, centered) => {
  if (typeof window === "undefined") return position;

  const bounds = getViewportBounds(width, height, centered);
  return {
    x: Math.min(Math.max(position.x, bounds.minX), Math.max(bounds.minX, bounds.maxX)),
    y: Math.min(Math.max(position.y, bounds.minY), Math.max(bounds.minY, bounds.maxY)),
  };
};

const isValidPosition = (value) =>
  value && Number.isFinite(value.x) && Number.isFinite(value.y);

export default function usePersistentWindowPosition(
  windowId,
  width,
  height,
  { centered = false, initialPosition = null, storageKeySuffix = "" } = {}
) {
  const storageKey = `${STORAGE_PREFIX}${windowId}${
    storageKeySuffix ? `:${storageKeySuffix}` : ""
  }`;
  const [position, setPosition] = useState(() => {
    try {
      const savedPosition = JSON.parse(localStorage.getItem(storageKey));
      // On ne réécrit pas la valeur clampée en storage : de retour sur le
      // grand écran, la fenêtre retrouve sa position d'origine.
      if (isValidPosition(savedPosition)) {
        return clampToViewport(savedPosition, width, height, centered);
      }
    } catch (error) {
      // Le stockage peut être désactivé ou contenir une ancienne valeur invalide.
    }

    const randomPosition = isValidPosition(initialPosition)
      ? clampToViewport(initialPosition, width, height, centered)
      : createRandomPosition(width, height, centered);
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
