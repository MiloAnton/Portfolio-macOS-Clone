import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WindowFrame from "./window_frame";

const config = {
  id: "test",
  label: "Test",
  title: "Fenêtre de test",
  defaultSize: [640, 480],
  minSize: [320, 240],
  maxSize: [1200, 900],
  windowClassName: "test-window",
};

const windowState = {
  zIndex: 4,
  isActive: true,
  isFullscreen: false,
};

describe("WindowFrame", () => {
  beforeEach(() => localStorage.clear());

  test("provides the common window controls and content", () => {
    const handlers = {
      onFocus: vi.fn(),
      onClose: vi.fn(),
      onMinimize: vi.fn(),
      onToggleFullscreen: vi.fn(),
    };
    const { container } = render(
      <WindowFrame config={config} windowState={windowState} {...handlers}>
        <p>Contenu métier</p>
      </WindowFrame>
    );

    expect(screen.getByText("Fenêtre de test")).toBeInTheDocument();
    expect(screen.getByText("Contenu métier")).toBeInTheDocument();
    expect(container.querySelector(".window-frame")).toHaveClass(
      "window-active",
      "test-window"
    );

    fireEvent.click(screen.getByRole("button", { name: "Fermer la fenêtre" }));
    fireEvent.click(screen.getByRole("button", { name: "Réduire la fenêtre" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Afficher la fenêtre en plein écran" })
    );
    fireEvent.doubleClick(container.querySelector(".menubar"));

    expect(handlers.onClose).toHaveBeenCalledTimes(1);
    expect(handlers.onMinimize).toHaveBeenCalledTimes(1);
    expect(handlers.onToggleFullscreen).toHaveBeenCalledTimes(2);
  });

  test("exposes the window as a dialog and focuses it on open", () => {
    render(
      <WindowFrame
        config={config}
        windowState={windowState}
        onFocus={vi.fn()}
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onToggleFullscreen={vi.fn()}
      >
        <p>Contenu</p>
      </WindowFrame>
    );

    const dialog = screen.getByRole("dialog", { name: "Fenêtre de test" });
    expect(dialog).toHaveFocus();
  });

  test("uses viewport dimensions in fullscreen mode", () => {
    const { container } = render(
      <WindowFrame
        config={config}
        windowState={{ ...windowState, isFullscreen: true }}
        onFocus={vi.fn()}
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onToggleFullscreen={vi.fn()}
      >
        <p>Contenu</p>
      </WindowFrame>
    );
    const frame = container.querySelector(".window-frame");

    expect(frame).toHaveClass("window-fullscreen");
    expect(frame).toHaveStyle({
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight - 28}px`,
    });
    expect(
      screen.getByRole("button", { name: "Quitter le plein écran" })
    ).toBeInTheDocument();
  });
});
