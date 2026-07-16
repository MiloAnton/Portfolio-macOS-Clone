export const getDeltaSeconds = (currentTime, previousTime) => {
  if (previousTime === null) return 1 / 60;
  return Math.min(Math.max((currentTime - previousTime) / 1000, 0), 0.05);
};

export const loadBestScore = (storageKey) => {
  try {
    const savedScore = Number(localStorage.getItem(storageKey));
    return Number.isFinite(savedScore) && savedScore > 0 ? savedScore : 0;
  } catch (error) {
    return 0;
  }
};

export const saveBestScore = (storageKey, score) => {
  try {
    localStorage.setItem(storageKey, String(score));
  } catch (error) {
    // Le record reste limité à la session si le stockage est indisponible.
  }
};

export const createPressHandlers = (onPress, onRelease) => ({
  onPointerDown: (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onPress();
  },
  onPointerUp: onRelease,
  onPointerCancel: onRelease,
  onPointerLeave: onRelease,
});
