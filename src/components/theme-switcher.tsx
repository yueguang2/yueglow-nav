"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

type ThemePreference = "light" | "dark";

const modes: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
];

function applyTheme(value: ThemePreference) {
  const root = document.documentElement;

  root.dataset.themePreference = value;
  root.dataset.theme = value;
  root.style.colorScheme = value;
}

function systemTheme(): ThemePreference {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function normalizeTheme(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : systemTheme();
}

function initialTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "light";
  }

  const initial = normalizeTheme(document.documentElement.dataset.theme ?? window.localStorage.getItem("nav-theme"));
  window.localStorage.setItem("nav-theme", initial);
  applyTheme(initial);
  return initial;
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key !== "nav-theme") {
        return;
      }

      const nextTheme = normalizeTheme(event.newValue);
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  function updateTheme(value: ThemePreference) {
    window.localStorage.setItem("nav-theme", value);
    setTheme(value);
    applyTheme(value);
  }

  return (
    <div className={clsx("inline-flex rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] p-1", compact && "w-full")}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = theme === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => updateTheme(mode.value)}
            className={clsx(
              "focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
              compact && "flex-1",
              active ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_22%,transparent)]" : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
            )}
            aria-pressed={active}
          >
            <Icon className="size-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
