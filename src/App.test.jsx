import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

vi.mock("./components/intro_animation/WelcomeAnimation", () => ({
  default: () => null,
}));
vi.mock("./components/toolbar/toolbar", () => ({
  default: ({ focusedWindow }) => (
    <div data-testid="focused-window">{focusedWindow?.id || "none"}</div>
  ),
}));
vi.mock("./components/window_frame/window_frame", () => ({
  default: ({ config, windowState, onFocus }) => (
    <section
      data-testid={`window-${config.id}`}
      data-active={windowState.isActive ? "true" : "false"}
      onMouseDown={onFocus}
    >
      {config.label}
    </section>
  ),
}));
vi.mock("./utils/portfolioLogger", () => ({ addPortfolioLog: vi.fn() }));

describe("App window entry points", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1440,
    });
    localStorage.clear();
  });

  test("opens a closed application from the Dock", () => {
    render(<App />);

    expect(screen.queryByTestId("window-projects")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Projets"));

    expect(screen.getByTestId("window-projects")).toBeInTheDocument();
    expect(screen.getByTestId("window-projects")).toHaveAttribute(
      "data-active",
      "true"
    );
  });

  test("opens Projects by double-clicking its desktop folder", () => {
    render(<App />);

    fireEvent.doubleClick(
      screen.getByTitle("Double-cliquez pour ouvrir Projets")
    );

    expect(screen.getByTestId("window-projects")).toBeInTheDocument();
  });

  test("opens the default windows when the viewport becomes desktop-sized", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 800,
    });
    render(<App />);
    expect(screen.queryByTestId("window-main")).not.toBeInTheDocument();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1440,
    });
    fireEvent(window, new Event("resize"));

    expect(screen.getByTestId("window-main")).toBeInTheDocument();
    expect(screen.getByTestId("window-terminal")).toBeInTheDocument();
  });

  test("moves a clicked window to the foreground", () => {
    render(<App />);

    expect(screen.getByTestId("window-terminal")).toHaveAttribute(
      "data-active",
      "true"
    );
    fireEvent.mouseDown(screen.getByTestId("window-main"));

    expect(screen.getByTestId("window-main")).toHaveAttribute(
      "data-active",
      "true"
    );
    expect(screen.getByTestId("focused-window")).toHaveTextContent("main");
  });
});
