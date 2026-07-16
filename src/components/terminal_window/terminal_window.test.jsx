import { act, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import TerminalWindow, {
  capTerminalLines,
  getCompletionContext,
  loadCommandHistory,
  MAX_HISTORY_ENTRIES,
  MAX_TERMINAL_LINES,
  TERMINAL_HISTORY_KEY,
  TERMINAL_THEME_KEY,
} from "./terminal_window";

const runCommand = (command) => {
  const input = screen.getByLabelText("Ligne de commande");
  fireEvent.change(input, { target: { value: command } });
  fireEvent.keyDown(input, { key: "Enter" });
  return input;
};

describe("TerminalWindow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("exposes multiple command and argument completion candidates", () => {
    expect(getCompletionContext("c").candidates).toEqual(["cd", "cat", "clear"]);
    expect(getCompletionContext("open ").candidates).toEqual([
      "github",
      "linkedin",
      "leonis",
      "projets",
      "cv",
    ]);
    expect(getCompletionContext("cat st").candidates).toEqual(["stack.txt"]);
  });

  test("caps retained output to the configured maximum", () => {
    const lines = Array.from({ length: MAX_TERMINAL_LINES + 25 }, (_, index) => ({
      id: index,
    }));

    expect(capTerminalLines(lines)).toHaveLength(MAX_TERMINAL_LINES);
    expect(capTerminalLines(lines)[0].id).toBe(25);
  });

  test("loads only valid persisted commands and enforces the history limit", () => {
    const stored = [
      ...Array.from({ length: MAX_HISTORY_ENTRIES + 20 }, (_, index) => `echo ${index}`),
      null,
    ];
    localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(stored));

    const history = loadCommandHistory();
    expect(history).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(history[0]).toBe("echo 0");
    expect(history.at(-1)).toBe("echo 99");
  });

  test("offers and persists Pro, Homebrew, Ocean and light themes", () => {
    const { container, unmount } = render(<TerminalWindow />);
    const terminal = container.querySelector(".terminal-app");

    expect(terminal).toHaveAttribute("data-theme", "pro");
    fireEvent.click(screen.getByRole("button", { name: "Ocean" }));
    expect(terminal).toHaveAttribute("data-theme", "ocean");
    expect(localStorage.getItem(TERMINAL_THEME_KEY)).toBe("ocean");

    unmount();
    const secondRender = render(<TerminalWindow />);
    expect(secondRender.container.querySelector(".terminal-app")).toHaveAttribute(
      "data-theme",
      "ocean"
    );
  });

  test("persists command history and restores keyboard navigation", () => {
    localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(["pwd", "help"]));
    render(<TerminalWindow />);
    const input = screen.getByLabelText("Ligne de commande");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("pwd");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(JSON.parse(localStorage.getItem(TERMINAL_HISTORY_KEY))[0]).toBe("pwd");
    expect(screen.getByText("/Users/visiteur/portfolio")).toBeInTheDocument();
  });

  test("supports cd, pwd, history and man", () => {
    render(<TerminalWindow />);

    runCommand("cd projets");
    expect(screen.getByText("visiteur@milo ~/projets %")).toBeInTheDocument();
    runCommand("pwd");
    expect(screen.getByText("/Users/visiteur/portfolio/projets")).toBeInTheDocument();
    runCommand("man open");
    expect(screen.getByText("OPEN(1)")).toBeInTheDocument();
    expect(screen.getByText(/ouvre github, linkedin, leonis, projets ou cv/i)).toBeInTheDocument();
    runCommand("history");
    expect(screen.getByText(/4\s+history/)).toBeInTheDocument();
  });

  test("opens the Projects application from the open command", () => {
    const openWindow = jest.fn();
    render(<TerminalWindow openWindow={openWindow} />);

    runCommand("open projets");

    expect(openWindow).toHaveBeenCalledWith("projects");
    expect(screen.getByText("Ouverture de l’application Projets…")).toBeInTheDocument();
  });

  test("downloads the real CV from open cv", () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    render(<TerminalWindow />);

    runCommand("open cv");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        (_, element) =>
          element.classList.contains("line") &&
          element.textContent === "Téléchargement de CV.pdf…"
      )
    ).toBeInTheDocument();
  });

  test("renders recognized URLs and files as actionable elements", () => {
    render(<TerminalWindow />);
    runCommand("ls");

    const cvFile = screen.getByRole("button", { name: "cv.txt" });
    expect(cvFile).toHaveClass("terminal-file");
    fireEvent.click(cvFile);
    expect(screen.getByText(/Bouygues/i)).toBeInTheDocument();

    runCommand("cat contact.txt");
    expect(screen.getByRole("link", { name: "github.com/MiloAnton" })).toHaveAttribute(
      "href",
      "https://github.com/MiloAnton"
    );
  });

  test("shows every Tab proposal and applies the selected completion", () => {
    render(<TerminalWindow />);
    const input = screen.getByLabelText("Ligne de commande");
    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.keyDown(input, { key: "Tab" });

    const suggestions = screen.getByLabelText("Propositions de complétion");
    expect(within(suggestions).getAllByRole("button")).toHaveLength(3);
    expect(within(suggestions).getByText("cd")).toBeInTheDocument();
    expect(within(suggestions).getByText("cat")).toBeInTheDocument();
    expect(within(suggestions).getByText("clear")).toBeInTheDocument();

    fireEvent.click(within(suggestions).getByRole("button", { name: "cat" }));
    expect(input).toHaveValue("cat ");
    expect(screen.queryByLabelText("Propositions de complétion")).not.toBeInTheDocument();
  });

  test("Ctrl+C cancels every pending progressive output timer", () => {
    jest.useFakeTimers();
    render(<TerminalWindow />);
    const input = runCommand("sudo rm -rf /");

    act(() => jest.advanceTimersByTime(400));
    expect(screen.getByText("Suppression de /System… ok")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "c", ctrlKey: true });
    act(() => jest.runAllTimers());

    expect(screen.getByText("^C")).toBeInTheDocument();
    expect(screen.queryByText("Suppression de /Users… ok")).not.toBeInTheDocument();
    expect(screen.queryByText(/Rassurez-vous/)).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
  });

  test("clears centralized timers when Terminal unmounts", () => {
    jest.useFakeTimers();
    const { unmount } = render(<TerminalWindow />);
    runCommand("sudo rm -rf /");

    expect(jest.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
