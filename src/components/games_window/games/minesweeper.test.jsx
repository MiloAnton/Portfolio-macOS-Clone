import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Minesweeper from "./minesweeper";

describe("Minesweeper scoreboard", () => {
  let randomSpy;
  let randomIndex;

  beforeEach(() => {
    jest.useFakeTimers();
    randomIndex = 0;
    randomSpy = jest.spyOn(Math, "random").mockImplementation(() => {
      const value = (randomIndex % 81) / 81;
      randomIndex += 1;
      return value;
    });
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  test("shows digital mine and time counters and resets the timer", () => {
    const { container } = render(<Minesweeper />);

    expect(screen.getByLabelText("10 mines restantes")).toHaveTextContent(
      "010"
    );
    expect(screen.getByRole("timer")).toHaveTextContent("000");

    const safeCell = container.querySelectorAll(".mine-grid button")[10];
    fireEvent.click(safeCell);
    act(() => jest.advanceTimersByTime(3000));

    expect(screen.getByRole("timer")).toHaveTextContent("003");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Partie en cours. Nouvelle partie",
      })
    );
    expect(screen.getByRole("timer")).toHaveTextContent("000");

    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByRole("timer")).toHaveTextContent("000");
  });

  test("changes the status button when a mine explodes", () => {
    const { container } = render(<Minesweeper />);
    const minedCell = container.querySelectorAll(".mine-grid button")[0];

    fireEvent.click(minedCell);

    expect(
      screen.getByRole("button", {
        name: "Partie perdue. Nouvelle partie",
      })
    ).toHaveClass("status-lost");
  });

  test("never allows more flags than the number of mines", () => {
    const { container } = render(<Minesweeper />);
    const cells = container.querySelectorAll(".mine-grid button");

    for (let index = 0; index < 10; index += 1) {
      fireEvent.contextMenu(cells[index]);
    }
    expect(screen.getByLabelText("0 mines restantes")).toBeInTheDocument();
    expect(screen.getAllByText("🚩")).toHaveLength(10);

    fireEvent.contextMenu(cells[10]);
    expect(screen.getByLabelText("0 mines restantes")).toBeInTheDocument();
    expect(screen.getAllByText("🚩")).toHaveLength(10);

    fireEvent.contextMenu(cells[0]);
    fireEvent.contextMenu(cells[10]);
    expect(screen.getByLabelText("0 mines restantes")).toBeInTheDocument();
    expect(screen.getAllByText("🚩")).toHaveLength(10);
  });
});
