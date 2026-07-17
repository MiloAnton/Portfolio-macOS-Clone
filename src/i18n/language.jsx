import { createContext, useContext, useEffect, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "portfolio-language";

const LanguageContext = createContext({
  language: "fr",
  toggleLanguage: () => {},
});

const loadLanguage = () => {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "fr";
  } catch (error) {
    return "fr";
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(loadLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // La langue choisie reste active pour la session.
    }
  }, [language]);

  const toggleLanguage = () =>
    setLanguage((current) => (current === "fr" ? "en" : "fr"));

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
