import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Simon, {
  createSimonAudioEngine,
  createTimeoutManager,
  getSimonTimings,
  SIMON_FREQUENCIES,
} from "./simon";

describe("Simon", () => {
  let randomSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  test("accelerates demonstrations progressively while keeping a readable floor", () => {
    expect(getSimonTimings(5).stepDuration).toBeLessThan(
      getSimonTimings(1).stepDuration
    );
    expect(getSimonTimings(100).stepDuration).toBe(285);
    expect(getSimonTimings(100).flashDuration).toBe(175);
  });

  test("centralizes timeouts and cancels every pending callback", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const manager = createTimeoutManager();
    manager.schedule(firstCallback, 100);
    manager.schedule(secondCallback, 200);

    manager.clearAll();
    act(() => vi.advanceTimersByTime(300));

    expect(vi.getTimerCount()).toBe(0);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).not.toHaveBeenCalled();
  });

  test("plays a distinct Web Audio frequency for every color", () => {
    const oscillators = [];
    const close = vi.fn();

    class MockAudioContext {
      constructor() {
        this.currentTime = 2;
        this.destination = {};
        this.state = "running";
      }

      createOscillator() {
        const oscillator = {
          connect: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          start: vi.fn(),
          stop: vi.fn(),
        };
        oscillators.push(oscillator);
        return oscillator;
      }

      createGain() {
        return {
          connect: vi.fn(),
          gain: {
            exponentialRampToValueAtTime: vi.fn(),
            setValueAtTime: vi.fn(),
          },
        };
      }

      close() {
        close();
      }
    }

    const audio = createSimonAudioEngine(MockAudioContext);
    audio.play(0);
    audio.play(1);

    expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(
      SIMON_FREQUENCIES[0],
      2
    );
    expect(oscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(
      SIMON_FREQUENCIES[1],
      2
    );
    expect(SIMON_FREQUENCIES[0]).not.toBe(SIMON_FREQUENCIES[1]);
    audio.destroy();
    expect(close).toHaveBeenCalledTimes(1);
  });

  test("fully locks the color buttons during a demonstration", () => {
    render(<Simon />);
    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));

    const greenButton = screen.getByRole("button", { name: "green" });
    const redButton = screen.getByRole("button", { name: "red" });
    expect(greenButton).toBeDisabled();
    expect(redButton).toBeDisabled();
    expect(screen.getByText("Observe…")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(900));
    expect(greenButton).toBeEnabled();
    expect(redButton).toBeEnabled();
    expect(screen.getByText("À toi")).toBeInTheDocument();
  });

  test("strict mode resets to the first round after an error", () => {
    render(<Simon />);
    fireEvent.click(screen.getByRole("button", { name: "Strict" }));
    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));
    act(() => vi.advanceTimersByTime(900));

    fireEvent.click(screen.getByRole("button", { name: "green" }));
    expect(screen.getByText(/Score/).parentElement).toHaveTextContent("1");

    act(() => vi.advanceTimersByTime(600));
    act(() => vi.advanceTimersByTime(1400));
    fireEvent.click(screen.getByRole("button", { name: "red" }));

    expect(screen.getByText("Raté — retour au début")).toBeInTheDocument();
    expect(screen.getByText(/Score/).parentElement).toHaveTextContent("0");
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Observe…")).toBeInTheDocument();
  });

  test("cleans every pending sequence timer when the game is closed", () => {
    const { unmount } = render(<Simon />);
    fireEvent.click(screen.getByRole("button", { name: "Jouer" }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
