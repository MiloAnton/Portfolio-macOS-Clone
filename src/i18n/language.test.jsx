import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  LANGUAGE_STORAGE_KEY,
  LanguageProvider,
  useLanguage,
} from "./language";

function Probe() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button type="button" onClick={toggleLanguage}>
      {language}
    </button>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    document.documentElement.lang = "fr";
  });

  test("defaults to French, toggles and persists the choice", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByRole("button")).toHaveTextContent("fr");

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  test("restores the persisted language", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByRole("button")).toHaveTextContent("en");
  });
});
