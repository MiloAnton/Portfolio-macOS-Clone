import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SafariWindow, {
  normalizeUrl,
  SAFARI_FAVORITES_STORAGE_KEY,
  SAFARI_HISTORY_STORAGE_KEY,
} from "./safari_window";

const navigateFromAddressBar = (value) => {
  const addressInput = screen.getByRole("textbox", { name: "Adresse web" });
  fireEvent.change(addressInput, { target: { value } });
  fireEvent.submit(addressInput.closest("form"));
};

describe("SafariWindow", () => {
  let originalOpen;

  beforeEach(() => {
    localStorage.clear();
    originalOpen = window.open;
    window.open = jest.fn();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  test("normalizes web addresses and rejects unsafe protocols", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com/");
    expect(normalizeUrl("http://example.com/path")).toBe(
      "http://example.com/path"
    );
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("   ")).toBeNull();
  });

  test("navigates from the address bar and swaps stop for reload after loading", () => {
    render(<SafariWindow />);

    navigateFromAddressBar("example.org");
    const iframe = screen.getByTitle("Safari — https://example.org/");
    expect(iframe).toHaveAttribute("src", "https://example.org/");
    expect(
      screen.getByRole("button", { name: "Arrêter le chargement" })
    ).toBeInTheDocument();

    fireEvent.load(iframe);
    expect(
      screen.getByRole("button", { name: "Recharger la page" })
    ).toBeInTheDocument();
  });

  test("ignores the load event from an iframe replaced by a newer navigation", () => {
    render(<SafariWindow />);

    navigateFromAddressBar("first.example");
    const oldIframe = screen.getByTitle("Safari — https://first.example/");
    navigateFromAddressBar("second.example");
    const currentIframe = screen.getByTitle(
      "Safari — https://second.example/"
    );

    fireEvent.load(oldIframe);
    expect(
      screen.getByRole("button", { name: "Arrêter le chargement" })
    ).toBeInTheDocument();

    fireEvent.load(currentIframe);
    expect(
      screen.getByRole("button", { name: "Recharger la page" })
    ).toBeInTheDocument();
  });

  test("supports address focus and reload shortcuts only while Safari is active", () => {
    const { rerender } = render(<SafariWindow isActive isVisible />);
    navigateFromAddressBar("example.org");
    const iframe = screen.getByTitle("Safari — https://example.org/");
    fireEvent.load(iframe);

    fireEvent.keyDown(document, { key: "l", metaKey: true });
    expect(screen.getByRole("textbox", { name: "Adresse web" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "r", ctrlKey: true });
    expect(
      screen.getByRole("button", { name: "Arrêter le chargement" })
    ).toBeInTheDocument();

    fireEvent.load(screen.getByTitle("Safari — https://example.org/"));
    rerender(<SafariWindow isActive={false} isVisible />);
    fireEvent.keyDown(document, { key: "r", ctrlKey: true });
    expect(
      screen.getByRole("button", { name: "Recharger la page" })
    ).toBeInTheDocument();
  });

  test("stops the current loading state without accepting its later load event", () => {
    render(<SafariWindow />);
    navigateFromAddressBar("example.org");
    const iframe = screen.getByTitle("Safari — https://example.org/");

    fireEvent.click(
      screen.getByRole("button", { name: "Arrêter le chargement" })
    );
    expect(
      screen.getByRole("button", { name: "Recharger la page" })
    ).toBeInTheDocument();

    fireEvent.load(iframe);
    expect(
      screen.getByRole("button", { name: "Recharger la page" })
    ).toBeInTheDocument();
  });

  test("adds and removes the current page from persistent favorites", async () => {
    render(<SafariWindow />);
    navigateFromAddressBar("portfolio.example");

    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" })
    );
    expect(
      screen.getByRole("button", { name: "Retirer des favoris" })
    ).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => {
      const storedFavorites = JSON.parse(
        localStorage.getItem(SAFARI_FAVORITES_STORAGE_KEY)
      );
      expect(storedFavorites).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: "https://portfolio.example/" }),
        ])
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Retirer des favoris" })
    );
    await waitFor(() => {
      const storedFavorites = JSON.parse(
        localStorage.getItem(SAFARI_FAVORITES_STORAGE_KEY)
      );
      expect(storedFavorites).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: "https://portfolio.example/" }),
        ])
      );
    });
  });

  test("persists visits and exposes a clearable history page", async () => {
    const { unmount } = render(<SafariWindow />);
    navigateFromAddressBar("first.example");
    navigateFromAddressBar("second.example");

    await waitFor(() => {
      const storedHistory = JSON.parse(
        localStorage.getItem(SAFARI_HISTORY_STORAGE_KEY)
      );
      expect(storedHistory).toHaveLength(2);
    });
    unmount();

    render(<SafariWindow />);
    fireEvent.click(
      screen.getByRole("button", { name: "Afficher l’historique" })
    );
    expect(screen.getByRole("heading", { name: "Historique" })).toBeInTheDocument();
    expect(screen.getByText("first.example")).toBeInTheDocument();
    expect(screen.getByText("second.example")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Effacer l’historique" })
    );
    expect(screen.getByText("Aucun historique")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(SAFARI_HISTORY_STORAGE_KEY))).toEqual([]);
  });

  test("keeps the external-tab escape hatch visible for iframe limitations", () => {
    render(<SafariWindow />);
    navigateFromAddressBar("blocked.example");

    expect(
      screen.getByText(/Il bloque probablement les iframes/)
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByText("Ouvrir dans un nouvel onglet").closest("button")
    );
    expect(window.open).toHaveBeenCalledWith(
      "https://blocked.example/",
      "_blank",
      "noopener,noreferrer"
    );
  });

  test("shows a clear validation error for an invalid address", () => {
    render(<SafariWindow />);
    navigateFromAddressBar("https://");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Saisissez une adresse web valide."
    );
    expect(screen.queryByTitle(/^Safari —/)).not.toBeInTheDocument();
  });
});
