import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MainWindow from "./main_window";
import { LANGUAGE_STORAGE_KEY, LanguageProvider } from "../../i18n/language";

describe("MainWindow", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders the English curriculum when the language is English", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    render(
      <LanguageProvider>
        <MainWindow />
      </LanguageProvider>
    );

    expect(screen.getByRole("link", { name: "Contact me" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download my resume" })
    ).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Software Engineer")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Table of contents" })
    ).toBeInTheDocument();
  });

  test("renders each section animation cascade declaratively", () => {
    const { container } = render(<MainWindow />);
    const sections = container.querySelectorAll(".iconesStack");

    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section) => {
      expect(section.children[0]).toHaveStyle({ animationDelay: "0s" });
      expect(section.children[1]).toHaveStyle({ animationDelay: "0.08s" });
    });
  });

  test("exposes an accessible table of contents and scrolls to its sections", () => {
    render(<MainWindow />);
    const navigation = screen.getByRole("navigation", {
      name: "Sommaire du curriculum",
    });

    expect(screen.getByRole("button", { name: /profil/i })).toHaveAttribute(
      "aria-current",
      "location"
    );
    expect(withinNavigation(navigation)).toEqual([
      "01Profil",
      "02Stack",
      "03Expériences",
      "04Formation",
    ]);

    fireEvent.click(screen.getByRole("button", { name: /stack/i }));
    expect(document.getElementById("stack").scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(screen.getByRole("button", { name: /stack/i })).toHaveAttribute(
      "aria-current",
      "location"
    );
  });

  test("opens Milo's LinkedIn profile from the contact action", () => {
    render(<MainWindow />);

    expect(screen.getByRole("link", { name: "Me contacter" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/milo-roche-vandenbroucque/"
    );
    expect(screen.getByRole("link", { name: "Me contacter" })).toHaveAttribute(
      "target",
      "_blank"
    );
  });

  test("downloads the shared real CV from the profile header", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    render(<MainWindow />);

    fireEvent.click(screen.getByRole("button", { name: "Télécharger le CV" }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});

const withinNavigation = (navigation) =>
  Array.from(navigation.querySelectorAll("button"), (button) => button.textContent);
