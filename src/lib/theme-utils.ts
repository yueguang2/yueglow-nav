import type { Theme } from "./types";

export function generateThemeCSS(theme: Theme): string {
  return `
    :root {
      --background: ${theme.darkBackground};
      --foreground: ${theme.darkForeground};
      --muted: color-mix(in srgb, ${theme.darkForeground} 58%, ${theme.darkBackground});
      --text-secondary: color-mix(in srgb, ${theme.darkForeground} 72%, transparent);
      --text-tertiary: color-mix(in srgb, ${theme.darkForeground} 52%, transparent);
      --text-faint: color-mix(in srgb, ${theme.darkForeground} 36%, transparent);
      --soft-text: color-mix(in srgb, ${theme.darkForeground} 58%, transparent);
      --accent: ${theme.darkAccent};
      --accent-2: ${theme.darkAccent2};
      --panel: ${theme.darkPanel};
      --panel-strong: ${theme.darkPanelStrong};
      --card-bg: ${theme.darkCardBg};
      --field-bg: ${theme.darkFieldBg};
      --control-bg: ${theme.darkPanel};
      --line: rgba(238, 244, 255, 0.12);
      --accent-foreground: ${theme.darkBackground};
    }

    :root[data-theme="light"] {
      --background: ${theme.lightBackground};
      --foreground: ${theme.lightForeground};
      --muted: color-mix(in srgb, ${theme.lightForeground} 58%, ${theme.lightBackground});
      --text-secondary: color-mix(in srgb, ${theme.lightForeground} 72%, transparent);
      --text-tertiary: color-mix(in srgb, ${theme.lightForeground} 52%, transparent);
      --text-faint: color-mix(in srgb, ${theme.lightForeground} 36%, transparent);
      --soft-text: color-mix(in srgb, ${theme.lightForeground} 58%, transparent);
      --accent: ${theme.lightAccent};
      --accent-2: ${theme.lightAccent2};
      --panel: ${theme.lightPanel};
      --panel-strong: ${theme.lightPanelStrong};
      --card-bg: ${theme.lightCardBg};
      --field-bg: ${theme.lightFieldBg};
      --control-bg: ${theme.lightPanel};
      --line: rgba(16, 22, 32, 0.12);
      --accent-foreground: #ffffff;
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

    ${!theme.useGradientGlow ? `
      body {
        background: var(--background) !important;
      }
    ` : ''}
  `;
}
