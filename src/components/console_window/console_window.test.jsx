import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConsoleWindow from "./console_window";
import {
  addPortfolioLog,
  clearPortfolioLogs,
  getPortfolioLogs,
  MAX_PORTFOLIO_LOGS,
} from "../../utils/portfolioLogger";

describe("ConsoleWindow", () => {
  let originalClipboard;
  let originalScrollIntoView;

  beforeEach(() => {
    clearPortfolioLogs();
    originalClipboard = navigator.clipboard;
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    jest.restoreAllMocks();
  });

  test("shows icons and live counters for every log level", () => {
    addPortfolioLog("info", "window", "Safari ouverte");
    addPortfolioLog("info", "focus", "Safari");
    addPortfolioLog("success", "system", "Session prête");
    addPortfolioLog("warning", "network", "Connexion lente");
    addPortfolioLog("error", "iframe", "Chargement refusé");
    render(<ConsoleWindow />);

    expect(
      screen.getByRole("button", { name: "Afficher Tous (5)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher Infos (2)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher Succès (1)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher Alertes (1)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher Erreurs (1)" })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Afficher Erreurs (1)" })
    );
    expect(screen.getAllByTestId("console-entry")).toHaveLength(1);
    expect(screen.getByText("Chargement refusé")).toBeInTheDocument();
  });

  test("keeps one stable subscription and reports queued events while paused", () => {
    const addEventListener = jest.spyOn(window, "addEventListener");
    render(<ConsoleWindow />);
    expect(
      addEventListener.mock.calls.filter(
        ([eventName]) => eventName === "portfolio:log"
      )
    ).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Mettre les logs en pause" })
    );
    act(() => {
      for (let index = 0; index < 12; index += 1) {
        addPortfolioLog("info", "test", `Événement ${index + 1}`);
      }
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "En pause — 12 événements en attente"
    );
    expect(screen.queryAllByTestId("console-entry")).toHaveLength(0);
    expect(
      addEventListener.mock.calls.filter(
        ([eventName]) => eventName === "portfolio:log"
      )
    ).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Reprendre les logs" })
    );
    expect(screen.getAllByTestId("console-entry")).toHaveLength(12);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("caps both logger history and the live Console collection", () => {
    for (let index = 0; index < MAX_PORTFOLIO_LOGS + 20; index += 1) {
      addPortfolioLog("info", "capacity", `Initial ${index}`);
    }
    expect(getPortfolioLogs()).toHaveLength(MAX_PORTFOLIO_LOGS);

    render(<ConsoleWindow />);
    act(() => {
      for (let index = 0; index < 30; index += 1) {
        addPortfolioLog("success", "capacity", `Live ${index}`);
      }
    });
    expect(screen.getAllByTestId("console-entry")).toHaveLength(
      MAX_PORTFOLIO_LOGS
    );
    expect(screen.queryByText("Initial 20")).not.toBeInTheDocument();
    expect(screen.getByText("Live 29")).toBeInTheDocument();
  });

  test("copies visible logs and exposes JSON and text downloads", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    addPortfolioLog("warning", "network", "Latence détectée");
    render(<ConsoleWindow />);

    fireEvent.click(screen.getByRole("button", { name: "Copier" }));
    expect(await screen.findByText("1 log copié")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("[WARNING] network — Latence détectée")
    );

    const jsonExport = screen.getByRole("link", { name: "Exporter en JSON" });
    expect(jsonExport).toHaveAttribute(
      "download",
      expect.stringMatching(/portfolio-logs-.*\.json/)
    );
    expect(jsonExport.getAttribute("href")).toMatch(
      /^data:application\/json;charset=utf-8,/
    );

    const textExport = screen.getByRole("link", {
      name: "Télécharger les logs",
    });
    expect(textExport).toHaveAttribute(
      "download",
      expect.stringMatching(/portfolio-logs-.*\.log/)
    );
    expect(textExport.getAttribute("href")).toMatch(
      /^data:text\/plain;charset=utf-8,/
    );
  });

  test("autocompletes observer commands and navigates command history", () => {
    addPortfolioLog("error", "iframe", "Refus");
    render(<ConsoleWindow />);
    const commandInput = screen.getByRole("combobox", {
      name: "Commande d’observation Console",
    });

    fireEvent.change(commandInput, { target: { value: "fi" } });
    fireEvent.keyDown(commandInput, { key: "Tab" });
    expect(commandInput).toHaveValue("filter ");

    fireEvent.change(commandInput, { target: { value: "filter error" } });
    fireEvent.submit(commandInput.closest("form"));
    expect(
      screen.getByRole("button", { name: "Afficher Erreurs (1)" })
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(commandInput, { key: "ArrowUp" });
    expect(commandInput).toHaveValue("filter error");
    fireEvent.keyDown(commandInput, { key: "ArrowDown" });
    expect(commandInput).toHaveValue("");
  });

  test("focuses search and observer commands through foreground shortcuts", () => {
    const { rerender } = render(<ConsoleWindow isActive isVisible />);
    const commandInput = screen.getByRole("combobox", {
      name: "Commande d’observation Console",
    });
    const searchInput = screen.getByRole("textbox", {
      name: "Filtrer les logs",
    });

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(commandInput).toHaveFocus();
    fireEvent.keyDown(document, { key: "f", ctrlKey: true });
    expect(searchInput).toHaveFocus();

    rerender(<ConsoleWindow isActive={false} isVisible />);
    searchInput.blur();
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(commandInput).not.toHaveFocus();
  });

  test("resizes every column with accessible keyboard separators", () => {
    render(<ConsoleWindow />);
    const separators = ["Heure", "Niveau", "Source", "Message"].map(
      (column) =>
        screen.getByRole("separator", {
          name: `Redimensionner ${column}`,
        })
    );
    expect(separators).toHaveLength(4);
    expect(separators[0]).toHaveAttribute("aria-valuenow", "84");

    fireEvent.keyDown(separators[0], { key: "ArrowRight" });
    expect(
      screen.getByRole("separator", { name: "Redimensionner Heure" })
    ).toHaveAttribute("aria-valuenow", "92");
  });

  test("navigates log rows with arrow, Home and End keys", () => {
    addPortfolioLog("info", "window", "Premier");
    addPortfolioLog("success", "system", "Deuxième");
    addPortfolioLog("warning", "network", "Troisième");
    render(<ConsoleWindow />);
    const rows = screen.getAllByTestId("console-entry");

    act(() => rows[0].focus());
    fireEvent.keyDown(rows[0], { key: "ArrowDown" });
    expect(rows[1]).toHaveFocus();
    fireEvent.keyDown(rows[1], { key: "End" });
    expect(rows[2]).toHaveFocus();
    fireEvent.keyDown(rows[2], { key: "Home" });
    expect(rows[0]).toHaveFocus();
  });

  test("keeps observation commands distinct from Terminal execution", () => {
    render(<ConsoleWindow openWindowCount={4} />);
    expect(screen.getByText("observer ›")).toBeInTheDocument();
    const commandInput = screen.getByRole("combobox", {
      name: "Commande d’observation Console",
    });
    fireEvent.change(commandInput, { target: { value: "help" } });
    fireEvent.submit(commandInput.closest("form"));

    expect(
      screen.getByText(/Observation : help, clear, status/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/echo/)).not.toBeInTheDocument();
  });
});
