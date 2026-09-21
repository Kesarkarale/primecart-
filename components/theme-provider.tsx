"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] =
    useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Load saved theme
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

    setMounted(true);
  }, []);

  // Apply theme globally
  useEffect(() => {
    if (!mounted) return;

    const applyTheme = () => {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      const finalTheme =
        theme === "system"
          ? systemPrefersDark
            ? "dark"
            : "light"
          : theme;

      // Remove previous theme
      document.documentElement.classList.remove(
        "light",
        "dark"
      );

      // Add current theme
      document.documentElement.classList.add(finalTheme);

      // Browser native controls also follow theme
      document.documentElement.style.colorScheme =
        finalTheme;

      setResolvedTheme(finalTheme);
    };

    applyTheme();

    // Listen for system theme changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      const handleChange = () => {
        applyTheme();
      };

      mediaQuery.addEventListener(
        "change",
        handleChange
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleChange
        );
      };
    }
  }, [theme, mounted]);

 function setTheme(themeValue: Theme) {
  setThemeState(themeValue);

  localStorage.setItem("primecart-theme", themeValue);

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const finalTheme =
    themeValue === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : themeValue;

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(finalTheme);

  document.documentElement.style.colorScheme = finalTheme;

  setResolvedTheme(finalTheme);
}

  function toggleTheme() {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
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
