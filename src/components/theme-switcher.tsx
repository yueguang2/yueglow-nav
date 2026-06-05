"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

type ThemePreference = "light" | "dark";

const modes: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
];

const reactActiveClassName = "bg-[var(--accent)] text-[var(--accent-foreground)]";
const nativeActiveClassName = "data-[active=true]:bg-[var(--accent)] data-[active=true]:text-[var(--accent-foreground)]";
const inactiveClassName = "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]";

const THEME_STORAGE_KEY = "nav-theme";
const THEME_CHANGE_EVENT = "nav-theme-change";

function applyTheme(value: ThemePreference) {
  const root = document.documentElement;

  root.dataset.themePreference = value;
  root.dataset.theme = value;
  root.style.colorScheme = value;
}

function systemTheme(): ThemePreference {
  if (typeof window === "undefined") return "dark";

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
}

function normalizeTheme(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : systemTheme();
}

function storedTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistTheme(value: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    // The DOM theme still changes even if storage is unavailable.
  }
}

function currentTheme(): ThemePreference {
  if (typeof window === "undefined") return "dark";

  return normalizeTheme(storedTheme() || document.documentElement.dataset.theme);
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<ThemePreference | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const initial = currentTheme();

      setTheme(initial);
      applyTheme(initial);
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = normalizeTheme(event.newValue);
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    const handleLocalChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<ThemePreference>).detail;

      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(THEME_CHANGE_EVENT, handleLocalChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, handleLocalChange);
    };
  }, []);

  function updateTheme(value: ThemePreference) {
    setTheme(value);
    persistTheme(value);
    applyTheme(value);
    window.dispatchEvent(new CustomEvent<ThemePreference>(THEME_CHANGE_EVENT, { detail: value }));
  }

  return (
    <div
      role="radiogroup"
      data-theme-switcher
      data-theme-switcher-version="native-fallback-v1"
      className={clsx("inline-flex rounded-xl border border-[var(--line)] bg-[var(--control-bg)] p-0.5", compact && "w-full")}
      suppressHydrationWarning
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = theme === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            data-theme-value={mode.value}
            data-active={theme === null ? undefined : active ? "true" : "false"}
            onClick={() => updateTheme(mode.value)}
            className={clsx(
              "inline-flex min-h-10 cursor-pointer touch-manipulation select-none items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors",
              compact && "flex-1",
              nativeActiveClassName,
              active && reactActiveClassName,
              !active && inactiveClassName,
            )}
            aria-label={mode.label}
            aria-pressed={active}
            suppressHydrationWarning
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
