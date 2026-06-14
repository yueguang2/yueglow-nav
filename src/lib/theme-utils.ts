import type { Theme } from "./types";
import { colorSchema } from "./validation";

function safeColor(value: string) {
  const parsed = colorSchema.safeParse(value);
  return parsed.success ? parsed.data : "#000000";
}

function styleVars(theme: Theme, mode: "dark" | "light") {
  if (theme.uiStyle === "classic") {
    const shadowColor = mode === "dark" ? "rgba(0, 0, 0," : "rgba(16, 22, 32,";
    const inset = mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.64)";

    return `
      --shadow-subtle: inset 0 1px 1px ${inset}, 0 1px 2px ${shadowColor} 0.08);
      --shadow-sm: inset 0 -1px 1px ${inset}, 0 2px 4px ${shadowColor} 0.08), 0 4px 8px ${shadowColor} 0.06);
      --shadow-md: inset 0 -1px 2px ${inset}, 0 4px 8px ${shadowColor} 0.1), 0 8px 16px ${shadowColor} 0.08);
      --shadow-lg: inset 0 -2px 3px ${inset}, 0 8px 16px ${shadowColor} 0.12), 0 16px 32px ${shadowColor} 0.1);
      --shadow-pressed: inset 0 2px 4px ${shadowColor} 0.18), inset 0 1px 2px ${shadowColor} 0.22);
      --elevated-shadow: var(--shadow-md);
      --elevated-shadow-hover: var(--shadow-lg);
      --radius-sm: 1rem;
      --radius-md: 1.5rem;
      --radius-lg: 2rem;
      --radius-xl: 2.5rem;
      --radius-full: 9999px;
    `;
  }

  return mode === "dark"
    ? `
      --shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.12);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.14);
      --shadow-md: 0 8px 20px rgba(0, 0, 0, 0.18);
      --shadow-lg: 0 14px 34px rgba(0, 0, 0, 0.24);
      --shadow-pressed: inset 0 1px 3px rgba(0, 0, 0, 0.22);
      --elevated-shadow: var(--shadow-sm);
      --elevated-shadow-hover: var(--shadow-md);
      --radius-sm: 0.5rem;
      --radius-md: 0.75rem;
      --radius-lg: 1rem;
      --radius-xl: 1.25rem;
      --radius-full: 9999px;
    `
    : `
      --shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.04);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 8px 20px rgba(0, 0, 0, 0.07);
      --shadow-lg: 0 14px 34px rgba(0, 0, 0, 0.1);
      --shadow-pressed: inset 0 1px 3px rgba(0, 0, 0, 0.08);
      --elevated-shadow: var(--shadow-sm);
      --elevated-shadow-hover: var(--shadow-md);
      --radius-sm: 0.5rem;
      --radius-md: 0.75rem;
      --radius-lg: 1rem;
      --radius-xl: 1.25rem;
      --radius-full: 9999px;
    `;
}

export function generateThemeCSS(theme: Theme): string {
  const colors = {
    darkBackground: safeColor(theme.darkBackground),
    darkForeground: safeColor(theme.darkForeground),
    darkAccent: safeColor(theme.darkAccent),
    darkAccent2: safeColor(theme.darkAccent2),
    darkPanel: safeColor(theme.darkPanel),
    darkPanelStrong: safeColor(theme.darkPanelStrong),
    darkCardBg: safeColor(theme.darkCardBg),
    darkFieldBg: safeColor(theme.darkFieldBg),
    lightBackground: safeColor(theme.lightBackground),
    lightForeground: safeColor(theme.lightForeground),
    lightAccent: safeColor(theme.lightAccent),
    lightAccent2: safeColor(theme.lightAccent2),
    lightPanel: safeColor(theme.lightPanel),
    lightPanelStrong: safeColor(theme.lightPanelStrong),
    lightCardBg: safeColor(theme.lightCardBg),
    lightFieldBg: safeColor(theme.lightFieldBg),
  };

  return `
    :root {
      --background: ${colors.darkBackground};
      --foreground: ${colors.darkForeground};
      --muted: color-mix(in srgb, ${colors.darkForeground} 58%, ${colors.darkBackground});
      --text-secondary: color-mix(in srgb, ${colors.darkForeground} 72%, transparent);
      --text-tertiary: color-mix(in srgb, ${colors.darkForeground} 52%, transparent);
      --text-faint: color-mix(in srgb, ${colors.darkForeground} 36%, transparent);
      --soft-text: color-mix(in srgb, ${colors.darkForeground} 58%, transparent);
      --accent: ${colors.darkAccent};
      --accent-2: ${colors.darkAccent2};
      --panel: ${colors.darkPanel};
      --panel-strong: ${colors.darkPanelStrong};
      --card-bg: ${colors.darkCardBg};
      --field-bg: ${colors.darkFieldBg};
      --control-bg: ${colors.darkPanel};
      --line: rgba(238, 244, 255, 0.12);
      --accent-foreground: ${colors.darkBackground};
      ${styleVars(theme, "dark")}
    }

    :root[data-theme="light"] {
      --background: ${colors.lightBackground};
      --foreground: ${colors.lightForeground};
      --muted: color-mix(in srgb, ${colors.lightForeground} 58%, ${colors.lightBackground});
      --text-secondary: color-mix(in srgb, ${colors.lightForeground} 72%, transparent);
      --text-tertiary: color-mix(in srgb, ${colors.lightForeground} 52%, transparent);
      --text-faint: color-mix(in srgb, ${colors.lightForeground} 36%, transparent);
      --soft-text: color-mix(in srgb, ${colors.lightForeground} 58%, transparent);
      --accent: ${colors.lightAccent};
      --accent-2: ${colors.lightAccent2};
      --panel: ${colors.lightPanel};
      --panel-strong: ${colors.lightPanelStrong};
      --card-bg: ${colors.lightCardBg};
      --field-bg: ${colors.lightFieldBg};
      --control-bg: ${colors.lightPanel};
      --line: rgba(16, 22, 32, 0.12);
      --accent-foreground: #ffffff;
      ${styleVars(theme, "light")}
    }

    ${theme.useBackdropBlur ? `
      .glass, .surface {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
    ` : `
      .glass, .surface {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    `}

    ${theme.useGradientGlow ? `
      body {
        background:
          radial-gradient(circle at 18% 10%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 24rem),
          var(--background) !important;
      }
    ` : `
      body {
        background: var(--background) !important;
      }
    `}
  `;
}
