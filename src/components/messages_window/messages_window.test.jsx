import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MessagesWindow, {
  createMessageId,
  MESSAGES_STORAGE_KEY,
} from "./messages_window";

describe("Messages", () => {
  let originalScrollIntoView;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    vi.useRealTimers();
  });

  test("creates unique identifiers without relying only on the current time", () => {
    const identifiers = Array.from({ length: 30 }, createMessageId);
    expect(new Set(identifiers)).toHaveProperty("size", 30);
  });

  test("loads a persisted conversation with its time and read status", () => {
    const sentAt = new Date(2026, 6, 15, 14, 8).getTime();
    localStorage.setItem(
      MESSAGES_STORAGE_KEY,
      JSON.stringify([
        {
          id: "persisted-message",
          from: "visitor",
          text: "Une discussion conservée",
          sentAt,
          status: "read",
        },
      ])
    );

    const { container } = render(<MessagesWindow />);
    const messageList = container.querySelector(".message-list");
    expect(messageList).toHaveTextContent("Une discussion conservée");
    expect(messageList).toHaveTextContent("14:08");
    expect(screen.getByText("Lu")).toBeInTheDocument();
  });

  test("sends clickable suggestions and changes Distribué to Lu after the reply", () => {
    const { container } = render(<MessagesWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Tes projets" }));

    expect(container.querySelector(".message-list")).toHaveTextContent(
      "Peux-tu me parler de tes projets ?"
    );
    expect(screen.getByText("Distribué")).toBeInTheDocument();
    expect(document.querySelector(".message-row.arriving")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Lu")).toBeInTheDocument();
    expect(container.querySelector(".message-list")).toHaveTextContent(
      "Tu peux ouvrir l’app Projets"
    );
  });

  test("persists new messages across a component remount", () => {
    const firstRender = render(<MessagesWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Ta stack" }));
    act(() => vi.advanceTimersByTime(750));
    firstRender.unmount();

    const secondRender = render(<MessagesWindow />);
    const messageList = secondRender.container.querySelector(".message-list");
    expect(messageList).toHaveTextContent("Quelle est ta stack technique ?");
    expect(messageList).toHaveTextContent("Ma stack est assez large");
  });

  test("clears the conversation and cancels a pending reply", () => {
    render(<MessagesWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Te contacter" }));
    expect(screen.getByLabelText("Milo écrit")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Effacer la conversation" })
    );
    expect(screen.queryByLabelText("Milo écrit")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));

    expect(
      screen.queryByText("Comment est-ce que je peux te contacter ?")
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Pour un vrai échange/)).not.toBeInTheDocument();
    expect(screen.getByText("Salut 👋 Bienvenue dans Messages !")).toBeInTheDocument();
  });

  test("opens the compact sidebar and removes every timer on unmount", () => {
    const { container, unmount } = render(<MessagesWindow />);
    expect(screen.queryByTitle("Nouvelle conversation")).not.toBeInTheDocument();

    const sidebarButton = screen.getByRole("button", {
      name: "Afficher les conversations",
    });
    fireEvent.click(sidebarButton);
    expect(sidebarButton).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector(".messages-app")).toHaveClass("sidebar-open");

    fireEvent.click(screen.getByRole("button", { name: "Tes projets" }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    // Purge les setTimeout(0) internes de jsdom (MessageChannel de React) :
    // seuls les timers applicatifs, tous > 0 ms, resteraient comptés.
    act(() => vi.advanceTimersByTime(0));
    expect(vi.getTimerCount()).toBe(0);
  });
});
