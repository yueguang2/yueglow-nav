import type { Theme } from "./types";

export function generateThemeCSS(theme: Theme): string {
  return `
    :root {
      --background: ${theme.darkBackground};
      --foreground: ${theme.darkForeground};
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
