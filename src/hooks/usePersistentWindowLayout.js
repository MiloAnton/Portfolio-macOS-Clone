import { useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "portfolio-window-layout:v2:";
const LEGACY_STORAGE_PREFIX = "portfolio-window-position:";
const EDGE_GAP = 12;
export const TOOLBAR_HEIGHT = 28;
const NORMAL_TOP_GAP = TOOLBAR_HEIGHT + EDGE_GAP;
const DOCK_RESERVED_HEIGHT = 92;

export const getViewportSize = () => ({
  width: typeof window === "undefined" ? 1440 : window.innerWidth,
  height: typeof window === "undefined" ? 900 : window.innerHeight,
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getAvailableSize = (viewport) => ({
  width: Math.max(240, viewport.width - EDGE_GAP * 2),
  height: Math.max(180, viewport.height - NORMAL_TOP_GAP - DOCK_RESERVED_HEIGHT),
});

export const clampWindowLayout = (layout, viewport) => {
  const available = getAvailableSize(viewport);
  const width = Math.min(layout.size.width, available.width);
  const height = Math.min(layout.size.height, available.height);
  const maxX = Math.max(EDGE_GAP, viewport.width - width - EDGE_GAP);
  const maxY = Math.max(
    NORMAL_TOP_GAP,
    viewport.height - height - DOCK_RESERVED_HEIGHT
  );

  return {
    position: {
      x: clamp(layout.position.x, EDGE_GAP, maxX),
      y: clamp(layout.position.y, NORMAL_TOP_GAP, maxY),
    },
    size: { width, height },
  };
};

const randomBetween = (min, max) =>
  max <= min ? min : Math.round(min + Math.random() * (max - min));

const createRandomLayout = (defaultSize, viewport) => {
  const available = getAvailableSize(viewport);
  const size = {
    width: Math.min(defaultSize[0], available.width),
    height: Math.min(defaultSize[1], available.height),
  };

  return {
    size,
    position: {
      x: randomBetween(EDGE_GAP, Math.max(EDGE_GAP, viewport.width - size.width - EDGE_GAP)),
      y: randomBetween(
        NORMAL_TOP_GAP,
        Math.max(NORMAL_TOP_GAP, viewport.height - size.height - DOCK_RESERVED_HEIGHT)
      ),
    },
  };
};

const isValidLayout = (layout) =>
  layout &&
  Number.isFinite(layout.position?.x) &&
  Number.isFinite(layout.position?.y) &&
  Number.isFinite(layout.size?.width) &&
  Number.isFinite(layout.size?.height);

const getLegacyMargins = (viewport) => {
  if (viewport.width <= 500) return { x: 15, y: 15 };
  if (viewport.width <= 900) return { x: 50, y: 50 };
  return { x: 200, y: 40 };
};

const loadInitialLayout = (config, viewport) => {
  const storageKey = `${STORAGE_PREFIX}${config.id}`;
  try {
    const savedLayout = JSON.parse(localStorage.getItem(storageKey));
    if (isValidLayout(savedLayout)) return clampWindowLayout(savedLayout, viewport);
  } catch (error) {
    // Le stockage peut être désactivé ou contenir une ancienne valeur invalide.
  }

  const legacySuffix = config.legacyPositionStorageSuffix
    ? `:${config.legacyPositionStorageSuffix}`
    : "";
  try {
    const legacyPosition = JSON.parse(
      localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${config.id}${legacySuffix}`)
    );
    if (
      Number.isFinite(legacyPosition?.x) &&
      Number.isFinite(legacyPosition?.y)
    ) {
      const margins = getLegacyMargins(viewport);
      return clampWindowLayout(
        {
          position: {
            x: legacyPosition.x + margins.x,
            y: legacyPosition.y + margins.y,
          },
          size: { width: config.defaultSize[0], height: config.defaultSize[1] },
        },
        viewport
      );
    }
  } catch (error) {
    // Une ancienne position invalide est simplement ignorée.
  }

  const randomLayout = createRandomLayout(config.defaultSize, viewport);
  if (!config.initialPosition) return randomLayout;
  const position = config.initialPosition({
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    width: randomLayout.size.width,
    height: randomLayout.size.height,
  });
  return clampWindowLayout({ ...randomLayout, position }, viewport);
};

const saveLayout = (id, layout) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(layout));
  } catch (error) {
    // La fenêtre reste utilisable lorsque localStorage est indisponible.
  }
};

export default function usePersistentWindowLayout(config) {
  const [viewport, setViewport] = useState(getViewportSize);
  const [layout, setLayout] = useState(() => loadInitialLayout(config, viewport));
  const preferredLayoutRef = useRef(layout);

  useEffect(() => {
    let frame;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewport(getViewportSize()));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setLayout(clampWindowLayout(preferredLayoutRef.current, viewport));
  }, [viewport]);

  useEffect(() => {
    saveLayout(config.id, preferredLayoutRef.current);
  }, [config.id]);

  const updateLayout = (nextLayout) => {
    const clampedLayout = clampWindowLayout(nextLayout, viewport);
    preferredLayoutRef.current = clampedLayout;
    setLayout(clampedLayout);
    saveLayout(config.id, clampedLayout);
  };

  const handleDragStop = (_event, data) => {
    updateLayout({
      ...layout,
      position: { x: data.x, y: data.y },
    });
  };

  const handleResizeStop = (_event, data) => {
    updateLayout({
      ...layout,
      size: { width: data.size.width, height: data.size.height },
    });
  };

  const bounds = {
    left: EDGE_GAP,
    top: NORMAL_TOP_GAP,
    right: Math.max(EDGE_GAP, viewport.width - layout.size.width - EDGE_GAP),
    bottom: Math.max(
      NORMAL_TOP_GAP,
      viewport.height - layout.size.height - DOCK_RESERVED_HEIGHT
    ),
  };

  return { layout, viewport, bounds, handleDragStop, handleResizeStop };
}
