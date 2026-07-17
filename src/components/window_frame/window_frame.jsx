import { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import MenuBar from "../menu_bar/menu_bar";
import usePersistentWindowLayout, {
  TOOLBAR_HEIGHT,
} from "../../hooks/usePersistentWindowLayout";
import { useLanguage } from "../../i18n/language";
import { EN_APP_LABELS, EN_APP_TITLES } from "../../i18n/content.en";
import "./window_frame.scss";

export default function WindowFrame({
  config,
  windowState,
  onFocus,
  onClose,
  onMinimize,
  onToggleFullscreen,
  children,
}) {
  const { layout, viewport, bounds, handleDragStop, handleResizeStop } =
    usePersistentWindowLayout(config);
  const contentRef = useRef(null);
  const { language } = useLanguage();
  const windowTitle =
    (language === "en" &&
      (EN_APP_TITLES[config.id] || EN_APP_LABELS[config.id])) ||
    config.title ||
    config.label;

  // À l'ouverture, le focus entre dans la fenêtre pour les utilisateurs
  // clavier — sauf si un champ interne (Terminal…) l'a déjà pris.
  useEffect(() => {
    const node = contentRef.current;
    if (node && !node.contains(document.activeElement)) node.focus();
  }, []);
  const isFullscreen = windowState.isFullscreen;
  const isResizable = config.resizable !== false && !isFullscreen;
  const position = isFullscreen
    ? { x: 0, y: TOOLBAR_HEIGHT }
    : layout.position;
  const size = isFullscreen
    ? { width: viewport.width, height: viewport.height - TOOLBAR_HEIGHT }
    : layout.size;
  const availableMaxSize = [
    Math.min(config.maxSize[0], Math.max(240, viewport.width - 24)),
    Math.min(
      config.maxSize[1],
      Math.max(180, viewport.height - TOOLBAR_HEIGHT - 104)
    ),
  ];
  const responsiveMinSize = [
    Math.min(config.minSize[0], availableMaxSize[0]),
    Math.min(config.minSize[1], availableMaxSize[1]),
  ];

  return (
    <Draggable
      handle=".window-handle"
      cancel=".window-controls"
      position={position}
      bounds={isFullscreen ? undefined : bounds}
      disabled={isFullscreen}
      onStop={handleDragStop}
    >
      <ResizableBox
        className={`App window-frame ${config.windowClassName || ""} ${
          windowState.isActive ? "window-active" : "window-inactive"
        }${isFullscreen ? " window-fullscreen" : ""}`}
        style={{ zIndex: windowState.zIndex }}
        width={size.width}
        height={size.height}
        minConstraints={responsiveMinSize}
        maxConstraints={availableMaxSize}
        axis={isResizable ? "both" : "none"}
        resizeHandles={isResizable ? ["se"] : []}
        onResizeStop={handleResizeStop}
        onMouseDownCapture={onFocus}
      >
        <div
          className="window-frame-content"
          role="dialog"
          aria-label={windowTitle}
          tabIndex={-1}
          ref={contentRef}
        >
          <MenuBar
            title={windowTitle}
            handleFullscreen={onToggleFullscreen}
            handleQuit={onClose}
            handleMinimize={onMinimize}
            onDoubleClick={onToggleFullscreen}
            isFullscreen={isFullscreen}
          />
          {children}
        </div>
      </ResizableBox>
    </Draggable>
  );
}
