import { fireEvent, render, screen } from "@testing-library/react";
import GamesWindow from "./games_window";

const dispatchArrowUp = () => {
  const event = new KeyboardEvent("keydown", {
    key: "ArrowUp",
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event;
};

describe("GamesWindow keyboard isolation", () => {
  test("captures game keys only while Games is the foreground window", () => {
    const { rerender } = render(<GamesWindow isActive={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Pong/ }));

    expect(dispatchArrowUp().defaultPrevented).toBe(false);

    rerender(<GamesWindow isActive />);
    expect(dispatchArrowUp().defaultPrevented).toBe(true);

    rerender(<GamesWindow isActive={false} />);
    expect(dispatchArrowUp().defaultPrevented).toBe(false);
  });
});
