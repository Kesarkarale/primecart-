"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext =
  createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("light");

  const [resolvedTheme, setResolvedTheme] =
    useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "primecart-theme"
    ) as Theme | null;

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      const finalTheme =
        theme === "system"
          ? systemDark
            ? "dark"
            : "light"
          : theme;

      root.classList.remove("light", "dark");
      root.classList.add(finalTheme);

      root.style.colorScheme = finalTheme;

      setResolvedTheme(finalTheme);
    };

    applyTheme();

    if (theme === "system") {
      const media = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      media.addEventListener("change", applyTheme);

      return () => {
        media.removeEventListener(
          "change",
          applyTheme
        );
      };
    }
  }, [theme]);

  function setTheme(themeValue: Theme) {
    setThemeState(themeValue);
    localStorage.setItem(
      "primecart-theme",
      themeValue
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
